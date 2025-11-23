// utils/sortBookmarks.ts
import type { SortType } from '../layout/RootLayout';

export function sortBookmarks(
  bookmarks: BookmarkTreeType[],
  sortType: SortType,
) {
  if (!bookmarks) return [];

  const list = [...bookmarks];

  if (sortType === 'recent') {
    return list.sort((a, b) => b.dateAdded - a.dateAdded);
  }

  if (sortType === 'name') {
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list;
}
