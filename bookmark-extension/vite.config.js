import path from 'node:path';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.js';
import { name, version } from './package.json';
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
    ],
    server: {
        cors: {
            origin: [
                /chrome-extension:\/\//,
            ],
        },
    },
});
