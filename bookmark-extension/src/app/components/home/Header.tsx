import Title from '../ui/Title';
import TextButton from '../ui/TextButton';
import ArrowLeft from '../../assets/icon/arrow-left.svg?react';
import SettingIcon from '../../assets/icon/setting.svg?react';
import Navbar from './Navbar';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import FolderEditModal from '../FolderEditModal';
import { useNavigate, useParams } from 'react-router';
import { findPathToNode } from '../../utils/bookmarkTreeUtils';
import type { SortType } from '../../layout/RootLayout';
import { useBookmarksData } from '@/app/BookmarksContext';
import { useFolderActions } from '@/app/hooks/useFoldersActions';
import toast from 'react-hot-toast';

type HeaderProps = {
  sortType: SortType;
  keyword: string;
  onChangeSort: (type: SortType) => void;
  onChangeKeyword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function Header({
  sortType,
  keyword,
  onChangeSort,
  onChangeKeyword,
  onKeyDown,
}: HeaderProps) {
  const { folderId } = useParams<{ folderId: string }>();
  const { data, status } = useBookmarksData();
  const { createFolder } = useFolderActions();

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  let currentTitle = 'MyBookMark';
  let parentTitle = '';
  let parentId: string = '1';

  if (data && folderId) {
    const rootNodes = data[0]?.children ?? [];

    const path = findPathToNode(rootNodes, folderId);

    if (path && path.length > 0) {
      const currentFolder = path[path.length - 1]; // 마지막: 현재 폴더
      const parentFolder = path[path.length - 2]; // 그 앞: 상위 폴더 (없을 수도 있음)

      if (currentFolder?.title) currentTitle = currentFolder.title;
      if (parentFolder?.title) {
        parentTitle = parentFolder.title;
        parentId = parentFolder.id;
      }
    }
  }

  if (status !== 'success' || !data) {
    return null;
  }

  const currentFolderId = '1'; // 기본 북마크바에 생성되도록 설정

  const handleSubmit = async (name: string, desc: string) => {
    try {
      await createFolder({
        title: name,
        parentId: currentFolderId,
      });
      console.log('새 폴더 생성 데이터:', { name, desc });
      toast.success('✅ 폴더가 생성되었습니다!');
      setIsOpen(false);
    } catch (error) {
      toast.error('❌ 폴더 생성에 실패했습니다.');
      console.error('폴더 생성 실패:', error);
    }
  };

  const clickParentHandler = () => {
    console.log('click backward');
    if (folderId === '1' || folderId === '2') navigate('/');
    else navigate(`/bookmark/${parentId}`);
  };

  return (
    <>
      <div className="flex flex-col justify-start items-start gap-5">
        {folderId === '1' || folderId === '2' ? (
          <TextButton
            className="button__text"
            buttonName={`MyBookMark /`}
            onClick={clickParentHandler}
          >
            <ArrowLeft className="inline mr-2" />
          </TextButton>
        ) : (
          <TextButton
            className={`button__text ${currentTitle === 'MyBookMark' ? 'hidden' : ''}`}
            buttonName={`${parentTitle} /`}
            onClick={clickParentHandler}
          >
            <ArrowLeft className="inline mr-2" />
          </TextButton>
        )}

        <div className="flex justify-start items-baseline gap-8">
          <Title title={currentTitle ?? 'MyBookMark'} />
          {currentTitle !== 'MyBookMark' && (
            <span className="button__text" onClick={handleOpen}>
              <SettingIcon />
            </span>
          )}
        </div>
      </div>
      <Navbar
        sortType={sortType}
        onChangeSort={onChangeSort}
        keyword={keyword}
        onChangeValue={onChangeKeyword}
        onKeyDown={onKeyDown}
      />
      {isOpen &&
        ReactDOM.createPortal(
          <>
            {/* 화면 전체 덮는 오버레이 */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-9998"
              onClick={() => {
                setIsOpen(false);
              }}
            ></div>
            <div
              className="fixed z-9999 inset-0 flex justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderEditModal
                type="edit"
                onCancel={() => setIsOpen(false)}
                onSubmit={handleSubmit}
              />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
