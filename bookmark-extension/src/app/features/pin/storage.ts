/** 폴더별 상단 고정(핀) 북마크 id 목록. { [folderId]: string[] } */
export type PinnedMap = Record<string, string[]>;

export const PINNED_STORAGE_KEY = 'pinnedByFolder';

export function loadPinnedMap(): Promise<PinnedMap> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([PINNED_STORAGE_KEY], (result) => {
      resolve((result[PINNED_STORAGE_KEY] ?? {}) as PinnedMap);
    });
  });
}

export function savePinnedMap(map: PinnedMap): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [PINNED_STORAGE_KEY]: map }, () => resolve());
  });
}
