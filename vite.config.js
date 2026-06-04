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
        // Standalone, unencumbered design-system pages. Share no code with the
        // guide app; each emits to its own URL under dist/design-system/.
        dsPreview: 'design-system/preview.html',
        dsWireframes: 'design-system/wireframes.html'
      }
    }
  }
});
