import path from 'node:path';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.js';
import { name, version } from './package.json';
import svgr from 'vite-plugin-svgr';
export default defineConfig({
    resolve: {
        alias: {
            '@': "".concat(path.resolve(__dirname, 'src')),
        },
    },
    plugins: [
        react(),
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
