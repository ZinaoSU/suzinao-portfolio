import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/suzinao-portfolio/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      // 本地开发时代理 Coze API，绕过 CORS
      '/api/coze': {
        target: 'https://p7gpkjk7wn.coze.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coze/, '/stream_run'),
      },
    },
  },
})
