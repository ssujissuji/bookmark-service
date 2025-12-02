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
    borderRadius: '12px',
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
    setIsOpen(false);
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
        shouldCloseOnEsc={false}
        shouldCloseOnOverlayClick={false}
      >
        <div
          className="flex flex-col justify-center items-center bg-white  gap-4"
          style={{ padding: '20px', minWidth: '300px' }}
        >
          <h3 className="text-black font-bold">📕 내북마크 불러오기</h3>
          <button
            className="rounded-2xl border border-(--color-main-red) px-4 py-2 mt-4 text-black hover:text-white hover:bg-(--color-main-red) cursor-pointer"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? '전송 중...' : '내 웹 서비스로 보내기'}
          </button>
        </div>
      </Modal>
      <AppView data={bookmarksData} loading={loading} error={error} />
    </>
  );
}

export default App;
