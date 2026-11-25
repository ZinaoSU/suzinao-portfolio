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
      // 联想提问接口（需放在 /api/agent 之前，前缀更长优先匹配）
      '/api/agent-suggest': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/agent-suggest/, '/suggest'),
      },
      // 本地开发时代理自研 resume-agent Worker（wrangler dev 默认端口 8787），绕过 CORS
      '/api/agent': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/agent/, '/chat'),
      },
    },
  },
})
