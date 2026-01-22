import { useEffect, useState } from 'react';
import BookMarkCardList from '../components/home/BookMarkCardList';
import { useBookmarksData } from '../BookmarksContext';

export default function Home() {
  const { data, status } = useBookmarksData();

  const [bookmarkBarData, setBookmarkBarData] = useState<BookmarkTreeType[]>(
    [],
  );

  useEffect(() => {
    if (!data || !data[0]?.children) {
      console.error('Invalid data structure:', data);
      return;
    }

    const rootLevel = data[0].children;
    const rootBar = rootLevel.find((node: BookmarkTreeType) => node.id === '1');

    if (rootBar?.children) {
      setBookmarkBarData(rootBar.children);
    }
  }, [data]);

  if (status !== 'success' || !data) {
    return null;
  }

  return (
    <div className="w-full ">
      <BookMarkCardList bookmarkBar={bookmarkBarData} />
    </div>
  );
}
