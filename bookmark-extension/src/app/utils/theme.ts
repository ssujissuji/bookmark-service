export type ThemeId = 'default' | 'dark' | 'bed' | 'hologram' | 'snow';

const STORAGE_KEY = 'bookmark_theme';

export function applyTheme(themeId: ThemeId) {
  document.documentElement.setAttribute('data-theme', themeId);
}

export function saveTheme(themeId: ThemeId) {
  localStorage.setItem(STORAGE_KEY, themeId);
}

export function loadTheme(defaultTheme: ThemeId = 'default'): ThemeId {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (
    saved === 'default' ||
    saved === 'dark' ||
    saved === 'bed' ||
    saved === 'hologram' ||
    saved === 'snow'
  ) {
    return saved;
  }
  return defaultTheme;
}
