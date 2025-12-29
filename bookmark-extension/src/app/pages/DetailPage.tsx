import { useMemo, useRef } from 'react';
import FolderList from '../components/FolderList';
import BookmarkListItem from '../components/ui/BookmarkListItem';
import ReactDOM from 'react-dom';
import { useOutletContext, useParams } from 'react-router';

import {
  findNodeById,
  separateFolderAndBookmarks,
} from '../utils/bookmarkTreeUtils';
import type { SortType } from '../layout/RootLayout';
import { sortBookmarks } from '../utils/sortBookmarks';
import { useBookmarksData } from '../BookmarksContext';

export type OutletContextType = {
  sortType: SortType;
  keyword: string;
};

export default function DetailPage() {
  const listRef = useRef<HTMLDivElement>(null);
  const { folderId } = useParams<{ folderId: string }>();
  const { data, status } = useBookmarksData();

  const { sortType, keyword } = useOutletContext<OutletContextType>();

  const rootNodes = data?.[0]?.children ?? [];
  const targetFolder = folderId ? findNodeById(rootNodes, folderId) : undefined;
  const children = targetFolder?.children ?? [];

  const { bookmarks } = separateFolderAndBookmarks(children);

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

  if (status !== 'success' || !data) {
    return null;
  }

  const hasSearch = normalizedKeyword.length > 0;
  const hasResult = (filteredList?.length ?? 0) > 0;
  if (!data) return <div>데이터를 불러오지 못했습니다.</div>;
  return (
    <div>
      <div className="w-full mx-auto flex flex-col gap-3 pb-25 pt-6">
        {hasSearch ? (
          hasResult ? (
            (filteredList ?? []).map((bookmark) => (
              <BookmarkListItem
                key={bookmark.id}
                url={bookmark.url}
                title={bookmark.title}
                id={bookmark.id}
              />
            ))
          ) : (
            <p className="flex mt-4 text-sm text-gray-400 justify-center text-center">
              검색 결과가 없습니다.
            </p>
          )
        ) : sortedBookmarks ? (
          sortedBookmarks.map((bookmark) => (
            <BookmarkListItem
              key={bookmark.id}
              url={bookmark.url}
              title={bookmark.title}
              id={bookmark.id}
            />
          ))
        ) : (
          <div className="flex mt-4 text-sm text-gray-400 justify-center text-center">
            북마크가 없습니다.
          </div>
        )}
      </div>
      {/* 좌측 폴더 리스트 */}
      {ReactDOM.createPortal(
        <div ref={listRef} className="fixed left-20 top-1/2 -translate-y-1/2">
          <ul className="flex flex-col justify-start items-start gap-2">
            <FolderList node={targetFolder} folderId={folderId} />
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}
