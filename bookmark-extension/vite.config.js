import path from 'node:path';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.js';
import { name, version } from './package.json';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    // package.json의 version을 앱 코드에서 __APP_VERSION__으로 사용 (버전은 package.json 한 곳만 수정)
    define: {
        __APP_VERSION__: JSON.stringify(version),
    },
    resolve: {
        alias: {
            '@': "".concat(path.resolve(__dirname, 'src')),
        },
    },
    plugins: [
        react(),
        tailwindcss(),
        crx({ manifest: manifest }),
        zip({ outDir: 'release', outFileName: "crx-".concat(name, "-").concat(version, ".zip") }),
        svgr({
            svgrOptions: {
                icon: true,
            },
        }),
    ],
    server: {
        cors: {
            origin: [/chrome-extension:\/\//],
        },
    },
});
