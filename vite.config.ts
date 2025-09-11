import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Fix: Import 'cwd' from 'node:process' to resolve TypeScript type error.
import { cwd } from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.APP_PASSWORD': JSON.stringify(env.APP_PASSWORD)
    },
    plugins: [react()],
  }
})