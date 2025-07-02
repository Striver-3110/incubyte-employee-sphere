
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
    historyApiFallback: {
      rewrites: [
        { from: /^\/one-view\/.*$/, to: '/one-view/index.html' }
      ]
    }
  },
	base: '/one-view/', 
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
		outDir: '../incubyte_ui/public/one_view',
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
