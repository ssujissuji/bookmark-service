import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ChevronDown, ChevronUp, CornerLeftUp } from 'lucide-react';
import toast from 'react-hot-toast';
import IconFolder from '../assets/icon/folder_fill.svg?react';
import { useBookmarksData } from '../BookmarksContext';
import { useFolderColor } from '../features/folderColor/FolderColorContext';
import { DEFAULT_COLOR_TOKEN } from '../features/folderColor/constants';
import { ColorToken } from '../features/folderColor/types';

type FolderChipProps = {
  folder: BookmarkTreeType;
  isActive?: boolean;
  variant?: 'default' | 'parent';
};

function FolderChip({
  folder,
  isActive = false,
  variant = 'default',
}: FolderChipProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reloadBookmarks } = useBookmarksData();
  const { colorMap } = useFolderColor();

  const isParent = variant === 'parent';

  const [isDragHover, setIsDragHover] = useState(false);
  const enterCounterRef = useRef(0);

  const token: ColorToken = useMemo(() => {
    return colorMap[String(folder.id)] ?? DEFAULT_COLOR_TOKEN;
  }, [colorMap, folder.id]);

  const onDragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (isActive) return;
    e.preventDefault();
    e.stopPropagation();
    enterCounterRef.current += 1;
    setIsDragHover(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (isActive) return;
    e.preventDefault();
    e.stopPropagation();
    enterCounterRef.current -= 1;
    if (enterCounterRef.current <= 0) {
      enterCounterRef.current = 0;
      setIsDragHover(false);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (isActive) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = async (e: React.DragEvent<HTMLElement>) => {
    if (isActive) return;
    e.preventDefault();
    e.stopPropagation();

    enterCounterRef.current = 0;
    setIsDragHover(false);

    const raw = e.dataTransfer.getData('text/plain');
    if (!raw || !folder.id) return;

    let draggedId = raw;
    if (raw.startsWith('folder:')) draggedId = raw.replace('folder:', '');
    if (raw.startsWith('bookmark:')) draggedId = raw.replace('bookmark:', '');

    if (String(draggedId) === String(folder.id)) return;

    try {
      await chrome.bookmarks.move(draggedId, { parentId: folder.id });
      await reloadBookmarks();
      toast.success(t('toast.moved'));
    } catch (err) {
      console.error('북마크 이동 실패:', err);
      toast.error(t('toast.moveFailed'));
    }
  };

  const clickHandler = () => {
    if (isActive) return;
    navigate(`/bookmark/${folder.id}`);
  };

  return (
    <button
      type="button"
      onClick={clickHandler}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      title={folder.title}
      aria-current={isActive ? 'page' : undefined}
      aria-label={isParent ? t('aria.goToParent') : undefined}
      className={[
        'glass',
        isActive ? '' : 'glass--hover cursor-pointer',
        'flex items-center gap-2 min-w-0 max-w-full',
        'rounded-full px-3 py-1.5',
        isParent ? 'border border-dashed border-white/30' : 'border border-white/10',
        isActive
          ? 'outline-2 outline-(--text-selected) text-(--text-selected)'
          : '',
        isDragHover ? 'outline-2 outline-(--text-hover)' : '',
      ].join(' ')}
    >
      {isParent ? (
        <CornerLeftUp size={14} className="shrink-0" />
      ) : (
        <span className="shrink-0" style={{ color: `var(--folder-${token})` }}>
          <IconFolder width={16} height={16} />
        </span>
      )}
      <span className="text-xs truncate">{folder.title}</span>
    </button>
  );
}

type FolderChipSectionProps = {
  parentFolder?: BookmarkTreeType;
  siblings: BookmarkTreeType[];
  childFolders: BookmarkTreeType[];
  currentFolderId?: string;
};

export default function FolderChipSection({
  parentFolder,
  siblings,
  childFolders,
  currentFolderId,
}: FolderChipSectionProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasAnyChip =
    Boolean(parentFolder) || siblings.length > 0 || childFolders.length > 0;
  if (!hasAnyChip) return null;

  return (
    <div className="flex flex-col gap-3 w-full border-b border-white/10 pb-4">
      <div className="flex justify-between items-center w-full">
        <span className="text-xs text-(--text-main) opacity-70">
          {t('section.subFolders')}
        </span>
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          aria-expanded={!isCollapsed}
          aria-label={
            isCollapsed ? t('aria.expandSection') : t('aria.collapseSection')
          }
          className="cursor-pointer hover:text-(--text-hover)"
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
      {!isCollapsed && (
        <>
          <div className="flex flex-wrap gap-2 w-full">
            {parentFolder && (
              <FolderChip folder={parentFolder} variant="parent" />
            )}
            {siblings.map((folder) => (
              <FolderChip
                key={folder.id}
                folder={folder}
                isActive={String(folder.id) === String(currentFolderId)}
              />
            ))}
          </div>
          {childFolders.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 w-full">
              <span className="text-xs text-(--text-main) opacity-50 shrink-0">
                {t('section.childFolders')}
              </span>
              {childFolders.map((folder) => (
                <FolderChip key={folder.id} folder={folder} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
