import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script-defer',
            manifest: false
        })
    ],
    base: mode === 'development' ? '/' : './', // Vital para Electron conseguir carregar os arquivos estáticos
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
    },
    build: {
        outDir: 'dist-electron',
        emptyOutDir: true,
    }
}))
