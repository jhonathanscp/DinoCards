import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            buildBase: '/build/',
            scope: '/',
            injectRegister: 'script-defer',
            devOptions: {
                enabled: true,
            },
            manifest: false
        }),
    ],
    server: {
        host: '0.0.0.0', // Ouve em todas as interfaces de rede (IPv4)
        port: 5173,
        strictPort: true, // Garante que a porta 5173 não mude para 5174 etc.
        cors: true, // Permite requisições do celular (CORS)
        hmr: {
            host: '10.0.0.162', // Garante que o Laravel injete o IP da rede e não "localhost"
        },
    },
})

