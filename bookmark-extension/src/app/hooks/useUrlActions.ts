import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export type CreateUrlParams = {
  title: string;
  parentId?: string; // 부모 폴더 id (생략하면 기본 위치에 생성)
  url: string;
};

type UpdateUrlParams = {
  id: string;
  title: string;
};

export function useUrlActions() {
  const { t } = useTranslation();
  const index = 0;
  const createUrl = useCallback((params: CreateUrlParams) => {
    const { title, parentId, url } = params;

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
          url,
        },
        (result) => {
          const error = chrome.runtime.lastError;
          if (error) {
            console.error('createFolder error:', error);
            toast.error(t('toast.bookmarkCreateFailed'));
            reject(error);
          } else {
            resolve(result);
            toast.success(t('toast.bookmarkCreated'));
          }
        },
      );
    });
  }, [t]);

  const updateUrl = useCallback((params: UpdateUrlParams) => {
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
          toast.error(t('toast.bookmarkUpdateFailed'));
          reject(error);
        } else {
          resolve(result);
          toast.success(t('toast.bookmarkUpdated'));
        }
      });
    });
  }, [t]);

  const deleteUrl = useCallback((id: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!chrome?.bookmarks) {
        reject(new Error('chrome.bookmarks API 를 사용할 수 없습니다.'));
        return;
      }

      chrome.bookmarks.remove(id, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          toast.error(t('toast.bookmarkDeleteFailed'));
          console.error('deleteUrl error:', error);
          reject(error);
        } else {
          resolve();
          toast.success(t('toast.bookmarkDeleted'));
        }
      });
    });
  }, [t]);

  return {
    createUrl,
    updateUrl,
    deleteUrl,
  };
}
