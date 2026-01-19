import TextButton from './ui/TextButton';
import FolderIcon from '../assets/icon/folder.svg?react';
import ArrowChild from '../assets/icon/arrow_child.svg?react';
import { separateFolderAndBookmarks } from '../utils/bookmarkTreeUtils';
import { useNavigate } from 'react-router';
import { useBookmarksData } from '../BookmarksContext';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type FolderListProps = {
  node: BookmarkItemType;
  depth?: number;
  folderId?: string;
};

export default function FolderList({
  node,
  depth = 0,
  folderId,
}: FolderListProps) {
  const children = node.children ?? [];
  const { folders } = separateFolderAndBookmarks(children);

  const navigate = useNavigate();
  const { reloadBookmarks } = useBookmarksData();

  const [isDropping, setIsDropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const enterCounterRef = useRef(0);

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const indentStyle = {
    paddingLeft: `${depth * 16}px`,
    minWidth: 0,
  };

  const isActive = String(node.id) === String(folderId);

  const clickHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) return;
    if (isDropping) return;

    navigate(`/bookmark/${node.id}`);
  };

  const onDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    enterCounterRef.current += 1;
  };

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    enterCounterRef.current -= 1;

    if (enterCounterRef.current <= 0) {
      enterCounterRef.current = 0;
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

    const draggedBookmarkId = e.dataTransfer.getData('text/plain');
    if (!draggedBookmarkId || !node.id) return;
    setIsDropping(true);

    const destinationFolderId = String(node.id);

    try {
      await chrome.bookmarks.move(draggedBookmarkId, {
        parentId: destinationFolderId,
      });

      if (mountedRef.current) {
        await reloadBookmarks();
        toast.success('이동되었습니다!');
      }
    } catch (err) {
      console.error('북마크 이동 실패:', err);
    } finally {
      setTimeout(() => {
        if (mountedRef.current) setIsDropping(false);
      }, 50);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!node.id) return;

    setIsDragging(true);

    e.dataTransfer.setData('text/plain', String(node.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    setIsDragging(false);
  };

  const isNewFolder = (() => {
    if (!node.dateAdded) return false;
    const createdAt = new Date(node.dateAdded);
    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);
    return diffInMinutes <= 5;
  })();

  return (
    <li className="flex flex-col  justify-start items-start max-w-50 min-w-0">
      <div
        style={indentStyle}
        draggable
        onClick={clickHandler}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={[
          'flex flex-1 gap-1 w-full min-w-0',
          isDragging ? 'opacity-60 scale-[0.995]' : '',
        ].join(' ')}
      >
        <TextButton
          className={`tracking-widest cursor-pointer flex items-start text-left hover:text-(--color-main-red) whitespace-normal break-all min-w-0 flex-1 ${
            isActive ? 'text-(--color-yellow) font-semibold' : ''
          }`}
          buttonName={node.title}
        >
          {depth > 0 && (
            <ArrowChild width={10} height={10} className="inline shrink-0" />
          )}
          <FolderIcon
            width={20}
            height={20}
            className="inline mr-2.5 ml-2.5 shrink-0"
          />
        </TextButton>
        {isNewFolder && (
          <span className="text-xs text-(--color-yellow) glass px-1 rounded-md max-h-[18px]">
            new
          </span>
        )}
      </div>

      {folders.length > 0 && (
        <ul className="flex flex-col gap-1 mt-1">
          {folders.map((childFolder) => (
            <FolderList
              key={childFolder.id}
              node={childFolder}
              depth={depth + 1}
              folderId={folderId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
