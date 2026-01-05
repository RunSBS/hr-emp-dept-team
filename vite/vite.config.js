import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server:{
        proxy:{
            '/back':{
                target:'http://localhost:8080',
                changeOrigin:true,
                secure:false,
                rewrite:path => path.replace(/^\/back/, '')
            },
            '/ai':{
                target:'http://localhost:5000',
                changeOrigin:true,
                secure:false,
                rewrite:path => path.replace(/^\/ai/, '')
            }
        }
    }
})
