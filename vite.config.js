import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'fix-proptypes-default',
      transform(code, id) {
        if (!/[/\\]prop-types[/\\]index\.js$/.test(id)) return;
        // Make prop-types.default = prop-types so both X.string
        // and X.default.string work regardless of CJS interop variant
        return {
          code: code + '\nif(typeof module!=="undefined"&&module.exports&&typeof module.exports==="object"&&!module.exports.default)module.exports.default=module.exports;',
          map: null,
        };
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
