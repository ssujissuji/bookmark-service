// utils/sortBookmarks.ts
import type { SortType } from '../layout/RootLayout';

export function sortBookmarks(
  bookmarks: BookmarkTreeType[],
  sortType: SortType,
  locale?: string,
) {
  if (!bookmarks) return [];

  const list = [...bookmarks];

  if (sortType === 'recent') {
    return list.sort((a, b) => b.dateAdded - a.dateAdded);
  }

  if (sortType === 'name') {
    return list.sort((a, b) => a.title.localeCompare(b.title, locale));
  }

  // 'manual': 크롬의 실제 순서(네이티브 순서)를 그대로 사용 — 사용자가 DnD로 정한 순서.
  return list;
}
