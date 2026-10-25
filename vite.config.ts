import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Tách thư viện lớn thành chunk riêng để chúng được cache lâu dài:
         * code của app đổi mỗi lần deploy, còn React hay Supabase thì không.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // `scheduler` và `use-sync-external-store` phải nằm cùng chunk với
          // React, nếu không hai chunk sẽ import lẫn nhau (circular chunk).
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/.test(
              id,
            )
          ) {
            return 'vendor-react';
          }
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@tanstack')) return 'vendor-tanstack';
          if (id.includes('radix-ui') || id.includes('@radix-ui')) return 'vendor-radix';
          return 'vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Phải khớp với SUPABASE_URL trong src/test/msw/handlers.ts.
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/components/ui/**'],
    },
  },
});
