import { Outlet, useLocation } from 'react-router';
import Header from '../components/home/Header';
import { useEffect, useState } from 'react';

export type SortType = 'recent' | 'name';

export default function RootLayout() {
  const [sortType, setSortType] = useState<SortType>('recent');
  const [inputValue, setInputValue] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const location = useLocation();

  useEffect(() => {
    setInputValue('');
    setSearchKeyword('');
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(inputValue);
    }, 300);

    return () => clearTimeout(timer); // 사용자가 다음 글자를 타이핑하면 이전 타이머를 취소
  }, [inputValue]);

  const handleChangeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchKeyword(inputValue);
    }
  };

  const handleReset = () => {
    setInputValue('');
    setSearchKeyword('');
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-4 pb-25 pt-16">
      <Header
        sortType={sortType}
        onChangeSort={setSortType}
        keyword={inputValue}
        onChangeKeyword={handleChangeKeyword}
        onKeyDown={handleKeyDown}
        onReset={handleReset}
      />
      <Outlet context={{ sortType, keyword: searchKeyword }} />
    </div>
  );
}
