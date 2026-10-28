import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FolderList from '../components/FolderList';
import FolderChipSection from '../components/FolderChipSection';
import BookmarkListItem from '../components/ui/BookmarkListItem';
import ReactDOM from 'react-dom';
import { useNavigate, useOutletContext, useParams } from 'react-router';

import {
  findNodeById,
  findPathToNode,
  separateFolderAndBookmarks,
} from '../utils/bookmarkTreeUtils';
import type { DragMode, SortType } from '../layout/RootLayout';
import { sortBookmarks } from '../utils/sortBookmarks';
import { applyManualOrder } from '../utils/applyManualOrder';
import { usePinnedBookmarks } from '../features/pin/usePinnedBookmarks';
import { useConfirm } from '../ConfirmContext';
import { sortFolders } from '../utils/sortFolders';
import { useBookmarksData } from '../BookmarksContext';
import TextButton from '../components/ui/TextButton';
import { useFolderActions } from '../hooks/useFoldersActions';
import toast from 'react-hot-toast';
import { CreateUrlParams, useUrlActions } from '../hooks/useUrlActions';
import BookmarkEditModal from '../components/BookmarkEditModal';
import FolderEditModal from '../components/FolderEditModal';

import {
  loadFolderColorMap,
  saveFolderColorMap,
} from '../features/folderColor/storage';
import { DEFAULT_COLOR_TOKEN } from '../features/folderColor/constants';

export type OutletContextType = {
  sortType: SortType;
  keyword: string;
  onChangeSort: (type: SortType) => void;
  dragMode: DragMode;
};

