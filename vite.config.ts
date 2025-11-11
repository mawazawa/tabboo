import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting to reduce network dependency chains
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React vendor
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          
          // PDF.js - heavy library, should be separate
          if (id.includes('pdfjs-dist') || id.includes('react-pdf')) {
            return 'pdf-viewer';
          }
          
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          // Tanstack Query
          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }
          
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          
          // DnD Kit
          if (id.includes('@dnd-kit')) {
            return 'dnd-kit';
          }
          
          // Charts
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Increase chunk size warning limit for better splitting
    chunkSizeWarningLimit: 1000,
  },
}));
