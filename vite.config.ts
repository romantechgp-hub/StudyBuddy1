
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Ensures process.env.API_KEY is replaced at build time
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    outDir: 'dist',
    // Resolve "chunk size limit" warning by increasing the limit
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Optimize bundle size by splitting vendor libraries
        manualChunks: {
          'vendor-genai': ['@google/genai'],
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['react-easy-crop']
        }
      }
    }
  }
});
