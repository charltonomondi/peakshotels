import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy to Admin Console for public APIs (bookings, rooms, mpesa)
      '/api/public': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
      },
      '/api/mpesa': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
      },
      // Proxy to Express server for email and Daraja
      '/api/daraja': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/send-booking-email': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/paystack': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/send-review': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/send-mountain-booking': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/daraja/mountain-stk': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Interview signaling WebSocket
      '/interview-ws': {
        target: 'ws://localhost:4000',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/interview-ws/, ''),
      },
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg', '**/*.webp', '**/*.mp4'],
}));
