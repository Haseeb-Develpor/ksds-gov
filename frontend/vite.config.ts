import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite tags the emitted <script>/<link> with `crossorigin`, which makes the
// browser fetch them in CORS mode. Behind Cloudflare that can fail CORS and the
// stylesheet silently never applies (page renders unstyled). Strip it.
const stripCrossorigin = {
  name: 'strip-crossorigin',
  transformIndexHtml(html: string) {
    return html.replace(/\s+crossorigin(?==["'][^"']*["'])?/g, '');
  },
};

export default defineConfig({
  plugins: [react(), stripCrossorigin],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
