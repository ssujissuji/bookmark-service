import { Outlet } from 'react-router';
import Header from '../components/home/Header';
import { useState } from 'react';

export type SortType = 'recent' | 'name';

export default function RootLayout() {
  const [sortType, setSortType] = useState<SortType>('recent');
  const [inputValue, setInputValue] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isComposing, setIsComposing] = useState(false);

  const handleChangeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);

    if (isComposing || (e.nativeEvent as InputEvent).isComposing) return;

    setSearchKeyword(value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    const value = e.currentTarget.value;
    setIsComposing(false);
    setInputValue(value);
    setSearchKeyword(value); // 🔥 완성된 문자열로 검색
  };

  // Enter 눌렀을 때 검색 확정
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      const value = e.currentTarget.value;
      setInputValue(value);
      setSearchKeyword(value);
    }
  };

  return (
    <div className="w-full  mx-auto flex flex-col gap-4 pb-25 pt-16">
      <Header
        sortType={sortType}
        onChangeSort={setSortType}
        keyword={inputValue}
        onChangeKeyword={handleChangeKeyword}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
      />
      <Outlet context={{ sortType, keyword: searchKeyword }} />
    </div>
  );
}
