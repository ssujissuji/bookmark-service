import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconFolder from '../../assets/icon/folder_fill.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { useFolderActions } from '@/app/hooks/useFoldersActions';
import { useBookmarksData } from '@/app/BookmarksContext';
import { useConfirm } from '@/app/ConfirmContext';
import toast from 'react-hot-toast';
import FolderEditModal from '../FolderEditModal';
import { Pin } from 'lucide-react';
import { isRecentlyAdded } from '@/app/utils/timeUtils';
import { useDragGhostDnD } from '@/app/hooks/useDragGhostDnD';
import { useFolderColor } from '@/app/features/folderColor/FolderColorContext';
import {
  COLOR_TOKENS,
  DEFAULT_COLOR_TOKEN,
} from '@/app/features/folderColor/constants';
import type { ColorToken } from '@/app/features/folderColor/types';
import type { DragMode } from '@/app/layout/RootLayout';

export default function BookmarkCard({
  title,
  type,
  id,
  dateAdded,
  iconColor,
  onClick,
  dragMode = 'move',
  onReorder,
}: {
  title: string;
  type: string;
  id?: string;
  dateAdded?: number;
  iconColor?: string;
  onClick: () => void;
  /** 'reorder'면 드롭 시 순서 재정렬, 'move'면 기존 중첩 이동 */
  dragMode?: DragMode;
  /** 정렬 모드에서 다른 폴더를 이 카드 위치로 떨어뜨렸을 때 호출 */
  onReorder?: (draggedId: string, targetId: string, placeBelow: boolean) => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const confirm = useConfirm();
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
  // 정렬 모드 삽입 위치 표시: 카드 왼쪽('start') / 오른쪽('end')
  const [dropEdge, setDropEdge] = useState<'start' | 'end' | null>(null);
  const reorderEnabled =
    dragMode === 'reorder' && !isRootFolder && Boolean(id) && Boolean(onReorder);

  const [isColorOpen, setIsColorOpen] = useState(false);
  const [folderPos, setFolderPos] = useState({ top: 0, left: 0 });
  const folderIconRef = useRef<SVGSVGElement | null>(null);
  const { colorMap, setFolderColor } = useFolderColor();

  const token: ColorToken = useMemo(() => {
    if (!targetFolderId) return DEFAULT_COLOR_TOKEN;
    return colorMap[String(targetFolderId)] ?? DEFAULT_COLOR_TOKEN;
  }, [colorMap, targetFolderId]);

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
    const confirmed = await confirm({
      message: t('confirm.deleteFolder'),
      confirmText: t('action.delete'),
      danger: true,
    });
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
      toast.success(t('toast.folderRenamed'));
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

  const parseDraggedId = (raw: string) =>
    raw.replace(/^(folder|bookmark):/, '');

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
      setIsDragHover(false);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (reorderEnabled) {
      // 그리드: 커서가 카드 왼쪽/오른쪽 절반인지로 앞/뒤 판정
      const rect = e.currentTarget.getBoundingClientRect();
      setDropEdge(e.clientX < rect.left + rect.width / 2 ? 'start' : 'end');
    }
  };

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const raw = e.dataTransfer.getData('text/plain');
    if (!raw || !targetFolderId) return;
    const draggedId = parseDraggedId(raw);
    if (String(draggedId) === String(targetFolderId)) return;

    // 정렬 모드: 순서 재정렬
    if (reorderEnabled && id && onReorder) {
      const edge = dropEdge;
      setDropEdge(null);
      onReorder(draggedId, id, edge === 'end');
      return;
    }

    // 이동 모드: 기존 중첩 이동
    enterCounterRef.current = 0;
    setIsDragHover(false);
    try {
      await chrome.bookmarks.move(draggedId, {
        parentId: String(targetFolderId),
      });

      await reloadBookmarks();
      toast.success(t('toast.moved'));
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

  const handleFolderIcon = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (folderIconRef.current) {
      const rect = folderIconRef.current.getBoundingClientRect();
      setFolderPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 80,
      });
    }
    setIsColorOpen(true);
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
          dropEdge === 'start'
            ? 'before:content-[""] before:absolute before:top-1 before:bottom-1 before:-left-1 before:w-0.5 before:rounded-full before:bg-(--text-selected)'
            : '',
          dropEdge === 'end'
            ? 'after:content-[""] after:absolute after:top-1 after:bottom-1 after:-right-1 after:w-0.5 after:rounded-full after:bg-(--text-selected)'
            : '',
        ].join(' ')}
      >
        <div className="flex flex-1 min-w-0 gap-5 cursor-pointer">
          <div className="relative shrink-0">
            <button
              type="button"
              draggable={false}
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (isDragging) return;

                setIsColorOpen((v) => !v);
              }}
            >
              <IconFolder
                ref={folderIconRef}
                width={60}
                height={60}
                className="shrink-0"
                style={{
                  color: iconColor ?? `var(--folder-${token})`,
                }}
                onClick={handleFolderIcon}
              />
            </button>

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
                    className="absolute  w-fit min-w-36 z-9999 mt-2 left-0 glass__dark p-2 px-3 rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      top: `${folderPos.top}px`,
                      left: `${folderPos.left}px`,
                    }}
                  >
                    <div className="flex gap-2 ">
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
                            if (!targetFolderId) return;
                            try {
                              await setFolderColor(String(targetFolderId), t);
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
          </div>
          <div className="flex min-w-0 flex-col justify-center rounded-xl gap-1.5">
            <div className="flex justify-start items-center gap-2">
              {type === 'bookmarkBar' && (
                <div className="w-fit  bookmark-tag text-xs  rounded-sm">
                  bookmark-bar
                </div>
              )}
              {type === 'others' && (
                <div className="w-fit  bookmark-tag text-xs rounded-sm">
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
