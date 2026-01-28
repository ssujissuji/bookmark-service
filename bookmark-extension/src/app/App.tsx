import { Navigate, Route, Routes } from 'react-router';
import RootLayout from './layout/RootLayout';
import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import { BookmarksProvider } from './BookmarksContext';

export default function App() {
  return (
    <BookmarksProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="bookmark/:folderId" element={<DetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BookmarksProvider>
  );
}
