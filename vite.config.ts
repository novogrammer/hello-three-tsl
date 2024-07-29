import { defineConfig } from 'vite';
import {resolve} from 'path';

export default defineConfig({
  base: "/hello-three-tsl/",
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        kaleidoscope: resolve(__dirname, 'kaleidoscope.html'),
      },
    },
  },
});