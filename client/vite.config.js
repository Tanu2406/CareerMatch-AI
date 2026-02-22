import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('[Proxy Error]', err);
            res.writeHead(502, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Backend server is not running on http://localhost:5000',
              message: 'Please ensure the server is started with: cd server && npm run dev'
            }));
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          });
        }
      }
    }
  }
});
