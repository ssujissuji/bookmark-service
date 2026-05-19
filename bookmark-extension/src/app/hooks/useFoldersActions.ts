import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

type CreateFolderParams = {
  title: string;
  parentId?: string;
};

type UpdateFolderParams = {
  id: string;
  title: string;
};

export function useFolderActions() {
  const { t } = useTranslation();
  const index = 0; // 새 폴더 인덱스
  const createFolder = useCallback((params: CreateFolderParams) => {
    const { title, parentId } = params;

    return new Promise<chrome.bookmarks.BookmarkTreeNode>((resolve, reject) => {
      if (!chrome?.bookmarks) {
        reject(new Error('chrome.bookmarks API 를 사용할 수 없습니다.'));
        return;
      }

      chrome.bookmarks.create(
        {
          title,
          parentId,
          index,
        },
        (result) => {
          const error = chrome.runtime.lastError;
          if (error) {
            console.error('createFolder error:', error);
            toast.error(t('toast.folderCreateFailed'));
            reject(error);
          } else {
            resolve(result);
            toast.success(t('toast.folderCreated'));
          }
        },
      );
    });
  }, [t]);

  const updateFolder = useCallback((params: UpdateFolderParams) => {
    const { id, title } = params;

    return new Promise<chrome.bookmarks.BookmarkTreeNode>((resolve, reject) => {
      if (!chrome?.bookmarks) {
        reject(new Error('chrome.bookmarks API 를 사용할 수 없습니다.'));
        return;
      }

      chrome.bookmarks.update(id, { title }, (result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          console.error('updateFolder error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }, [t]);

  const deleteFolder = useCallback((id: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!chrome?.bookmarks) {
        reject(new Error('chrome.bookmarks API 를 사용할 수 없습니다.'));
        return;
      }

      chrome.bookmarks.removeTree(id, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          toast.error(t('toast.folderDeleteFailed'));
          console.error('deleteFolder error:', error);
          reject(error);
        } else {
          resolve();
          toast.success(t('toast.folderDeleted'));
        }
      });
    });
  }, [t]);

  return {
    createFolder,
    updateFolder,
    deleteFolder,
  };
}
