
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import proxyOptions from './proxyOptions';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    force: true, // Force optimize deps
    proxy: proxyOptions,
  },
  optimizeDeps: {
    force: true, // Force re-optimization
    include: [
      "react",
      "react-dom",
      "@radix-ui/react-label",
      "@radix-ui/react-tabs",
      "lucide-react"
    ]
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: "[name].[ext]"
      }
    },
    emptyOutDir: true,
    target: 'es2015',
    sourcemap: true
  },
}));
