import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    base: "./", // ⭐ MOST IMPORTANT (blank page fix)
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // ⭐ FIXED
      },
    },
  };
});
