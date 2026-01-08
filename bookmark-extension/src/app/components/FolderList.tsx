import TextButton from './ui/TextButton';
import FolderIcon from '../assets/icon/folder.svg?react';
import ArrowChild from '../assets/icon/arrow_child.svg?react';
import { separateFolderAndBookmarks } from '../utils/bookmarkTreeUtils';
import { useNavigate } from 'react-router';
import type React from 'react';
import { useBookmarksData } from '../BookmarksContext';
import { useEffect, useRef, useState } from 'react';

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

  // ✅ 드롭 후보(마우스가 올라간 드롭 타겟) 하이라이트 상태
  const [isDragHover, setIsDragHover] = useState(false);

  // ✅ dragenter/dragleave가 자식 요소 때문에 튀면서 깜빡이는 걸 방지하는 카운터
  const enterCounterRef = useRef(0);

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const indentStyle = {
    paddingLeft: `${depth * 16}px`,
  };

  const isActive = String(node.id) === String(folderId);

  const clickHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDropping) return;

    navigate(`/bookmark/${node.id}`);
  };

  const onDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    enterCounterRef.current += 1;

    const hasText = e.dataTransfer.types?.includes('text/plain');
    if (hasText) setIsDragHover(true);
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

    if (!isDragHover) setIsDragHover(true);
  };

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragHover(false);
    enterCounterRef.current = 0;

    setIsDropping(true);

    const draggedBookmarkId = e.dataTransfer.getData('text/plain');

    if (!draggedBookmarkId) {
      setTimeout(() => {
        if (mountedRef.current) setIsDropping(false);
      }, 50);
      return;
    }

    const destinationFolderId = String(node.id);

    try {
      await chrome.bookmarks.move(draggedBookmarkId, {
        parentId: destinationFolderId,
      });

      if (mountedRef.current) {
        await reloadBookmarks();
      }
    } catch (err) {
      console.error('북마크 이동 실패:', err);
    } finally {
      setTimeout(() => {
        if (mountedRef.current) setIsDropping(false);
      }, 50);
    }
  };

  /**
   * ✅ 하이라이트 스타일 가이드
   * - isActive: 현재 선택된 폴더(라우트 기준)
   * - isDragHover: 드롭 후보(드래그가 올라가 있는 폴더)
   * - isDropping: 드롭 처리 중(클릭 방지/살짝 비활성 느낌)
   */
  // const dropHoverClass = isDragHover
  //   ? 'bg-white/10 ring-2 ring-white/35 scale-[1.01]'
  //   : '';

  // const droppingClass = isDropping ? 'opacity-70' : '';

  return (
    <li className="flex flex-col justify-start items-start">
      <div
        style={indentStyle}
        onClick={clickHandler}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <TextButton
          className={`tracking-widest cursor-pointer flex items-center hover:text-(--color-main-red) ${
            isActive ? 'text-[var(--color-yellow)] font-semibold' : ''
          }`}
          buttonName={node.title}
        >
          {depth > 0 && (
            <ArrowChild width={10} height={10} className="inline" />
          )}
          <FolderIcon width={20} height={20} className="inline mr-2.5 ml-2.5" />
        </TextButton>
      </div>

      {folders.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1">
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
