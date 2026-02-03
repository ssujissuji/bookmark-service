import InputComponent from '../ui/InputComponent';
import TextButton from '../ui/TextButton';
import type { SortType } from '../../layout/RootLayout';

type NavbarProps = {
  sortType: SortType;
  keyword?: string;
  onChangeSort: (type: SortType) => void;
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
  onChangeValue,
  onKeyDown,
  onReset,
}: NavbarProps) {
  const handleRecentClick = () => onChangeSort('recent');
  const handleNameClick = () => onChangeSort('name');

  const isRecent = sortType === 'recent';
  const isName = sortType === 'name';

  return (
    <div className="flex justify-between items-end w-full mt-12">
      <div className="flex justify-start items-center min-w-[120px]">
        <TextButton
          buttonName="최신순"
          onClick={handleRecentClick}
          className={[
            'px-4 py-2 rounded-lg text-sm transition cursor-pointer',
            isRecent
              ? 'text-lg font-semibold text-(--text-selected)'
              : ' text-(--text-muted) hover:bg-white/10',
          ].join(' ')}
        />
        <TextButton
          buttonName="이름순"
          onClick={handleNameClick}
          className={[
            'px-4 py-2 rounded-lg text-sm transition cursor-pointer',
            isName
              ? 'text-lg font-semibold text-(--text-selected)'
              : 'text-(--text-muted) hover:bg-white/20',
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
  );
}
