import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared'),
      },
      dedupe: ['react', 'react-dom', 'firebase'],
    },
    server: {
      fs: {
        allow: [path.resolve(__dirname, '.'), path.resolve(__dirname, '../shared')],
      },
      proxy: {
        '/api/claude': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/claude/, '/v1/messages'),
          headers: {
            'x-api-key': env.VITE_ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
        },
      },
    },
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
  }
})
