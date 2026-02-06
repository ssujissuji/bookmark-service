import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ColorToken, FolderColorMap } from './types';
import { loadFolderColorMap, saveFolderColorMap } from './storage';
import { DEFAULT_COLOR_TOKEN } from './constants';

type FolderColorContextValue = {
  colorMap: FolderColorMap;
  isLoaded: boolean;

  setFolderColor: (folderId: string, token: ColorToken) => Promise<void>;

  resetFolderColor: (folderId: string) => Promise<void>;

  ensureDefaultColor: (folderId: string) => Promise<void>;
};

const FolderColorContext = createContext<FolderColorContextValue | null>(null);

export function FolderColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorMap, setColorMap] = useState<FolderColorMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadFolderColorMap()
      .then((map) => {
        if (!mounted) return;
        setColorMap(map);
        setIsLoaded(true);
      })
      .catch((e) => {
        console.error('loadFolderColorMap failed:', e);
        // 실패해도 앱은 동작하게: 빈 맵으로 시작
        if (!mounted) return;
        setColorMap({});
        setIsLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<FolderColorContextValue>(() => {
    return {
      colorMap,
      isLoaded,

      async setFolderColor(folderId, token) {
        const next = { ...colorMap, [folderId]: token };
        setColorMap(next);
        await saveFolderColorMap(next);
      },

      async resetFolderColor(folderId) {
        const next = { ...colorMap };
        delete next[folderId];
        setColorMap(next);
        await saveFolderColorMap(next);
      },

      async ensureDefaultColor(folderId) {
        // 이미 있으면 아무 것도 안 함
        if (colorMap[folderId]) return;

        const next = { ...colorMap, [folderId]: DEFAULT_COLOR_TOKEN };
        setColorMap(next);
        await saveFolderColorMap(next);
      },
    };
  }, [colorMap, isLoaded]);

  return (
    <FolderColorContext.Provider value={value}>
      {children}
    </FolderColorContext.Provider>
  );
}

export function useFolderColor() {
  const ctx = useContext(FolderColorContext);
  if (!ctx)
    throw new Error('useFolderColor must be used within FolderColorProvider');
  return ctx;
}
