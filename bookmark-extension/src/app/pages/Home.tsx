import { useEffect, useState } from 'react';
import BookMarkCardList from '../components/home/BookMarkCardList';
import { useBookmarksData } from '../BookmarksContext';

export default function Home() {
  const { data, status } = useBookmarksData();
  if (status !== 'success' || !data) {
    return null;
  }
  const [bookmarkBarData, setBookmarkBarData] = useState<BookmarkTreeType[]>(
    [],
  );
  console.log('Home data:', data);
  useEffect(() => {
    if (!data || !data[0]?.children) {
      console.error('Invalid data structure:', data);
      return;
    }

    const rootLevel = data[0].children;
    const rootBar = rootLevel.find(
      (node: BookmarkTreeType) => node.title === '북마크바',
    );

    if (rootBar?.children) {
      setBookmarkBarData(rootBar.children); // 전체 내용을 저장
    }
  }, [data]);

  return (
    <div className="w-full ">
      <BookMarkCardList bookmarkBar={bookmarkBarData} />
    </div>
  );
}
