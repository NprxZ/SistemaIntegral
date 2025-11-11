import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://cetech.roque.tecnm.mx',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },

  // Configuración para producción
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'axios': ['axios']
        }
      }
    }
  },

  // Base path para producción
  base: process.env.NODE_ENV === 'production' ? './' : '/'
})