import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình Vite cho ứng dụng React SPA
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
