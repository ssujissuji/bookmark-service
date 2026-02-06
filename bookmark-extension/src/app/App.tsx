import { Navigate, Route, Routes } from 'react-router';
import RootLayout from './layout/RootLayout';
import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import { BookmarksProvider } from './BookmarksContext';
import { FolderColorProvider } from './features/folderColor/FolderColorContext';

export default function App() {
  return (
    <BookmarksProvider>
      <FolderColorProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="bookmark/:folderId" element={<DetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </FolderColorProvider>
    </BookmarksProvider>
  );
}
