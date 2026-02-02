import React, { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { useFolderActions } from '@/app/hooks/useFoldersActions';
import { useBookmarksData } from '@/app/BookmarksContext';
import toast from 'react-hot-toast';
import FolderEditModal from '../FolderEditModal';
import { Pin } from 'lucide-react';
import { isRecentlyAdded } from '@/app/utils/timeUtils';
import { useDragGhostDnD } from '@/app/hooks/useDragGhostDnD';

export default function BookmarkCard({
  title,
  type,
  id,
  dateAdded,
  onClick,
}: {
  title: string;
  type: string;
  id?: string;
  dateAdded?: number;
  onClick: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const { deleteFolder } = useFolderActions();
  const { reloadBookmarks } = useBookmarksData();

  const targetFolderId =
    id ?? (type === 'bookmarkBar' ? '1' : type === 'others' ? '2' : undefined);
  const isRootFolder = targetFolderId === '1' || targetFolderId === '2';

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editInitialValue, setEditInitialValue] = useState<string>(title);

  const [isDragging, setIsDragging] = useState(false);
  const [isDragHover, setIsDragHover] = useState(false);
  const enterCounterRef = useRef(0);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 80,
      });
    }
    setIsOpen(true);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('정말로 이 폴더를 삭제하시겠습니까?');
    if (!confirmed) return;
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

  const { onDragStart, onDragEnd } = useDragGhostDnD({
    draggedId: targetFolderId,
    payloadPrefix: 'folder',
    disabled: !targetFolderId || isRootFolder,
    onDragStartUI: () => {
      setIsDragging(true);
      setIsOpen(false);
    },
    onDragEndUI: () => {
      setIsDragging(false);
    },
    ghost: {
      scale: 0.75,
      opacity: 0.12,
      blurPx: 0.6,
      grayscale: true,
      offsetX: 10,
      offsetY: 10,
    },
  });

  const onDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    enterCounterRef.current += 1;
    setIsDragHover(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    enterCounterRef.current -= 1;

    if (enterCounterRef.current <= 0) {
      enterCounterRef.current = 0;
      setIsDragHover(false);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    enterCounterRef.current = 0;
    setIsDragHover(false);

    const raw = e.dataTransfer.getData('text/plain');
    if (!raw || !targetFolderId) return;

    let draggedId = raw;
    if (raw.startsWith('folder:')) draggedId = raw.replace('folder:', '');
    if (raw.startsWith('bookmark:')) draggedId = raw.replace('bookmark:', '');

    if (String(draggedId) === String(targetFolderId)) return;
    try {
      await chrome.bookmarks.move(draggedId, {
        parentId: String(targetFolderId),
      });

      await reloadBookmarks();
      toast.success('이동되었습니다!');
    } catch (err) {
      console.error('이동 실패:', err);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  const isNew = isRecentlyAdded(dateAdded);
  return (
    <>
      <li
        draggable={!isRootFolder}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={handleCardClick}
        title={title}
        className={[
          'flex relative justify-between items-center glass rounded-xl gap-4 px-6 py-4 w-full min-h-[120px] glass--hover',
          isDragging
            ? 'opacity-30 blur-[0.5px] cursor-grabbing transition-opacity duration-150 ease-out'
            : '',

          isDragHover ? 'outline-2 outline-(--text-hover)' : '',
        ].join(' ')}
      >
        <div className="flex flex-1 min-w-0 gap-5 cursor-pointer">
          <IconDefault
            className={
              type === 'bookmarkBar'
                ? 'text-(--text-hover) shrink-0'
                : 'text-(--text-selected) shrink-0'
            }
            width={40}
            height={60}
          />
          <div className="flex min-w-0 flex-col justify-center rounded-xl gap-2">
            <div className="flex justify-start items-center gap-2">
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
              {isNew && (
                <span className="text-xs text-(--text-selected) glass px-1 py-1 rounded-sm ">
                  new
                </span>
              )}
            </div>
            <p className="text-xl font-['LeferiBaseBold'] truncate">{title}</p>
          </div>
        </div>

        <div
          ref={buttonRef}
          className={`shrink-0 hover:text-(--color-gray-dark) cursor-pointer ${targetFolderId === '1' || targetFolderId === '2' ? 'hidden' : ''}`}
          onClick={handleOpen}
          draggable={false}
        >
          <Ellipsis />
        </div>
        <div
          className={`shrink-0 text-(--color-gray-light) pin-tilt ${targetFolderId === '1' || targetFolderId === '2' ? '' : 'hidden'} `}
          draggable={false}
        >
          <Pin size={20} />
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
