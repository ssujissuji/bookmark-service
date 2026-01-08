import React, { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { useFolderActions } from '@/app/hooks/useFoldersActions';
import { useBookmarksData } from '@/app/BookmarksContext';
import toast from 'react-hot-toast';

export default function BookmarkCard({
  title,
  type,
  id,
  onClick,
}: {
  title: string;
  type: string;
  id?: string;
  onClick: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const { deleteFolder } = useFolderActions();
  const { reloadBookmarks } = useBookmarksData();

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4, // 버튼 아래 4px 여백
        left: rect.right - 120, // SelectBox의 너비 고려 (대충 120px 기준)
      });
    }
    setIsOpen(true);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      deleteFolder(id);
      await reloadBookmarks();
    } catch (error) {
      console.error('폴더 삭제 실패:', error);
    }
    setIsOpen(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedBookmarkId = e.dataTransfer.getData('text/plain');

    if (!draggedBookmarkId || !id) return;

    try {
      await chrome.bookmarks.move(draggedBookmarkId, {
        parentId: id,
      });

      await reloadBookmarks();
      toast.success('북마크가 성공적으로 이동되었습니다!');
    } catch (err) {
      console.error('북마크 이동 실패:', err);
    }
  };

  return (
    <>
      <li
        className="flex relative justify-between items-center glass rounded-xl gap-4 px-6 py-4 w-full min-h-[120px] glass--hover"
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex gap-5  cursor-pointer">
          <IconDefault
            className={
              type === 'bookmarkBar'
                ? 'text-(--color-main-red)'
                : 'text-(--color-yellow)'
            }
            width={40}
            height={60}
          />
          <div className="flex flex-col justify-center rounded-xl gap-2">
            {type === 'bookmarkBar' && (
              <div className="w-fit px-1.5 py-1 bookmark-tag bookmark-tag__bar rounded-sm">
                bookmark-bar
              </div>
            )}
            {type === 'others' && (
              <div className="w-fit px-1.5 py-1 bookmark-tag bookmark-tag__other rounded-sm">
                others
              </div>
            )}
            <p className="text-xl font-['LeferiBaseBold']">{title}</p>
          </div>
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
                className="absolute z-9999"
                style={{
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
    </>
  );
}
