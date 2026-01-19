import { useMemo, useRef, useState } from 'react';
import FolderList from '../components/FolderList';
import BookmarkListItem from '../components/ui/BookmarkListItem';
import ReactDOM from 'react-dom';
import { useNavigate, useOutletContext, useParams } from 'react-router';

import {
  findNodeById,
  separateFolderAndBookmarks,
} from '../utils/bookmarkTreeUtils';
import type { SortType } from '../layout/RootLayout';
import { sortBookmarks } from '../utils/sortBookmarks';
import { useBookmarksData } from '../BookmarksContext';
import TextButton from '../components/ui/TextButton';
import { useFolderActions } from '../hooks/useFoldersActions';
import toast from 'react-hot-toast';
import { CreateUrlParams, useUrlActions } from '../hooks/useUrlActions';
import BookmarkEditModal from '../components/BookmarkEditModal';

export type OutletContextType = {
  sortType: SortType;
  keyword: string;
};

export default function DetailPage() {
  const DND_JSON_MIME = 'application/x-bookmark-dnd';
  const navigate = useNavigate();

  const listRef = useRef<HTMLDivElement>(null);
  const { folderId } = useParams<{ folderId: string }>();
  const { data, status, reloadBookmarks } = useBookmarksData();

  const { sortType, keyword } = useOutletContext<OutletContextType>();

  const rootNodes = data?.[0]?.children ?? [];

  const { bookmarkBarRoot, otherRoot } = useMemo(() => {
    const bookmarkBar = rootNodes.find(
      (n: BookmarkItemType) => n.title === '북마크바',
    );

    const other =
      rootNodes.find((n: BookmarkItemType) => n.title === '기타 북마크') ??
      rootNodes.find((n: BookmarkItemType) => n.title !== '북마크바');

    return { bookmarkBarRoot: bookmarkBar, otherRoot: other };
  }, [rootNodes]);

  const isInBookmarkBar = useMemo(() => {
    if (!folderId) return false;
    if (!bookmarkBarRoot) return false;

    return Boolean(findNodeById([bookmarkBarRoot], folderId));
  }, [folderId, bookmarkBarRoot]);

  const currentRootNode = isInBookmarkBar ? bookmarkBarRoot : otherRoot;
  const otherSideRootNode = isInBookmarkBar ? otherRoot : bookmarkBarRoot;

  const targetFolder = folderId ? findNodeById(rootNodes, folderId) : undefined;
  const children = targetFolder?.children ?? [];

  const { bookmarks } = separateFolderAndBookmarks(children);
  const { createUrl } = useUrlActions();
  const [isOpen, setIsOpen] = useState(false);

  const sortedBookmarks = useMemo(
    () => sortBookmarks(bookmarks, sortType),
    [bookmarks, sortType],
  );

  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredList = useMemo(() => {
    if (!normalizedKeyword) return [];
    if (normalizedKeyword) {
      return sortedBookmarks.filter((bookmark) => {
        const title = bookmark.title.toLowerCase() ?? '';
        return title.includes(normalizedKeyword);
      });
    }
    return [];
  }, [sortedBookmarks, normalizedKeyword]);

  const { createFolder } = useFolderActions();

  const createFolderHandler = () => {
    if (!folderId) return;
    confirm('이 폴더에 새 폴더를 생성하시겠습니까?') &&
      createFolder({ title: '새 폴더', parentId: folderId });
  };

  const [isRootDropping, setIsRootDropping] = useState(false);

  const getDraggedId = (e: React.DragEvent) => {
    const json = e.dataTransfer.getData(DND_JSON_MIME);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (parsed?.id) return String(parsed.id);
      } catch (err) {
        console.error('Failed to parse DND JSON:', err);
      }
    }
    const plain = e.dataTransfer.getData('text/plain');
    if (!plain) return '';
    if (plain.startsWith('folder:')) return plain.replace('folder:', '');
    if (plain.startsWith('bookmark:')) return plain.replace('bookmark:', '');
    return plain;
  };

  const onRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const onRootDrop = async (e: React.DragEvent, destinationRootId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = getDraggedId(e);
    if (!draggedId) return;

    setIsRootDropping(true);

    try {
      await chrome.bookmarks.move(draggedId, { parentId: destinationRootId });
      await reloadBookmarks();
      toast.success('루트로 이동되었습니다!');
    } catch (err) {
      console.error('루트 이동 실패:', err);
      toast.error('이동에 실패했습니다.');
    } finally {
      setIsRootDropping(false);
    }
  };

  const goToFolder = (id: string) => {
    navigate(`/bookmark/${id}`);
  };

  const createOpenhandler = () => {
    setIsOpen(true);
  };
  const handleSubmit = ({ title, url }: CreateUrlParams) => {
    createUrl({ title, url, parentId: folderId ?? '1' });
    reloadBookmarks();
    setIsOpen(false);
  };

  if (status !== 'success' || !data) {
    return null;
  }

  const hasSearch = normalizedKeyword.length > 0;
  const hasResult = (filteredList?.length ?? 0) > 0;
  if (!data) return <div>데이터를 불러오지 못했습니다.</div>;
  return (
    <div>
      <div className="w-full mx-auto flex flex-col gap-3 pb-25 pt-6">
        {sortedBookmarks.length === 0 ? (
          <div className="flex mt-4 text-sm text-gray-400 justify-center text-center">
            북마크가 없습니다.
          </div>
        ) : hasSearch ? (
          hasResult ? (
            (filteredList ?? []).map((bookmark) => (
              <BookmarkListItem
                key={bookmark.id}
                url={bookmark.url}
                title={bookmark.title}
                id={bookmark.id}
                dateAdded={bookmark.dateAdded}
              />
            ))
          ) : (
            <p className="flex mt-4 text-sm text-gray-400 justify-center text-center">
              검색 결과가 없습니다.
            </p>
          )
        ) : (
          sortedBookmarks.map((bookmark) => (
            <BookmarkListItem
              key={bookmark.id}
              url={bookmark.url}
              title={bookmark.title}
              id={bookmark.id}
              dateAdded={bookmark.dateAdded}
            />
          ))
        )}
      </div>
      {/* 좌측 폴더 리스트 */}
      {ReactDOM.createPortal(
        <div
          ref={listRef}
          className="left-side fixed left-20 top-[33.333%] max-h-[calc(100vh-33.333%-16px)] overflow-y-auto wrap"
        >
          <div className="flex flex-col gap-8 items-start">
            <div className="flex justify-between items-center w-full px-6">
              <TextButton
                buttonName="+ 새폴더"
                onClick={createFolderHandler}
                className="text-xs button__text cursor-pointer"
              />
              <span className="text-xs text-(--color-gray-light)">|</span>
              <TextButton
                buttonName="+ 새북마크"
                className="text-xs button__text cursor-pointer"
                onClick={createOpenhandler}
              />
            </div>
            {otherSideRootNode && (
              <button
                type="button"
                onClick={() => goToFolder(otherSideRootNode.id)}
                onDragOver={onRootDragOver}
                onDrop={(e) => onRootDrop(e, String(otherSideRootNode.id))}
                className={[
                  'glass',
                  'glass--hover',
                  'flex w-full min-w-0 justify-center items-center gap-2',
                  'rounded-[10rem] px-2 py-3',
                  'border border-white/10',
                  isRootDropping ? 'opacity-60' : '',
                ].join(' ')}
                title="여기로 드롭하면 반대 루트로 이동"
              >
                <span className="text-sm opacity-70">↔</span>
                <span className="text-xs font-semibold truncate">
                  {otherSideRootNode.title}
                </span>
              </button>
            )}
            <ul className="flex flex-col justify-start items-start gap-2">
              {currentRootNode ? (
                <FolderList node={currentRootNode} folderId={folderId} />
              ) : (
                <p className="text-sm text-gray-400">
                  폴더 루트를 찾지 못했습니다.
                </p>
              )}
            </ul>
          </div>
        </div>,
        document.body,
      )}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative z-10001"
              onClick={(e) => e.stopPropagation()}
            >
              <BookmarkEditModal
                mode="new"
                initialValue={{ title: '', url: '' }}
                onCancel={() => setIsOpen(false)}
                onSubmit={handleSubmit}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
