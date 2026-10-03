import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      MONGOMS_VERSION: '8.2.6',
    },
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
