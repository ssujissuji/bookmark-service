import { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { useBookmarksData } from '@/app/BookmarksContext';
import { useUrlActions } from '@/app/hooks/useUrlActions';
import toast from 'react-hot-toast';
import BookmarkEditModal, { BookmarkSubmitValue } from '../BookmarkEditModal';
import { isRecentlyAdded } from '@/app/utils/timeUtils';
import { useDragGhostDnD } from '@/app/hooks/useDragGhostDnD';

export default function BookmarkListItem({
  url,
  title,
  id,
  dateAdded,
}: {
  url: string;
  title: string;
  id: string;
  dateAdded: number;
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
        top: rect.bottom + window.scrollY + 6,
        left: rect.right + window.scrollX - 80,
      });
    }

    setIsOpen(true);
  };

  const handleItemClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest('[data-ignore-link]')) return;

    window.open(url, '_blank', 'noopener,noreferrer');
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
    const confirmed = window.confirm('정말로 삭제하시겠습니까?');
    if (!confirmed) return;
    if (!id) return;

    try {
      await deleteUrl(id);
      await reloadBookmarks();
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
    }
    setIsOpen(false);
  };

  const { onDragStart, onDragEnd } = useDragGhostDnD({
    draggedId: id,
    payloadPrefix: 'folder',
    disabled: !id,
    onDragStartUI: () => {
      setIsDragging(true);
      setIsOpen(false);
    },
    onDragEndUI: () => {
      setIsDragging(false);
    },
    ghost: {
      scale: 0.55,
      opacity: 0.12,
      blurPx: 0.6,
      grayscale: true,
      offsetX: 10,
      offsetY: 10,
    },
  });

  const isNew = isRecentlyAdded(dateAdded);

  return (
    <>
      <li
        draggable
        onClick={handleItemClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={[
          'flex relative justify-between items-center glass rounded-lg gap-4 px-6 py-3 glass--hover cursor-pointer min-w-[500px] hover:underline',
          isDragging
            ? 'opacity-30 blur-[0.5px] cursor-grabbing transition-opacity duration-150 ease-out'
            : '',
        ].join(' ')}
      >
        <div className="flex flex-1 min-w-0 justify-start items-center gap-4  ">
          <div className="flex flex-1 min-w-0 items-center gap-4 ">
            <IconDefault width={20} height={20} className="shrink-0" />
            <span className="text-base font-['LeferiBaseRegular'] align-middle truncate">
              {title}
            </span>
          </div>
          {isNew && (
            <span className="text-xs text-(--color-yellow) glass px-1 rounded-md max-h-[18px]">
              new
            </span>
          )}
        </div>
        <div
          ref={buttonRef}
          data-ignore-link
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
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
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
