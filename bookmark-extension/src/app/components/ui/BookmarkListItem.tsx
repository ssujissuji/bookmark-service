import { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { useBookmarksData } from '@/app/BookmarksContext';
import { useUrlActions } from '@/app/hooks/useUrlActions';

export default function BookmarkListItem({
  url,
  title,
  id,
}: {
  url: string;
  title: string;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const { deleteUrl } = useUrlActions();
  const { reloadBookmarks } = useBookmarksData();

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

  const handleDelete = async () => {
    console.log('handleDelete 호출됨');
    console.log('삭제할 북마크 ID:', id);
    if (!id) return;
    try {
      await deleteUrl(id);
      console.log('삭제된 북마크 ID:', id);
      await reloadBookmarks();
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
    }
    setIsOpen(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (!id) return;
    e.dataTransfer.setData('text/plain', String(id));
  };

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      className="flex relative justify-between items-center glass rounded-lg gap-4 px-6 py-3 glass--hover cursor-pointer min-w-[500px] "
    >
      <div className="flex items-center gap-4 ">
        <IconDefault width={20} height={20} />
        <Link
          to={url}
          className="text-base font-['LeferiBaseRegular'] align-middle"
          target="_blank"
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
              <SelectBox onDelete={handleDelete} />
            </div>
          </>,
          document.body,
        )}
    </li>
  );
}
