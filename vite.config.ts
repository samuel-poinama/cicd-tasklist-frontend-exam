/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    css: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    // CI runners here are resource-constrained; running jsdom environments in
    // parallel thrashes the machine and causes timeouts. Run files serially in a
    // single fork to keep each test fast and stable.
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/__tests__/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/junit.xml',
    },
  },
});
