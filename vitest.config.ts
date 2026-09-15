import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'], // Explicitly exclude spec files intended for playwright
  }
});