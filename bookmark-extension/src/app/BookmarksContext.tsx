import { createContext, useContext } from 'react';

export type BookmarksContextValue =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: BookmarkTreeType[]; error: null }
  | { status: 'error'; data: null; error: Error };

export const BookmarksContext = createContext<
  BookmarksContextValue | undefined
>(undefined);

export const useBookmarksData = () => {
  const ctx = useContext(BookmarksContext);
  if (!ctx) {
    throw new Error('useBookmarksData must be used within a BookmarksProvider');
  }
  return ctx;
};
