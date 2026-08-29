import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    pool: 'forks',
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 30000,
    coverage: { reporter: ['text', 'html'] },
  },
});
