import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'), // Thư mục build ra
    emptyOutDir: true, // Xóa thư mục dist mỗi khi build
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
      },
      output: {
        entryFileNames: '[name].js', // Giữ tên file gốc cho service_worker
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  plugins: [
    // Plugin để copy manifest và icons sang thư mục dist
    copy({
      targets: [
        { src: 'src/manifest.json', dest: 'dist' },
        { src: 'src/icons', dest: 'dist' }
      ],
      hook: 'writeBundle' // Chạy sau khi build xong
    })
  ]
});