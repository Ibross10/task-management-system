import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3001' } },
  test: { environment: 'jsdom', setupFiles: './src/testSetup.js', coverage: { provider: 'v8', reporter: ['text', 'html'], include: ['src/**/*.{js,jsx}'], exclude: ['src/main.jsx', 'src/testSetup.js'] } }
});