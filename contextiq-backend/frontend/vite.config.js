import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.url.includes('/stream') || (req.headers.accept && req.headers.accept.includes('text/event-stream'))) {
              proxyReq.setHeader('Cache-Control', 'no-cache, no-transform');
              proxyReq.setHeader('Connection', 'keep-alive');
              proxyReq.setHeader('X-Accel-Buffering', 'no');
            }
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            const isStream = req.url.includes('/stream') || 
                             (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/event-stream'));
            if (isStream) {
              proxyRes.headers['cache-control'] = 'no-cache, no-transform';
              proxyRes.headers['connection'] = 'keep-alive';
              proxyRes.headers['x-accel-buffering'] = 'no';
              delete proxyRes.headers['content-length'];
              if (proxyRes.socket) {
                proxyRes.socket.setNoDelay(true);
              }
            }
          });
        },
      },
    },
  },
});
