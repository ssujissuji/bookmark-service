import { Navigate, Route, Routes } from 'react-router';
import RootLayout from './layout/RootLayout';
import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import { BookmarksContext } from './BookmarksContext';

type AppViewProps = {
  data: BookmarkTreeType[] | null;
  loading: boolean;
  error: Error | null;
};

type BookmarksContextValue =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: BookmarkTreeType[]; error: null }
  | { status: 'error'; data: null; error: Error };

export default function App({ data, loading, error }: AppViewProps) {
  let bookmarksContextValue: BookmarksContextValue | undefined;
  if (loading) {
    bookmarksContextValue = { status: 'loading', data: null, error: null };
  } else if (error) {
    bookmarksContextValue = { status: 'error', data: null, error };
  } else if (data !== null) {
    bookmarksContextValue = { status: 'success', data, error: null };
  } else {
    bookmarksContextValue = { status: 'idle', data: null, error: null };
  }
  return (
    <BookmarksContext.Provider value={bookmarksContextValue}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/bookmark/:folderId" element={<DetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BookmarksContext.Provider>
  );
}
