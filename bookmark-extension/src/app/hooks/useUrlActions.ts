import { useCallback } from 'react';
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
            toast.error('북마크 생성에 실패했습니다.');
            reject(error);
          } else {
            resolve(result);
            toast.success('북마크가 생성되었습니다!');
          }
        },
      );
    });
  }, []);

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
          toast.error('북마크 수정에 실패했습니다.');
          reject(error);
        } else {
          resolve(result);
          toast.success('북마크가 수정되었습니다!');
        }
      });
    });
  }, []);

  const deleteUrl = useCallback((id: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!chrome?.bookmarks) {
        reject(new Error('chrome.bookmarks API 를 사용할 수 없습니다.'));
        return;
      }

      chrome.bookmarks.remove(id, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          toast.error('북마크 삭제에 실패했습니다.');
          console.error('deleteUrl error:', error);
          reject(error);
        } else {
          resolve();
          toast.success('북마크가 삭제되었습니다!');
        }
      });
    });
  }, []);

  return {
    createUrl,
    updateUrl,
    deleteUrl,
  };
}
