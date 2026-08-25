import { defineConfig } from 'vitest/config';

// Only the shell engine and the content registry are unit-tested — they are
// pure TypeScript with no React or DOM involved. UI is verified in a browser.
export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
