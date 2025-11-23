import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'logo.png',
  },
  action: {
    default_icon: {
      48: 'logo.png',
    },
    default_popup: 'src/popup/index.html', // ✅ 확장 팝업 페이지
  },
  permissions: [
    'bookmarks', // ✅ 북마크 API 접근
  ],
});
