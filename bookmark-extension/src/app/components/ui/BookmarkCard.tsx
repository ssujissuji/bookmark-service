import React, { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { useFolderActions } from '@/app/hooks/useFoldersActions';
import { useBookmarksData } from '@/app/BookmarksContext';
import toast from 'react-hot-toast';
import FolderEditModal from '../FolderEditModal';

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editInitialValue, setEditInitialValue] = useState<string>(title);

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

  const handleModify = () => {
    if (!id) return;

    setIsOpen(false);

    const nextName = title;
    setEditInitialValue(nextName);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (name: string) => {
    if (!id) return;

    try {
      await chrome.bookmarks.update(id, { title: name });
      await reloadBookmarks();
      toast.success('폴더명이 수정되었습니다.');
    } catch (error) {
      console.error('폴더 수정 실패:', error);
    } finally {
      setIsEditOpen(false);
    }
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
        title={title}
      >
        <div className="flex flex-1 min-w-0 gap-5 cursor-pointer">
          <IconDefault
            className={
              type === 'bookmarkBar'
                ? 'text-(--color-main-red) shrink-0'
                : 'text-(--color-yellow) shrink-0'
            }
            width={40}
            height={60}
          />
          <div className="flex min-w-0 flex-col justify-center rounded-xl gap-2">
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
            <p className="text-xl font-['LeferiBaseBold'] truncate">{title}</p>
          </div>
        </div>
        <div
          ref={buttonRef}
          className="shrink-0 hover:text-(--color-gray-dark) cursor-pointer"
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
              <FolderEditModal
                type="edit"
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
