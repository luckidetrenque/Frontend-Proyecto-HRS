import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "esbuild",
    esbuildOptions: {
      drop: ["console", "debugger"],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - cambia poco, se cachea bien
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Librerías de datos/query
          "vendor-query": ["@tanstack/react-query"],
          // UI components (shadcn/radix)
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
          ],
          // Iconos
          "vendor-icons": ["lucide-react"],
          // Gráficos (pesados, solo los usan Finanzas y Reportes)
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
}));
