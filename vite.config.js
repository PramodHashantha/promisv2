import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'fix-proptypes-interop',
      transform(code, id) {
        if (!id.includes('node_modules')) return;
        if (!code.includes('.default.')) return;
        const result = code.replace(
          /\.default\.(string|number|bool|array|object|func|symbol|node|element|any|oneOf|oneOfType|arrayOf|objectOf|instanceOf|shape|exact)\b/g,
          '.$1'
        );
        return result !== code ? { code: result, map: null } : undefined;
      },
    },
    mode === "analyze" &&
      visualizer({
        filename: "dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7041",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
}));
