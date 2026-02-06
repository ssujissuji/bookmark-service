import type { ColorToken, FolderColorMap } from './types';
import { DEFAULT_COLOR_TOKEN } from './constants';

export function resolveColorToken(
  folderId: string,
  colorMap: FolderColorMap,
): ColorToken {
  return colorMap[folderId] ?? DEFAULT_COLOR_TOKEN;
}
