import { useEffect, useMemo, useState } from 'react';
import BookmarkCard from '../ui/BookmarkCard';
import NewBookMark from '../ui/NewBookMark';
import {
  collectAllBookmarks,
  separateFolderAndBookmarks,
} from '../../utils/bookmarkTreeUtils';
import { useNavigate, useOutletContext } from 'react-router';
import BookmarkListItem from '../ui/BookmarkListItem';
import type { OutletContextType } from '../../pages/DetailPage';
import { useBookmarksData } from '@/app/BookmarksContext';
import { CreateUrlParams, useUrlActions } from '@/app/hooks/useUrlActions';
import TextButton from '../ui/TextButton';
import ReactDOM from 'react-dom';
import BookmarkEditModal from '../BookmarkEditModal';

type TabType = 'recent' | 'barUrls';

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

  const [activeTab, setActiveTab] = useState<TabType>('recent');

  const { data, status, reloadBookmarks } = useBookmarksData();
  const { createUrl } = useUrlActions();

  const { keyword, sortType } = useOutletContext<OutletContextType>();

  const [isOpen, setIsOpen] = useState(false);

  const normalizedKeyword = keyword.trim().toLowerCase();

  const navigate = useNavigate();

  useEffect(() => {
    if (!bookmarkBar.length) return;

    const { folders, bookmarks } = separateFolderAndBookmarks(bookmarkBar);
    setBookmarkBarFolderList(folders);
    setBookmarkBarUrlList(bookmarks);
  }, [bookmarkBar]);

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

  const sortedFolderList = useMemo(() => {
    const base = hasSearch ? filteredList : bookmarkBarFolderList;
    const copy = [...base];
    if (sortType === 'name') {
      copy.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'ko'));
    }
    if (sortType === 'recent') {
      copy.sort((a, b) => (b.dateAdded ?? 0) - (a.dateAdded ?? 0));
    }
    return copy;
  }, [sortType, bookmarkBarFolderList, filteredList, hasSearch]);
  if (status !== 'success' || !data) {
    return null;
  }

  const createOpenhandler = () => {
    setIsOpen(true);
  };
  const handleSubmit = ({ title, url }: CreateUrlParams) => {
    createUrl({ title, url, parentId: `1` });
    reloadBookmarks();
    setIsOpen(false);
  };

  const allList = collectAllBookmarks(data);
  const recent = [...allList].sort((a, b) => b.dateAdded - a.dateAdded);
  const LIMIT = 6;
  const limitList = recent.slice(0, LIMIT);

  return (
    <div className="flex flex-col items-center mx-auto gap-5 w-full">
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mt-4 w-full">
        <BookmarkCard
          title={'북마크바'}
          type="bookmarkBar"
          onClick={() => navigate('/bookmark/1')}
        />
        <BookmarkCard
          title={'기타 북마크'}
          type="others"
          onClick={() => navigate('/bookmark/2')}
        />
        {hasSearch && sortedFolderList.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">검색 결과가 없습니다.</p>
        ) : (
          sortedFolderList.map((list) => (
            <BookmarkCard
              key={list.id}
              title={list.title}
              id={list.id}
              type="bookmarkBar"
              onClick={() => navigate(`/bookmark/${list.id}`)}
            />
          ))
        )}

        <NewBookMark />
      </ul>

      <div className="flex flex-col justify-start items-start w-full gap-4">
        <div className="w-full flex justify-between items-center">
          <div className="w-full flex gap-2 pt-10">
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={[
                'px-4 py-2 rounded-lg text-sm transition cursor-pointer',
                activeTab === 'recent'
                  ? 'text-lg font-semibold text-(--color-yellow)'
                  : 'text-(--color-gray-light) hover:bg-white/10',
              ].join(' ')}
            >
              최근 북마크 추가 목록
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('barUrls')}
              className={[
                'px-4 py-2 rounded-lg text-sm transition cursor-pointer',
                activeTab === 'barUrls'
                  ? 'text-lg font-semibold text-(--color-yellow)'
                  : ' text-(--color-gray-light) hover:bg-white/10',
              ].join(' ')}
            >
              북마크바 URL 리스트
            </button>
          </div>
          <TextButton
            buttonName="+ 새북마크"
            className="button__text px-4 pt-10 text-sm cursor-pointer shrink-0 whitespace-nowrap"
            onClick={createOpenhandler}
          />
        </div>

        {/* 탭 컨텐츠 */}
        <div className="w-full mx-auto flex flex-col gap-3 pt-6">
          {activeTab === 'recent' ? (
            <>
              {limitList.map((r) => (
                <BookmarkListItem
                  key={r.id}
                  url={r.url}
                  title={r.title}
                  id={r.id}
                  dateAdded={r.dateAdded}
                />
              ))}
            </>
          ) : (
            <>
              {bookmarkBarUrlList.length > 0 ? (
                bookmarkBarUrlList.map((r) => (
                  <BookmarkListItem
                    key={r.id}
                    url={r.url}
                    title={r.title}
                    id={r.id}
                    dateAdded={r.dateAdded}
                  />
                ))
              ) : (
                <p className="flex justify-center mt-4 text-sm text-(--color-main-red)">
                  북마크바에 URL이 없습니다.
                </p>
              )}
            </>
          )}
        </div>
      </div>
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
