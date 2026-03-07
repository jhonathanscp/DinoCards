import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0', // Força IPv4 em vez de IPv6
        port: 5173,
        hmr: {
            host: 'localhost', // Garante que o navegador tente acessar via localhost ao invés de 0.0.0.0
        },
    },
})
