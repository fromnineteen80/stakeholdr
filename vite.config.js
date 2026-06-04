import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        // Standalone, unencumbered design-system page. Shares no code with the
        // guide app; emits to dist/design-system/preview.html → its own URL.
        dsPreview: 'design-system/preview.html'
      }
    }
  }
});
