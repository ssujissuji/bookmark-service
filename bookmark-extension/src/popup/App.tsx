import { useState } from 'react';
import AppView from '../app/App';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root'); // 모달 접근성 설정

function App() {
  const [modalIsOpen, setIsOpen] = useState(true);
  const [bookmarksData, setBookmarksData] = useState<BookmarkTreeType[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleExport = () => {
    setLoading(true);
    chrome.bookmarks.getTree((bookmarks) => {
      if (!bookmarks) {
        setError(new Error('Failed to retrieve bookmarks'));
        setLoading(false);
        return;
      }
      console.log('📂 내 북마크 데이터:', bookmarks);
      setBookmarksData(bookmarks as BookmarkTreeType[]);
      setLoading(false);
    });
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  const afterCloseModal = () => {
    // Additional actions after modal opens can be added here
  };

  if (error) {
    console.log('Error', error.message);
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        onAfterOpen={afterCloseModal}
        style={customStyles}
        contentLabel="Welcome Modal"
      >
        <div style={{ padding: '16px', width: '220px' }}>
          <h3>📕 내북마크 내보내기</h3>
          <button onClick={handleExport} disabled={loading}>
            {loading ? '전송 중...' : '내 웹 서비스로 보내기'}
          </button>
        </div>
      </Modal>
      <AppView data={bookmarksData} loading={loading} error={error} />
    </>
  );
}

export default App;
