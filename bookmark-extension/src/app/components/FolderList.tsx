import TextButton from './ui/TextButton';
import IconFolder from '../assets/icon/folder_fill.svg?react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { separateFolderAndBookmarks } from '../utils/bookmarkTreeUtils';
import ReactDOM from 'react-dom';
import { useNavigate, useOutletContext } from 'react-router';
import { useFolderReorder } from '../hooks/useFolderReorder';
import type { OutletContextType } from '../pages/DetailPage';
import { useTranslation } from 'react-i18next';
import { useBookmarksData } from '../BookmarksContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { isRecentlyAdded } from '../utils/timeUtils';
import { useDragGhostDnD } from '../hooks/useDragGhostDnD';
import { useFolderColor } from '../features/folderColor/FolderColorContext';
import {
  COLOR_TOKENS,
  DEFAULT_COLOR_TOKEN,
} from '../features/folderColor/constants';
import { ColorToken } from '../features/folderColor/types';

type FolderListProps = {
  node: BookmarkItemType;
  depth?: number;
  folderId?: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
};

export default function FolderList({
  node,
  depth = 0,
  folderId,
  expandedIds,
  onToggleExpand,
}: FolderListProps) {
  const children = node.children ?? [];
  const { folders } = separateFolderAndBookmarks(children);
  const hasChildFolders = folders.length > 0;
  const isExpanded = expandedIds.has(String(node.id));

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reloadBookmarks } = useBookmarksData();
  const { dragMode } = useOutletContext<OutletContextType>();
  const reorderFolder = useFolderReorder();

  const [isDropping, setIsDropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragHover, setIsDragHover] = useState(false);
  // 정렬 모드 삽입 위치 표시: 위('top') / 아래('bottom')
  const [dropEdge, setDropEdge] = useState<'top' | 'bottom' | null>(null);
  // 루트(북마크바/기타)는 순서 대상이 아님 → 자식 폴더만 재정렬
  const reorderEnabled = dragMode === 'reorder' && node.id !== '1' && node.id !== '2';

  const [isColorOpen, setIsColorOpen] = useState(false);
  const [folderPos, setFolderPos] = useState({ top: 0, left: 0 });
  const folderIconRef = useRef<SVGSVGElement | null>(null);

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
    if (reorderEnabled) return; // 정렬 모드에선 중첩 하이라이트 안 함

    enterCounterRef.current += 1;
    setIsDragHover(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (reorderEnabled) {
      const next = e.relatedTarget as Node | null;
      if (next && e.currentTarget.contains(next)) return;
      setDropEdge(null);
      return;
    }

    enterCounterRef.current -= 1;

    if (enterCounterRef.current <= 0) {
      enterCounterRef.current = 0;
    }

    setIsDragHover(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    e.dataTransfer.dropEffect = 'move';

    if (reorderEnabled) {
      // 세로 리스트: 커서가 위/아래 절반인지로 앞/뒤 판정
      const rect = e.currentTarget.getBoundingClientRect();
      setDropEdge(e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom');
    }
  };

  const { onDragStart, onDragEnd } = useDragGhostDnD({
    draggedId: node.id,
    payloadPrefix: 'folder',
    disabled: !node.id,
    onDragStartUI: () => {
      setIsDragging(true);
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

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const raw = e.dataTransfer.getData('text/plain');
    if (!raw || !node.id) return;

    const draggedId = raw.replace(/^(folder|bookmark):/, '');
    if (String(draggedId) === String(node.id)) return;

    // 정렬 모드: 순서 재정렬 (사이드바는 네이티브 순서 기준)
    if (reorderEnabled) {
      const edge = dropEdge;
      setDropEdge(null);
      reorderFolder(draggedId, String(node.id), edge === 'bottom');
      return;
    }

    // 이동 모드: 기존 중첩 이동
    enterCounterRef.current = 0;
    setIsDragHover(false);
    try {
      await chrome.bookmarks.move(draggedId, {
        parentId: node.id,
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

  const isNew = isRecentlyAdded(node.dateAdded);

  const { colorMap, setFolderColor } = useFolderColor();

  const token: ColorToken = useMemo(() => {
    return colorMap[String(node.id)] ?? DEFAULT_COLOR_TOKEN;
  }, [colorMap, node.id]);

  const handleFolderIcon = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (folderIconRef.current) {
      const rect = folderIconRef.current.getBoundingClientRect();
      setFolderPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.right - 80,
      });
    }
    setIsColorOpen(true);
  };

  return (
    <li className="flex flex-col justify-start items-start max-w-80 min-w-0">
      <div
        style={indentStyle}
        draggable
        onClick={clickHandler}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={[
          'relative flex flex-1 gap-1 w-full min-w-0',
          isDragging
            ? 'opacity-30 blur-[0.5px] cursor-grabbing transition-opacity duration-150 ease-out'
            : '',
          isDragHover ? 'underline text-(--text-hover)' : '',
          dropEdge === 'top'
            ? 'before:content-[""] before:absolute before:-top-0.5 before:left-0 before:right-0 before:h-0.5 before:rounded-full before:bg-(--text-selected)'
            : '',
          dropEdge === 'bottom'
            ? 'after:content-[""] after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-(--text-selected)'
            : '',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpand(String(node.id));
          }}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? t('aria.collapseFolder') : t('aria.expandFolder')
          }
          className={[
            'shrink-0 w-4 h-4 mt-1 flex items-center justify-center cursor-pointer hover:text-(--text-hover)',
            hasChildFolders ? '' : 'invisible',
          ].join(' ')}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <TextButton
          className={`tracking-wide cursor-pointer flex items-start text-left hover:text-(--text-hover) whitespace-normal break-all min-w-0 flex-1 ${
            isActive ? 'text-(--text-selected)' : ''
          }
          }`}
          buttonName={node.title}
        >

          <span
            className="inline mr-2.5 ml-2.5 shrink-0 relative"
            style={{ color: `var(--folder-${token})` }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsColorOpen((v) => !v);
            }}
          >
            <IconFolder
              ref={folderIconRef}
              width={16}
              height={16}
              onClick={handleFolderIcon}
            />

            {isColorOpen &&
              ReactDOM.createPortal(
                <>
                  <div
                    className="fixed inset-0 "
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsColorOpen(false);
                    }}
                  />
                  <div
                    className="absolute z-9999 mt-2 left-0 glass__dark p-2 rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsColorOpen(false);
                    }}
                    style={{
                      top: `${folderPos.top}px`,
                      left: `${folderPos.left}px`,
                    }}
                  >
                    <div className="flex gap-2">
                      {COLOR_TOKENS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={[
                            'w-4 h-4 rounded-full border',
                            t === token ? 'border-white/80' : 'border-white/20',
                          ].join(' ')}
                          style={{ backgroundColor: `var(--folder-${t})` }}
                          onClick={async () => {
                            try {
                              await setFolderColor(String(node.id), t);
                            } finally {
                              setIsColorOpen(false);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>,
                document.body,
              )}
          </span>
        </TextButton>
        {isNew && (
          <span className="text-xs text-(--text-selected) glass px-1 rounded-md max-h-[18px]">
            new
          </span>
        )}
      </div>

      {hasChildFolders && isExpanded && (
        <ul className="flex flex-col gap-1 mt-1">
          {folders.map((childFolder) => (
            <FolderList
              key={childFolder.id}
              node={childFolder}
              depth={depth + 1}
              folderId={folderId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
