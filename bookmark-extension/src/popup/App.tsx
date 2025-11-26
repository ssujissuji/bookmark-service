// ✅ 크롬 확장 프로그램 popup/App.tsx

import RootLayout from '@/app/layout/RootLayout';
import DetailPage from '@/app/pages/DetailPage';
import Home from '@/app/pages/Home';
import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';

function App() {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    chrome.bookmarks.getTree((bookmarks) => {
      console.log('📂 내 북마크 데이터:', bookmarks);
      setLoading(false);
    });
    // 1️⃣ 크롬 북마크 트리 가져오기
    // chrome.bookmarks.getTree(async (tree) => {
    //   try {
    //     // 2️⃣ Express 서버로 데이터 전송
    //     const res = await fetch('http://localhost:3001/api/bookmarks', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(tree),
    //     });

    //     if (res.ok) {
    //       console.log('✅ 북마크 전송 성공!');
    //     } else {
    //       console.error('❌ 전송 실패');
    //     }
    //   } catch (error) {
    //     console.error('⚠️ 오류:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // });
  };

  return (
    <>
      <div style={{ padding: '16px', width: '220px' }}>
        <h3>📚 북마크 내보내기</h3>
        <button onClick={handleExport} disabled={loading}>
          {loading ? '전송 중...' : '내 웹 서비스로 보내기'}
        </button>
      </div>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/bookmark/:folderId" element={<DetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
