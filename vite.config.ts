import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    outDir: 'dist', // output folder for Chrome extension
    cssCodeSplit:true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.tsx'), // entry for popup React app
        // panel: resolve(__dirname, 'src/panel/index.tsx'), // entry for popup React 
      },
      output: {
        entryFileNames: '[name].js',       // fixed JS filename for manifest
        chunkFileNames: '[name].js',      // optional: keep chunks readable
        assetFileNames: '[name].[ext]',   // optional: keep assets readable
      },
    },
  },
});
