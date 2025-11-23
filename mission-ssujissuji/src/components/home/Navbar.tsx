import InputComponent from '../ui/InputComponent';
import TextButton from '../ui/TextButton';
import type { SortType } from '../../layout/RootLayout';

type NavbarProps = {
  sortType: SortType;
  onChangeSort: (type: SortType) => void;
  keyword: string;
  onChangeValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Navbar({
  sortType,
  onChangeSort,
  keyword,
  onChangeValue,
}: NavbarProps) {
  const handleRecentClick = () => onChangeSort('recent');
  const handleNameClick = () => onChangeSort('name');

  const isRecent = sortType === 'recent';
  const isName = sortType === 'name';

  return (
    <div className="flex justify-between items-end w-full mt-12">
      <div className="flex justify-start items-center gap-6 min-w-[120px]">
        <TextButton
          buttonName="최신순"
          onClick={handleRecentClick}
          // 선택된 상태에만 active 스타일(예시)
          className={isRecent ? 'font-semibold text-(--color-yellow)' : ''}
        />
        <TextButton
          buttonName="이름순"
          onClick={handleNameClick}
          className={isName ? 'font-semibold text-(--color-yellow)' : ''}
        />
      </div>
      <InputComponent
        id="search"
        placeholder="search"
        value={keyword}
        onChange={onChangeValue}
      />
    </div>
  );
}
