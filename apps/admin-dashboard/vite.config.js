import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sharpOptimizer from "./vite-plugin-sharp.js";

export default defineConfig({
  base: '/admin/', // Required for deployment to /admin subdirectory
  plugins: [
    react(),
    sharpOptimizer({
      inputDir: "src/assets",
      outputDir: "public/optimized",
      formats: ["webp", "jpeg"],
      quality: 80,
    }),
  ],
  server: {
    port: 5000,
    host: true,
  },
});

