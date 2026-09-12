import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl =
    env.VITE_API_URL ||
    env.API_URL ||
    process.env.VITE_API_URL ||
    process.env.API_URL ||
    'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      port: 5173,
    },
  }
})
