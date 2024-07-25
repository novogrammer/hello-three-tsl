import { defineConfig } from 'vite';

export default defineConfig({
  base: "/hello-three-tsl/",
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext'
  },
});