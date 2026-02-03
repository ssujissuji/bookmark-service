import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
const initialContextValue: BookmarksContextValue = {
  status: 'idle',
  data: null,
  error: null,
  reloadBookmarks: () => Promise.resolve(),
};
export const BookmarksContext =
  createContext<BookmarksContextValue>(initialContextValue);

export const useBookmarksData = () => {
  const ctx = useContext(BookmarksContext);
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

  const statusRef = useRef<BookmarksState['status']>('idle');
  useEffect(() => {
    statusRef.current = state.status;
  }, [state.status]);

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

  const debounceTimerRef = useRef<number | null>(null);

  const scheduleReload = useCallback(() => {
    if (statusRef.current === 'loading') return;

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      if (statusRef.current === 'loading') return;

      reloadBookmarks().catch((e) => {
        console.error('reloadBookmarks (debounced) failed:', e);
      });
    }, 200);
  }, [reloadBookmarks]);

  useEffect(() => {
    if (!chrome?.bookmarks) return;

    const handleAnyBookmarkChange = () => {
      scheduleReload();
    };

    // 북마크 변경 케이스들 구독
    chrome.bookmarks.onCreated.addListener(handleAnyBookmarkChange);
    chrome.bookmarks.onRemoved.addListener(handleAnyBookmarkChange);
    chrome.bookmarks.onChanged.addListener(handleAnyBookmarkChange);
    chrome.bookmarks.onMoved.addListener(handleAnyBookmarkChange);
    chrome.bookmarks.onChildrenReordered.addListener(handleAnyBookmarkChange);
    chrome.bookmarks.onImportEnded.addListener(handleAnyBookmarkChange);

    return () => {
      // cleanup: 리스너 제거 + 남아있는 타이머 취소
      chrome.bookmarks.onCreated.removeListener(handleAnyBookmarkChange);
      chrome.bookmarks.onRemoved.removeListener(handleAnyBookmarkChange);
      chrome.bookmarks.onChanged.removeListener(handleAnyBookmarkChange);
      chrome.bookmarks.onMoved.removeListener(handleAnyBookmarkChange);
      chrome.bookmarks.onChildrenReordered.removeListener(
        handleAnyBookmarkChange,
      );
      chrome.bookmarks.onImportEnded.removeListener(handleAnyBookmarkChange);

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [scheduleReload]);

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
