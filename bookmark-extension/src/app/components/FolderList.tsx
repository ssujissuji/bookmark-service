import TextButton from './ui/TextButton';
import FolderIcon from '../assets/icon/folder.svg?react';
import ArrowChild from '../assets/icon/arrow_child.svg?react';
import { separateFolderAndBookmarks } from '../utils/bookmarkTreeUtils';
import { useNavigate } from 'react-router';
import type React from 'react';
import { useBookmarksData } from '../BookmarksContext';
import { useEffect, useRef, useState } from 'react';

type FolderListProps = {
  node: BookmarkItemType; // 이 폴더 하나
  depth?: number; // (선택) 들여쓰기 단계
  folderId?: string;
};

export default function FolderList({
  node,
  depth = 0,
  folderId,
}: FolderListProps) {
  const children = node.children ?? [];
  const { folders } = separateFolderAndBookmarks(children);
  const { reloadBookmarks } = useBookmarksData();
  const [isDropping, setIsDropping] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const navigate = useNavigate();

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

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDropping(true);

    const draggedBookmarkUrl = e.dataTransfer.getData('text/plain');
    const draggedBookmarkId = await chrome.bookmarks
      .search({ url: draggedBookmarkUrl })
      .then((results) => results[0]?.id);

    if (!draggedBookmarkId) {
      setTimeout(() => {
        setIsDropping(false);
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
      } else {
        console.log('컴포넌트가 언마운트되어 상태를 업데이트하지 않습니다.');
      }
    } catch (err) {
      console.error('북마크 이동 실패:', err);
    } finally {
      setTimeout(() => {
        setIsDropping(false);
      }, 50);
    }
  };

  return (
    <div className="flex flex-col justify-start items-start ">
      <li className={'button__text__folder'}>
        <div
          style={indentStyle}
          onClick={clickHandler}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <TextButton
            className={`tracking-widest cursor-pointer flex items-center ${
              isActive ? 'text-[var(--color-yellow)] font-semibold' : ''
            }`}
            buttonName={node.title}
          >
            {depth > 0 && (
              <ArrowChild width={10} height={10} className="inline" />
            )}
            <FolderIcon
              width={20}
              height={20}
              className="inline mr-2.5 ml-2.5"
            />
          </TextButton>
        </div>
      </li>
      {folders.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1 ">
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
    </div>
  );
}
