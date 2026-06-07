import { defineConfig } from 'vite';

export default defineConfig({
  base: '/thai-flashcards/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
