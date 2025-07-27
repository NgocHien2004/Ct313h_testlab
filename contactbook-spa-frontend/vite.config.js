// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url'; 

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);     

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
      '/public': {
        target: 'http://localhost:3000/',
        changeOrigin: true
      }
    },
  },
});