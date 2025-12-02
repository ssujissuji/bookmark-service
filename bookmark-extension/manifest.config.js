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
        default_title: 'MyBookmark',
    },
    permissions: [
        'bookmarks', // ✅ 북마크 API 접근
    ],
    background: { service_worker: 'src/background.ts', type: 'module' },
    options_ui: {
        page: 'src/popup/index.html',
        open_in_tab: true,
    },
});
