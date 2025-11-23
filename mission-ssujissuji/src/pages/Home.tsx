// TODO :
// recent -> 폴더 없는 북마크 리스트
// 1. 폴더 중첩 구조 확인
// 1-1. 폴더 중첩 ❌ -> 디테일 페이지는 리스트만
// 1-2. 폴더 중첩 ⭕️ -> 디테일 페이지에서 리스트랑 폴더 카드 + 좌측 폴더 리스트 UI 에 상위폴더로 이동하는 버튼
import { useEffect, useMemo, useState } from 'react';
import BookMarkCardList from '../components/home/BookMarkCardList';
import { useBookmarks } from '../hooks/useBookmark';
import type { OutletContextType } from './DetailPage';
import { useOutletContext } from 'react-router';
import { sortFolders } from '../utils/sortFolders';
import { separateFolderAndBookmarks } from '../utils/bookmarkTreeUtils';

export default function Home() {
  const { data } = useBookmarks();
  const { sortType } = useOutletContext<OutletContextType>();

  const [bookmarkBar, setBookmarkBar] = useState<BookmarkTreeType>([]);
  const [bookmarkOther, setBookmarkOther] = useState<BookmarkTreeType>([]);

  const { folders, bookmarks } = separateFolderAndBookmarks(bookmarkBar);

  // bookmarkbar 와 기타 북마크 구분
  const bookmarkBarSeparate = (data: BookmarkTreeType) => {
    const rootLevel = data[0]?.children;

    const rootBar = rootLevel.find(
      (node: BookmarkTreeType) => node.title === '북마크바',
    );
    const rootOther = rootLevel.find(
      (node: BookmarkTreeType) => node.title === '기타 북마크',
    );

    if (rootBar?.children) {
      setBookmarkBar(rootBar.children);
    }
    if (rootOther?.children) {
      setBookmarkOther(rootOther.children);
    }
  };
  const sortedFolders = useMemo(
    () => sortFolders(folders, sortType),
    [folders, sortType],
  );

  // 1. data → bookmarkBar / bookmarkOther 분리
  useEffect(() => {
    if (!data || !Array.isArray(data)) return;
    bookmarkBarSeparate(data);
  }, [data]);

  return (
    <div>
      <BookMarkCardList
        bookmarkBar={sortedFolders}
        bookmarkOther={bookmarkOther}
      />
    </div>
  );
}
