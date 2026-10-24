import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: `ws://localhost:${process.env.MARKET_PORT ?? 8787}`,
        ws: true,
        rewrite: () => '/',
      },
    },
  },
});
