import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
        'content-scripts/fap-scraper': resolve(__dirname, 'src/content-scripts/fap-scraper.ts'),
        'content-scripts/fap-curriculum-scraper': resolve(__dirname, 'src/content-scripts/fap-curriculum-scraper.ts'),
        'content-scripts/fap-profile-scraper': resolve(__dirname, 'src/content-scripts/fap-profile-scraper.ts'),
        'content-scripts/html-scraper': resolve(__dirname, 'src/content-scripts/html-scraper.ts'),
        'content-scripts/fap-schedule-scraper': resolve(__dirname, 'src/content-scripts/fap-schedule-scraper.ts'),
        'content-scripts/schedule-json-scraper': resolve(__dirname, 'src/content-scripts/schedule-json-scraper.ts'),
        'content-scripts/grade-json-scraper': resolve(__dirname, 'src/content-scripts/grade-json-scraper.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  plugins: [
    copy({
      targets: [
        { 
          src: 'src/manifest.json', 
          dest: 'dist' 
        },
        { 
          src: 'src/icons', 
          dest: 'dist' 
        },
        { 
          src: 'src/popup/popup.html', 
          dest: 'dist',
          rename: 'popup.html'
        },
      ],
      hook: 'writeBundle',
    }),
  ],
});