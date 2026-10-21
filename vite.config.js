import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build:single` inlines everything into one HTML file for easy sharing.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  base: './',
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
  },
}));
