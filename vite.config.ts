import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
