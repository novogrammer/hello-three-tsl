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
        webgpu_compute_points: resolve(__dirname, 'webgpu_compute_points.html'),
        webgpu_compute_audio: resolve(__dirname, 'webgpu_compute_audio.html'),
        webgpu_postprocessing_transition: resolve(__dirname, 'webgpu_postprocessing_transition.html'),
        simple_postprocessing: resolve(__dirname, 'simple_postprocessing.html'),
      },
    },
  },
});