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

  const { folders } = separateFolderAndBookmarks(bookmarkBar);

  // bookmarkbar 와 기타 북마크 구분
  const bookmarkBarSeparate = (data: BookmarkTreeType) => {
    if (!data || !data[0]?.children) {
      console.error('Invalid data structure:', data);
      return;
    }

    const rootLevel = data[0].children;

    const rootBar = rootLevel.find(
      (node: BookmarkTreeType) => node.title === '북마크바',
    );
    const rootOther = rootLevel.find(
      (node: BookmarkTreeType) => node.title === '기타 북마크',
    );

    console.log('rootBar', rootBar);
    console.log('rootOther', rootOther);

    if (rootBar?.children) {
      setBookmarkBar(rootBar.children);
    }
  };

  // 1. data → bookmarkBar / bookmarkOther 분리
  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      console.error('Data is not valid:', data);
      return;
    }
    bookmarkBarSeparate(data);
  }, [data]);

  const sortedFolders = useMemo(
    () => sortFolders(folders, sortType),
    [folders, sortType],
  );

  return (
    <div>
      <BookMarkCardList bookmarkBar={sortedFolders} />
    </div>
  );
}
