import type { FolderColorMap } from './types';
import { FOLDER_COLOR_STORAGE_KEY } from './constants';

export function loadFolderColorMap(): Promise<FolderColorMap> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([FOLDER_COLOR_STORAGE_KEY], (result) => {
      resolve((result[FOLDER_COLOR_STORAGE_KEY] ?? {}) as FolderColorMap);
    });
  });
}

export function saveFolderColorMap(map: FolderColorMap): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [FOLDER_COLOR_STORAGE_KEY]: map }, () =>
      resolve(),
    );
  });
}
