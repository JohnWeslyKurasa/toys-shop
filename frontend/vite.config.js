import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Match /api/ routes only — NOT /api.js file imports
      '^/api/': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy socket.io
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html'
      }
    }
  }
});

