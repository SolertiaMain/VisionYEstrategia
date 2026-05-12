import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Servidor de desarrollo
  server: {
    port: 3000,
    open: true, // Abre el navegador automáticamente
  },

  // Build para producción (múltiples páginas)
  build: {
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'index.html'),
        nosotros:  resolve(__dirname, 'nosotros.html'),
        servicios: resolve(__dirname, 'servicios.html'),
        contacto:  resolve(__dirname, 'contacto.html'),
      },
    },
  },
})
