import { useCallback, useEffect, useState } from 'react';
import { loadPinnedMap, savePinnedMap } from './storage';

/**
 * 특정 폴더의 상단 고정(핀) 상태를 관리한다.
 * 핀은 크롬 네이티브 순서를 바꾸지 않는 "표시 전용" 오버레이다.
 */
export function usePinnedBookmarks(folderId?: string) {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!folderId) {
      setPinnedIds([]);
      return;
    }
    const map = await loadPinnedMap();
    setPinnedIds(map[folderId] ?? []);
  }, [folderId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback(
    async (id: string) => {
      if (!folderId) return;
      const map = await loadPinnedMap();
      const current = map[folderId] ?? [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];

      const nextMap = { ...map, [folderId]: next };
      if (next.length === 0) delete nextMap[folderId];

      await savePinnedMap(nextMap);
      setPinnedIds(next);
    },
    [folderId],
  );

  const isPinned = useCallback(
    (id: string) => pinnedIds.includes(id),
    [pinnedIds],
  );

  return { pinnedIds, isPinned, toggle };
}
