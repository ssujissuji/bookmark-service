import { useCallback } from 'react';

type CreateFolderParams = {
  title: string;
  parentId?: string; // 부모 폴더 id (생략하면 기본 위치에 생성)
};

type UpdateFolderParams = {
  id: string;
  title: string;
};

export function useFolderActions() {
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
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
    });
  }, []);

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
  }, []);

  const deleteFolder = useCallback((id: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!chrome?.bookmarks) {
        reject(new Error('chrome.bookmarks API 를 사용할 수 없습니다.'));
        return;
      }

      chrome.bookmarks.removeTree(id, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          console.error('deleteFolder error:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }, []);

  return {
    createFolder,
    updateFolder,
    deleteFolder,
  };
}
