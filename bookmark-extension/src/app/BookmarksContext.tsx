import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type BookmarksState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: BookmarkTreeType[] | null;
  error: Error | null;
};

export type BookmarksContextValue = BookmarksState & {
  reloadBookmarks: () => Promise<void>;
};

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

type BookmarksProviderProps = {
  children: React.ReactNode;
};

export function BookmarksProvider({ children }: BookmarksProviderProps) {
  const [state, setState] = useState<BookmarksState>({
    status: 'idle',
    data: null,
    error: null,
  });

  const reloadBookmarks = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (!chrome?.bookmarks) {
        const error = new Error('chrome.bookmarks API 를 사용할 수 없습니다.');
        setState({
          status: 'error',
          data: null,
          error,
        });
        reject(error);
        return;
      }

      setState((prev) => ({
        ...prev,
        status: 'loading',
        error: null,
      }));

      chrome.bookmarks.getTree((bookmarks) => {
        const lastError = chrome.runtime.lastError;

        if (lastError) {
          console.error('getTree error:', lastError);
          setState({
            status: 'error',
            data: null,
            error: new Error(lastError.message),
          });
          reject(lastError);
        } else {
          console.log('📂 북마크 데이터 로드:', bookmarks);
          setState({
            status: 'success',
            data: bookmarks as BookmarkTreeType[],
            error: null,
          });
          resolve();
        }
      });
    });
  }, []);

  useEffect(() => {
    reloadBookmarks();
  }, [reloadBookmarks]);

  const value: BookmarksContextValue = {
    ...state,
    reloadBookmarks,
  };

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}
