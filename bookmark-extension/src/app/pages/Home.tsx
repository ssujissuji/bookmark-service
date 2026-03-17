import { useMemo } from 'react';
import BookMarkCardList from '../components/home/BookMarkCardList';
import { useBookmarksData } from '../BookmarksContext';

export default function Home() {
  const { data, status } = useBookmarksData();

  const bookmarkBarData = useMemo<BookmarkTreeType[]>(() => {
    if (status !== 'success') return [];

    if (!Array.isArray(data) || !data[0]?.children) {
      console.error('Invalid data structure:', data);
      return [];
    }

    const rootLevel = data[0].children;

    const bookmarkBarNode =
      rootLevel.find((node: BookmarkTreeType) => node.id === '1') ??
      rootLevel.find((node: BookmarkTreeType) => Array.isArray(node.children));

    return bookmarkBarNode?.children ?? [];
  }, [data, status]);

  if (status !== 'success') return null;

  return (
    <div className="w-full">
      <BookMarkCardList bookmarkBar={bookmarkBarData} />
    </div>
  );
}
