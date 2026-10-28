import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconBookmark from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { useBookmarksData } from '@/app/BookmarksContext';
import { useUrlActions } from '@/app/hooks/useUrlActions';
import toast from 'react-hot-toast';
import BookmarkEditModal, { BookmarkSubmitValue } from '../BookmarkEditModal';
import { isRecentlyAdded } from '@/app/utils/timeUtils';
import { useDragGhostDnD } from '@/app/hooks/useDragGhostDnD';
import { useDragState } from '@/app/DragContext';

export default function BookmarkListItem({
  url,
  title,
  id,
  dateAdded,
  index,
  onReorder,
}: {
  url: string;
  title: string;
  id: string;
  dateAdded?: number;
  /** 폴더 내 표시 순서(위치). onReorder와 함께 넘기면 순서 이동 가능 */
  index?: number;
  /** 다른 북마크를 이 위치로 떨어뜨렸을 때 호출 (검색 결과 목록에서는 넘기지 않음) */
  onReorder?: (draggedId: string, targetIndex: number, placeBelow: boolean) => void;
}) {
  const { t } = useTranslation();
  const { draggingId, setDraggingId, canDrop } = useDragState();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const [isDragging, setIsDragging] = useState(false);
  // 드롭 시 삽입될 위치 표시: 이 아이템의 위쪽('top') / 아래쪽('bottom')
  const [dropEdge, setDropEdge] = useState<'top' | 'bottom' | null>(null);

  const reorderEnabled = typeof index === 'number' && Boolean(onReorder);
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
      toast.success(t('toast.bookmarkUpdated'));
    } catch (error) {
      console.error('수정 실패:', error);
    } finally {
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(t('confirm.deleteBookmark'));
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
      setDraggingId(id);
    },
    onDragEndUI: () => {
      setIsDragging(false);
      setDraggingId(null);
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

  const parseDraggedId = (e: React.DragEvent) => {
    const plain = e.dataTransfer.getData('text/plain');
    if (!plain) return '';
    return plain.replace(/^(folder|bookmark):/, '');
  };

  // 이 아이템 영역에서 커서가 위쪽 절반인지 아래쪽 절반인지로 삽입 위치를 계산
  const computeEdge = (e: React.DragEvent<HTMLElement>): 'top' | 'bottom' => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
  };

  const onReorderDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!reorderEnabled) return;
    // 자기 자신 위로는 표시하지 않음
    if (draggingId && draggingId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropEdge(computeEdge(e));
  };

  const onReorderDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (!reorderEnabled) return;
    // 자식 요소로 이동하는 경우는 무시(깜빡임 방지)
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    setDropEdge(null);
  };

  const onReorderDrop = (e: React.DragEvent<HTMLElement>) => {
    if (!reorderEnabled || index === undefined || !onReorder) return;
    const edge = dropEdge ?? computeEdge(e);
    setDropEdge(null);

    const draggedId = parseDraggedId(e);
    if (!draggedId || draggedId === id) return;
    // 드래그 대상이 드롭 가능한지(자기 자신 제외) 확인
    if (!canDrop(id)) return;

    e.preventDefault();
    e.stopPropagation();
    onReorder(draggedId, index, edge === 'bottom');
  };

  const isNew = isRecentlyAdded(dateAdded);

  return (
    <>
      <li
        draggable
        onClick={handleItemClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onReorderDragOver}
        onDragLeave={onReorderDragLeave}
        onDrop={onReorderDrop}
        className={[
          'flex relative justify-between items-center glass rounded-lg gap-4 px-6 py-3 glass--hover cursor-pointer min-w-[500px] hover:underline',
          isDragging
            ? 'opacity-30 blur-[0.5px] cursor-grabbing transition-opacity duration-150 ease-out'
            : '',
          dropEdge === 'top'
            ? 'before:content-[""] before:absolute before:-top-1 before:left-0 before:right-0 before:h-0.5 before:rounded-full before:bg-(--text-selected)'
            : '',
          dropEdge === 'bottom'
            ? 'after:content-[""] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-(--text-selected)'
            : '',
        ].join(' ')}
      >
        <div className="flex flex-1 min-w-0 justify-start items-center gap-4  ">
          <div className="flex flex-1 min-w-0 items-center gap-4 ">
            {/* <IconDefault width={20} height={20} className="shrink-0" /> */}
            <IconBookmark width={20} height={20} className="shrink-0" />
            <span className="text-base font-['LeferiBaseRegular'] align-middle truncate">
              {title}
            </span>
          </div>
          {isNew && (
            <span className="text-xs text-(--text-selected) glass px-1 rounded-md max-h-[18px]">
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
