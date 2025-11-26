import type { SortType } from '../layout/RootLayout';

export function sortFolders(folders: BookmarkTreeType[], sortType: SortType) {
  if (!folders) return [];

  const list = [...folders];

  if (sortType === 'recent') {
    return list.sort((a, b) => b.dateAdded - a.dateAdded);
  }

  if (sortType === 'name') {
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list;
}
