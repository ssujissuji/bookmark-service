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
import { Trash } from 'lucide-react';

type HeaderProps = {
  sortType: SortType;
  keyword: string;
  onChangeSort: (type: SortType) => void;
  onChangeKeyword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onReset?: () => void;
};

export default function Header({
  sortType,
  keyword,
  onChangeSort,
  onChangeKeyword,
  onKeyDown,
  onReset,
}: HeaderProps) {
  const { folderId } = useParams<{ folderId: string }>();
  const { data, status, reloadBookmarks } = useBookmarksData();
  const [editInitialValue, setEditInitialValue] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { updateFolder } = useFolderActions();
  const { deleteFolder } = useFolderActions();

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

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditInitialValue(currentTitle);
    setIsOpen(true);
  };

  const handleSubmit = async (name: string) => {
    if (!folderId) return;

    try {
      await updateFolder({ id: folderId, title: name });
      toast.success('폴더 이름이 변경되었습니다.');

      await reloadBookmarks();
      setIsOpen(false);
    } catch (error) {
      console.error('폴더 이름 변경 실패:', error);
      toast.error('폴더 이름 변경에 실패했습니다.');
    }
  };

  const clickParentHandler = () => {
    if (folderId === '1' || folderId === '2') navigate('/');
    else navigate(`/bookmark/${parentId}`);
  };

  const handleDeleteFolder = async () => {
    if (!folderId) return;
    if (folderId === '1' || folderId === '2') {
      toast.error('기본 폴더는 삭제할 수 없습니다.');
      return;
    }

    const confirmed = window.confirm('정말로 이 폴더를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await deleteFolder(folderId);
      await reloadBookmarks();
      navigate(`/bookmark/${parentId}`);
    } catch (error) {
      console.error('폴더 삭제 실패:', error);
    }
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
            <div className="flex gap-4">
              <span className="button__text" onClick={handleOpen}>
                <SettingIcon />
              </span>
              <span
                className={`button__text ${folderId === '1' || folderId === '2' ? 'hidden' : ''}`}
                onClick={handleDeleteFolder}
              >
                <Trash size="1em" />
              </span>
            </div>
          )}
        </div>
      </div>
      <Navbar
        sortType={sortType}
        onChangeSort={onChangeSort}
        keyword={keyword}
        onChangeValue={onChangeKeyword}
        onKeyDown={onKeyDown}
        onReset={onReset}
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
                initialValue={editInitialValue}
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
