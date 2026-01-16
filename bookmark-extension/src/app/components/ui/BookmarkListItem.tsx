import { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { useBookmarksData } from '@/app/BookmarksContext';
import { useUrlActions } from '@/app/hooks/useUrlActions';
import toast from 'react-hot-toast';
// import FolderEditModal from '../FolderEditModal';
import BookmarkEditModal, { BookmarkSubmitValue } from '../BookmarkEditModal';

export default function BookmarkListItem({
  url,
  title,
  id,
}: {
  url: string;
  title: string;
  id: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { deleteUrl } = useUrlActions();
  const { reloadBookmarks } = useBookmarksData();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editInitialValue, setEditInitialValue] = useState<{
    title: string;
    url: string;
  }>({ title, url });

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setPos({
        top: rect.bottom + window.scrollY + 6, // 버튼 아래 6px 여백
        left: rect.right + window.scrollX - 130, // SelectBox 너비(130px)만큼 왼쪽으로
      });
    }

    setIsOpen(true);
  };

  const handleModify = () => {
    if (!id) return;

    setIsOpen(false);

    const nextName = title;
    setEditInitialValue({ title: nextName, url });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (data: BookmarkSubmitValue) => {
    if (!id) return;

    try {
      await chrome.bookmarks.update(id, { title: data.title, url: data.url });
      await reloadBookmarks();
      toast.success('북마크가 수정되었습니다.');
    } catch (error) {
      console.error('수정 실패:', error);
    } finally {
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteUrl(id);
      await reloadBookmarks();
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
    }
    setIsOpen(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!id) return;

    setIsDragging(true);
    setIsOpen(false);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    setIsDragging(false);
  };

  return (
    <>
      <li
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={[
          'flex relative justify-between items-center glass rounded-lg gap-4 px-6 py-3 glass--hover cursor-pointer min-w-[500px]',
          isDragging
            ? 'opacity-60 scale-[0.995] glass--hover:!bg-transparent'
            : '',
        ].join(' ')}
      >
        <div className="flex min-w-0 items-center gap-4 ">
          <IconDefault width={20} height={20} />
          <Link
            to={url}
            className="text-base font-['LeferiBaseRegular'] align-middle truncate  hover:underline"
            target="_blank"
            draggable={false}
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {title}
          </Link>
        </div>
        <div
          ref={buttonRef}
          className="hover:text-(--color-gray-dark) cursor-pointer"
          onClick={handleOpen}
        >
          <Ellipsis />
        </div>
        {isOpen &&
          ReactDOM.createPortal(
            <>
              <div
                className="fixed inset-0 bg-transparent z-9998"
                onClick={() => setIsOpen(false)}
              ></div>

              <div
                className="fixed z-9999"
                style={{
                  position: 'absolute',
                  top: `${pos.top}px`,
                  left: `${pos.left}px`,
                }}
              >
                <SelectBox onDelete={handleDelete} onModify={handleModify} />
              </div>
            </>,
            document.body,
          )}
      </li>
      {isEditOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center"
            onClick={() => setIsEditOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative z-10001"
              onClick={(e) => e.stopPropagation()}
            >
              {/* <FolderEditModal
                type="edit"
                initialValue={editInitialValue.title}
                onCancel={() => setIsEditOpen(false)}
                onSubmit={handleEditSubmit}
              /> */}
              <BookmarkEditModal
                mode="edit"
                initialValue={editInitialValue}
                onCancel={() => setIsEditOpen(false)}
                onSubmit={handleEditSubmit}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