export default function DetailPage() {
  const { t, i18n } = useTranslation();
  const confirm = useConfirm();
  const DND_JSON_MIME = 'application/x-bookmark-dnd';
  const navigate = useNavigate();

  const listRef = useRef<HTMLDivElement>(null);
  const { folderId } = useParams<{ folderId: string }>();
  const { data, status, reloadBookmarks } = useBookmarksData();

  const { sortType, keyword, onChangeSort } =
    useOutletContext<OutletContextType>();

  const rootNodes = data?.[0]?.children ?? [];
  const [isRootDragHover, setIsRootDragHover] = useState(false);
  const rootEnterCounterRef = useRef(0);
  const { bookmarkBarRoot, otherRoot } = useMemo(() => {
    const bookmarkBar = rootNodes.find((n: BookmarkItemType) => n.id === '1');

    const other =
      rootNodes.find((n: BookmarkItemType) => n.id === '2') ??
      rootNodes.find((n: BookmarkItemType) => n.id !== '1');

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

  const { bookmarks, folders } = separateFolderAndBookmarks(children);
  const { createUrl } = useUrlActions();
  const [isOpenBookmarkEdit, setIsOpenBookmarkEdit] = useState(false);
  const [isOpenFolderEdit, setIsOpenFolderEdit] = useState(false);

  const sortedBookmarks = useMemo(
    () => sortBookmarks(bookmarks, sortType, i18n.language),
    [bookmarks, sortType, i18n.language],
  );

  const { isPinned, toggle: togglePin } = usePinnedBookmarks(folderId);

  // 표시 순서: 고정(핀)된 북마크를 위로, 각 그룹 내부는 정렬 순서를 유지
  const displayBookmarks = useMemo(() => {
    const pinned = sortedBookmarks.filter((b) => isPinned(b.id));
    const rest = sortedBookmarks.filter((b) => !isPinned(b.id));
    return [...pinned, ...rest];
  }, [sortedBookmarks, isPinned]);

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

  const sortedFolders = useMemo(
    () => sortFolders(folders, sortType),
    [folders, sortType],
  );

  const filteredFolders = useMemo(() => {
    if (!normalizedKeyword) return sortedFolders;
    return sortedFolders.filter((folder) => {
      const title = folder.title.toLowerCase() ?? '';
      return title.includes(normalizedKeyword);
    });
  }, [sortedFolders, normalizedKeyword]);

  // 칩 섹션: 상위 폴더 + 형제 폴더 (현재 폴더 활성 표시)
  const parentFolder = useMemo(() => {
    if (!folderId) return undefined;
    const path = findPathToNode(data?.[0]?.children ?? [], folderId);
    if (!path || path.length < 2) return undefined;
    return path[path.length - 2];
  }, [data, folderId]);

  const filteredSiblings = useMemo(() => {
    const siblingSource = parentFolder
      ? (parentFolder.children ?? [])
      : rootNodes;
    const { folders: siblingFolders } =
      separateFolderAndBookmarks(siblingSource);
    const sorted = sortFolders(siblingFolders, sortType);

    if (!normalizedKeyword) return sorted;
    return sorted.filter((folder) => {
      if (String(folder.id) === String(folderId)) return true;
      const title = folder.title.toLowerCase() ?? '';
      return title.includes(normalizedKeyword);
    });
  }, [parentFolder, rootNodes, sortType, normalizedKeyword, folderId]);

  const folderChipMatchCount = useMemo(() => {
    if (!normalizedKeyword) return 0;
    const siblingMatches = filteredSiblings.filter(
      (folder) => String(folder.id) !== String(folderId),
    ).length;
    return filteredFolders.length + siblingMatches;
  }, [normalizedKeyword, filteredSiblings, filteredFolders, folderId]);

  // 사이드바 아코디언: 현재 폴더까지의 경로는 항상 펼침
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!folderId || !data) return;
    const path = findPathToNode(data[0]?.children ?? [], folderId);
    if (!path) return;

    setExpandedIds((prev) => {
      const missing = path.filter((node) => !prev.has(String(node.id)));
      if (missing.length === 0) return prev;

      const next = new Set(prev);
      missing.forEach((node) => next.add(String(node.id)));
      return next;
    });
  }, [folderId, data]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const { createFolder } = useFolderActions();
  const handleSubmitFolder = async (name: string) => {
    try {
      const newFolder = await createFolder({
        title: name,
        parentId: folderId,
      });
      const currentMap = await loadFolderColorMap();
      const nextMap = {
        ...currentMap,
        [newFolder.id]: DEFAULT_COLOR_TOKEN,
      };
      await saveFolderColorMap(nextMap);

      await reloadBookmarks();
      setIsOpenFolderEdit(false);
    } catch (error) {
      console.error('폴더 생성 실패:', error);
    }
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

  const onRootDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    rootEnterCounterRef.current += 1;
    setIsRootDragHover(true);
  };

  const onRootDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    rootEnterCounterRef.current -= 1;

    if (rootEnterCounterRef.current <= 0) {
      rootEnterCounterRef.current = 0;
      setIsRootDragHover(false);
    }
  };

  const onRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const onRootDrop = async (e: React.DragEvent, destinationRootId: string) => {
    e.preventDefault();
    e.stopPropagation();

    rootEnterCounterRef.current = 0;
    setIsRootDragHover(false);

    const draggedId = getDraggedId(e);
    if (!draggedId) return;

    setIsRootDropping(true);

    try {
      await chrome.bookmarks.move(draggedId, { parentId: destinationRootId });
      await reloadBookmarks();
      toast.success(t('toast.movedToRoot'));
    } catch (err) {
      console.error('루트 이동 실패:', err);
      toast.error(t('toast.moveFailed'));
    } finally {
      setIsRootDropping(false);
    }
  };

  const handleReorder = async (
    draggedId: string,
    targetId: string,
    placeBelow: boolean,
  ) => {
    if (!folderId) return;

    const dragged = String(draggedId);
    const target = String(targetId);
    if (dragged === target) return;
    // 고정된 북마크는 순서 고정 → 순서 이동 대상에서 제외
    if (isPinned(dragged)) return;

    // 기준 순서: manual이면 네이티브 순서, 아니면 현재 정렬(recent/name) 순서.
    // 핀은 표시 전용 오버레이이므로 기준 순서에는 반영하지 않는다.
    const baseIds = (sortType === 'manual' ? bookmarks : sortedBookmarks).map(
      (b) => String(b.id),
    );
    // 드래그 대상이 이 폴더의 북마크가 아니면(예: 폴더 드래그) 순서 이동 대상이 아님
    if (!baseIds.includes(dragged) || !baseIds.includes(target)) return;

    // 표시 순서 기준 삽입 위치 계산
    const without = baseIds.filter((x) => x !== dragged);
    let insertAt = without.indexOf(target);
    if (insertAt === -1) return;
    if (placeBelow) insertAt += 1;
    without.splice(insertAt, 0, dragged);

    // 순서 변화가 없으면 아무것도 하지 않음
    if (without.join(' ') === baseIds.join(' ')) return;

    // recent/name 정렬 중이면: 수동 순서 전환 동의를 받고 전환
    if (sortType !== 'manual') {
      const ok = await confirm({
        title: t('sort.manual'),
        message: t('confirm.switchToManual'),
      });
      if (!ok) return;
      onChangeSort('manual');
    }

    try {
      // 최적화용 "현재 순서"는 크롬의 실제(네이티브) 순서여야 한다.
      // recent/name 모드에서는 화면 순서와 네이티브 순서가 다르기 때문.
      const nativeOrder = bookmarks.map((b) => String(b.id));
      await applyManualOrder(without, folderId, nativeOrder);
      await reloadBookmarks();
      toast.success(t('toast.reordered'));
    } catch (err) {
      console.error('순서 변경 실패:', err);
      toast.error(t('toast.moveFailed'));
    }
  };

  const goToFolder = (id: string) => {
    navigate(`/bookmark/${id}`);
  };

  const createOpenhandler = () => {
    setIsOpenBookmarkEdit(true);
  };
  const handleSubmitBookmark = ({ title, url }: CreateUrlParams) => {
    createUrl({ title, url, parentId: folderId ?? '1' });
    reloadBookmarks();
    setIsOpenBookmarkEdit(false);
  };

  const createOpenHandlerFolder = () => {
    setIsOpenFolderEdit(true);
  };

  if (status !== 'success' || !data) {
    return null;
  }

  const hasSearch = normalizedKeyword.length > 0;
  const hasResult = (filteredList?.length ?? 0) > 0;
  if (!data) return <div>{t('error.dataLoad')}</div>;
  return (
    <div>
      <div className="w-full mx-auto flex flex-col gap-3 pb-25 pt-6">
        <FolderChipSection
          parentFolder={parentFolder}
          siblings={filteredSiblings}
          childFolders={filteredFolders}
          currentFolderId={folderId}
        />
        {sortedBookmarks.length === 0 ? (
          hasSearch && folderChipMatchCount > 0 ? null : (
            <div className="flex mt-4 text-sm text-gray-400 justify-center text-center">
              {t('section.bookmarkEmpty')}
            </div>
          )
        ) : hasSearch ? (
          hasResult ? (
            (filteredList ?? []).map((bookmark) => (
              <BookmarkListItem
                key={bookmark.id}
                url={bookmark.url}
                title={bookmark.title}
                id={bookmark.id}
                dateAdded={bookmark.dateAdded}
                isPinned={isPinned(bookmark.id)}
                onTogglePin={() => togglePin(bookmark.id)}
              />
            ))
          ) : folderChipMatchCount > 0 ? null : (
            <p className="flex mt-4 text-sm text-gray-400 justify-center text-center">
              {t('search.noResult')}
            </p>
          )
        ) : (
          displayBookmarks.map((bookmark) => (
            <BookmarkListItem
              key={bookmark.id}
              url={bookmark.url}
              title={bookmark.title}
              id={bookmark.id}
              dateAdded={bookmark.dateAdded}
              onReorder={handleReorder}
              isPinned={isPinned(bookmark.id)}
              onTogglePin={() => togglePin(bookmark.id)}
            />
          ))
        )}
      </div>
      {/* 좌측 폴더 리스트 */}
      {ReactDOM.createPortal(
        <div
          ref={listRef}
          className="left-side fixed left-20 top-[33.333%] bottom-6 min-w-0 w-[200px] flex flex-col mb-12"
        >
          <div className="flex flex-col gap-8 items-start min-h-0 flex-1 w-full">
            <div className="flex justify-between items-center w-full px-6">
              <TextButton
                buttonName={t('action.newFolder')}
                onClick={createOpenHandlerFolder}
                className="text-xs button__text button__text__add cursor-pointer"
              />
              <span className="text-xs text-(--text-main)">|</span>
              <TextButton
                buttonName={t('action.newBookmark')}
                className="text-xs button__text button__text__add cursor-pointer"
                onClick={createOpenhandler}
              />
            </div>
            {otherSideRootNode && (
              <button
                type="button"
                onClick={() => goToFolder(otherSideRootNode.id)}
                onDragEnter={onRootDragEnter}
                onDragLeave={onRootDragLeave}
                onDragOver={onRootDragOver}
                onDrop={(e) => onRootDrop(e, String(otherSideRootNode.id))}
                className={[
                  'glass',
                  'glass--hover',
                  'flex w-full min-w-0 justify-center items-center gap-2',
                  'rounded-[10rem] px-2 py-3',
                  'border border-white/10',
                  isRootDropping ? 'opacity-60' : '',
                  isRootDragHover ? 'outline-2 outline-(--text-hover)' : '',
                ].join(' ')}
                title={t('dnd.dropHint')}
              >
                <span className="text-sm opacity-70">↔</span>
                <span className="text-xs font-semibold truncate">
                  {otherSideRootNode.title}
                </span>
              </button>
            )}
            <ul className="flex flex-col gap-2 min-w-0 w-[200px] wrap hide-scrollbar overflow-y-auto flex-1 min-h-0">
              {currentRootNode ? (
                <FolderList
                  node={currentRootNode}
                  folderId={folderId}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                />
              ) : (
                <p className="text-sm text-gray-400">
                  {t('error.folderRootNotFound')}
                </p>
              )}
            </ul>
          </div>
          <div className="h-6" />
        </div>,
        document.body,
      )}
      {isOpenBookmarkEdit &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center"
            onClick={() => setIsOpenBookmarkEdit(false)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div
              className="relative z-10001"
              onClick={(e) => e.stopPropagation()}
            >
              <BookmarkEditModal
                mode="new"
                initialValue={{ title: '', url: '' }}
                onCancel={() => setIsOpenBookmarkEdit(false)}
                onSubmit={handleSubmitBookmark}
              />
            </div>
          </div>,
          document.body,
        )}
      {isOpenFolderEdit &&
        ReactDOM.createPortal(
          <>
            {/* 화면 전체 덮는 오버레이 */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-9998"
              onClick={() => {
                setIsOpenFolderEdit(false);
              }}
            ></div>
            <div
              className="fixed z-9999 inset-0 flex justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderEditModal
                type="new"
                onCancel={() => setIsOpenFolderEdit(false)}
                onSubmit={handleSubmitFolder}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
