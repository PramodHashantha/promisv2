import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'fix-react-apexcharts-interop',
      transform(code, id) {
        if (id.includes('react-apexcharts')) {
          return {
            code: code.replace(
              /\.default\.(Component|PureComponent|createElement|createRef|forwardRef|memo|Fragment|Children|cloneElement|createContext|useCallback|useEffect|useLayoutEffect|useMemo|useReducer|useRef|useState|createFactory|isValidElement|string|number|bool|array|object|func|symbol|node|element|any|oneOf|oneOfType|arrayOf|objectOf|instanceOf|shape|exact)\b/g,
              '.$1'
            ),
            map: null,
          };
        }
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@mui")) return "mui";
            if (id.includes("@fullcalendar")) return "fullcalendar";
            if (id.includes("apexcharts") || id.includes("react-apexcharts"))
              return "charts";
            if (id.includes("quill") || id.includes("react-quill")) return "editor";
            if (id.includes("@tanstack/react-query")) return "tanstack-query";
            if (id.includes("react-router")) return "router";
            if (id.includes("bootstrap")) return "bootstrap";
            if (id.includes("exceljs")) return "exceljs";
            if (id.includes("sweetalert2")) return "sweetalert2";
            if (id.includes("framer-motion")) return "framer-motion";
            if (id.includes("lodash")) return "lodash";
            if (id.includes("moment")) return "moment";
            if (id.includes("date-fns")) return "date-fns";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
}));
