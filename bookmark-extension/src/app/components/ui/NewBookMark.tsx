import { useState } from 'react';
import NewFolder from '../../assets/icon/new_folder.svg?react';
import ReactDOM from 'react-dom';
import FolderEditModal from '../FolderEditModal';

export default function NewBookMark() {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="flex justify-between items-center glass rounded-xl gap-4 px-9 py-4 w-full min-h-[120px] glass--hover text-(--color-gray-light)"
      >
        <div className="flex gap-4">
          <NewFolder width={40} />
        </div>
        <span className="text-2xl">새폴더 만들기</span>
      </div>
      {isOpen &&
        ReactDOM.createPortal(
          <>
            {/* 화면 전체 덮는 오버레이 */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-9998"
              onClick={() => {
                setIsOpen(false);
              }}
            ></div>
            <div
              className="fixed z-9999 inset-0 flex justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderEditModal type="new" onClick={() => setIsOpen(false)} />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
