import { Outlet } from 'react-router';
import Header from '../components/home/Header';
import { useState } from 'react';

export type SortType = 'recent' | 'name';

export default function RootLayout() {
  const [sortType, setSortType] = useState<SortType>('recent');
  const [keyword, setKeyword] = useState<string>('');
  const handleChangeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  return (
    <div className="w-full min-w-[510px] mx-auto flex flex-col gap-4 pb-25 pt-16">
      <Header
        sortType={sortType}
        onChangeSort={setSortType}
        keyword={keyword}
        onChangeKeyword={handleChangeKeyword}
      />
      <Outlet context={{ sortType, keyword }} />
    </div>
  );
}
