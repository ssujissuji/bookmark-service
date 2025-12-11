import TextButton from './ui/TextButton';
import FolderIcon from '../assets/icon/folder.svg?react';
import ArrowChild from '../assets/icon/arrow_child.svg?react';
import { separateFolderAndBookmarks } from '../utils/bookmarkTreeUtils';
import { useNavigate } from 'react-router';
import type React from 'react';
import { useBookmarksData } from '../BookmarksContext';

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

  const navigate = useNavigate();

  const indentStyle = {
    paddingLeft: `${depth * 16}px`,
  };

  const isActive = String(node.id) === String(folderId);

  const clickHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/bookmark/${node.id}`);
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const draggedBookmarkId = e.dataTransfer.getData('text/plain');
    if (!draggedBookmarkId) return;

    const destinationFolderId = String(node.id);

    try {
      await chrome.bookmarks.move(draggedBookmarkId, {
        parentId: destinationFolderId,
      });
      await reloadBookmarks();
    } catch (err) {
      console.error('북마크 이동 실패:', err);
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
            // text-[var(--color-yellow)] : Tailwind arbitrary value 문법으로 CSS 변수 사용
            className={`tracking-widest cursor-pointer flex items-center ${
              isActive ? 'text-[var(--color-yellow)] font-semibold' : ''
            }`}
            buttonName={node.title}
          >
            {/* 자식 폴더가 있을 때만 화살표 보여주고 싶다면 조건부 렌더링도 가능 */}
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
