import { useTranslation } from 'react-i18next';
import InputComponent from '../ui/InputComponent';
import TextButton from '../ui/TextButton';
import type { DragMode, SortType } from '../../layout/RootLayout';

type NavbarProps = {
  sortType: SortType;
  keyword?: string;
  onChangeSort: (type: SortType) => void;
  dragMode: DragMode;
  onChangeDragMode: (mode: DragMode) => void;
  onChangeValue?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCompositionStart?: (e: React.CompositionEvent<HTMLInputElement>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<HTMLInputElement>) => void;
  onReset?: () => void;
};

export default function Navbar({
  sortType,
  keyword,
  onChangeSort,
  dragMode,
  onChangeDragMode,
  onChangeValue,
  onKeyDown,
  onReset,
}: NavbarProps) {
  const { t } = useTranslation();
  const handleRecentClick = () => onChangeSort('recent');
  const handleNameClick = () => onChangeSort('name');

  const isRecent = sortType === 'recent';
  const isName = sortType === 'name';
  const isReorder = dragMode === 'reorder';

  return (
    <div className="flex justify-between items-end w-full mt-12">
      <div className="flex justify-start items-center min-w-[120px]">
        <TextButton
          buttonName={t('sort.recent')}
          onClick={handleRecentClick}
          className={[
            'px-4 py-2 rounded-lg text-sm transition cursor-pointer',
            isRecent
              ? 'text-lg font-semibold text-(--text-selected)'
              : ' text-(--text-muted) hover:bg-white/10',
          ].join(' ')}
        />
        <TextButton
          buttonName={t('sort.name')}
          onClick={handleNameClick}
          className={[
            'px-4 py-2 rounded-lg text-sm transition cursor-pointer',
            isName
              ? 'text-lg font-semibold text-(--text-selected)'
              : 'text-(--text-muted) hover:bg-white/20',
          ].join(' ')}
        />
        {sortType === 'manual' && (
          <span
            className="px-3 py-1 ml-1 rounded-full text-xs font-semibold text-(--text-selected) border border-(--text-selected)/40"
            title={t('sort.manualHint')}
          >
            {t('sort.manual')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* 폴더 드래그 모드: 이동 ↔ 정렬 */}
        <div
          className="flex items-center rounded-full glass p-0.5 text-xs"
          title={t('dnd.modeHint')}
        >
          <TextButton
            buttonName={t('dnd.modeMove')}
            onClick={() => onChangeDragMode('move')}
            className={[
              'px-3 py-1 rounded-full transition cursor-pointer',
              !isReorder
                ? 'font-semibold text-(--text-selected) bg-white/10'
                : 'text-(--text-muted)',
            ].join(' ')}
          />
          <TextButton
            buttonName={t('dnd.modeReorder')}
            onClick={() => onChangeDragMode('reorder')}
            className={[
              'px-3 py-1 rounded-full transition cursor-pointer',
              isReorder
                ? 'font-semibold text-(--text-selected) bg-white/10'
                : 'text-(--text-muted)',
            ].join(' ')}
          />
        </div>
        <InputComponent
          id="search"
          placeholder="search"
          value={keyword}
          onChange={onChangeValue}
          onKeyDown={onKeyDown}
          onReset={onReset}
        />
      </div>
    </div>
  );
}
