import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Inspector from 'unplugin-vue-dev-locator/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const targetPort = env.PORT || '10086'

  return {
    build: {
      sourcemap: 'hidden',
    },
    plugins: [
      vue(),
      Inspector(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 定义 @ = src
      },
    },
    server: {
      host: true,
      proxy: {
        '/api': {
          target: `http://localhost:${targetPort}`,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    }
  }
})
