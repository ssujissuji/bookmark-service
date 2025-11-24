import { useEffect, useMemo, useState } from 'react';
import BookmarkCard from '../ui/BookmarkCard';
import NewBookMark from '../ui/NewBookMark';
import {
  collectAllBookmarks,
  separateFolderAndBookmarks,
} from '../../utils/bookmarkTreeUtils';
import { useNavigate, useOutletContext } from 'react-router';
import BookmarkListItem from '../ui/BookmarkListItem';
import { useBookmarks } from '../../hooks/useBookmark';
import type { OutletContextType } from '../../pages/DetailPage';

export default function BookMarkCardList({
  bookmarkBar,
}: {
  bookmarkBar: BookmarkTreeType[];
}) {
  const [bookmarkBarFolderList, setBookmarkBarFolderList] = useState<
    BookmarkTreeType[]
  >([]);
  const [bookmarkBarUrlList, setBookmarkBarUrlList] = useState<
    BookmarkTreeType[]
  >([]);

  const { data } = useBookmarks();
  const { keyword } = useOutletContext<OutletContextType>();

  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredList = useMemo(() => {
    if (!normalizedKeyword) {
      return [];
    }
    return bookmarkBarFolderList.filter((bookmark) => {
      const title = bookmark.title.toLowerCase() ?? '';
      return title.includes(normalizedKeyword);
    });
  }, [bookmarkBarFolderList, normalizedKeyword]);

  const hasSearch = normalizedKeyword.length > 0;
  const hasResult = filteredList.length > 0;

  const allList = collectAllBookmarks(data);
  const recent = [...allList].sort((a, b) => b.dateAdded - a.dateAdded);
  const LIMIT = 6;
  const limitList = recent.slice(0, LIMIT);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookmarkBar.length) return;

    const { folders, bookmarks } = separateFolderAndBookmarks(bookmarkBar);
    setBookmarkBarFolderList(folders);
    setBookmarkBarUrlList(bookmarks);
  }, [bookmarkBar]);

  return (
    <div className="flex flex-col items-center mx-auto gap-5 w-full">
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mt-4 w-full">
        {hasSearch ? (
          hasResult ? (
            filteredList.map((list) => (
              <BookmarkCard
                key={list.id}
                title={list.title}
                type="bookmarkBar"
                onClick={() => navigate(`/bookmark/${list.id}`)}
              />
            ))
          ) : (
            <p className="mt-4 text-sm text-gray-400">검색 결과가 없습니다.</p>
          )
        ) : (
          bookmarkBarFolderList.map((list) => (
            <BookmarkCard
              key={list.id}
              title={list.title}
              type="bookmarkBar"
              onClick={() => navigate(`/bookmark/${list.id}`)}
            />
          ))
        )}
        <BookmarkCard
          title={'기타 북마크'}
          type="others"
          onClick={() => navigate('/bookmark/2')}
        />
        <NewBookMark />
      </ul>
      <div className="flex flex-col justify-start items-start w-full gap-4">
        <div className="flex flex-col justify-start w-full gap-4">
          <p className="pt-10 text-(--color-gray-light)">
            최근 북마크 추가 목록
          </p>
          <div className="w-full mx-auto flex flex-col gap-3 pt-6">
            {limitList.map((r) => (
              <BookmarkListItem key={r.id} url={r.url} title={r.title} />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-start w-full gap-4">
          <p className="pt-10 text-(--color-gray-light)">북마크바 URL 리스트</p>

          <div className="w-full mx-auto flex flex-col gap-3 pt-6">
            {bookmarkBarUrlList.length > 0 ? (
              bookmarkBarUrlList.map((r) => (
                <BookmarkListItem key={r.id} url={r.url} title={r.title} />
              ))
            ) : (
              <p className="flex justify-center mt-4 text-sm text-(--color-main-red)">
                북마크바에 URL이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
