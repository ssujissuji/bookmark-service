import { useState } from 'react';
import AppView from '../app/App';

function App() {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    chrome.bookmarks.getTree((bookmarks) => {
      console.log('📂 내 북마크 데이터:', bookmarks);
      setLoading(false);
    });
  };

  return (
    <>
      <div style={{ padding: '16px', width: '220px' }}>
        <h3>📚 북마크 내보내기</h3>
        <button onClick={handleExport} disabled={loading}>
          {loading ? '전송 중...' : '내 웹 서비스로 보내기'}
        </button>
      </div>
      <AppView />
    </>
  );
}

export default App;
