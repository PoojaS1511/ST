import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    define: {
      'process.env': {
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      global: 'window',
    },
    optimizeDeps: {
      include: [
        '@supabase/auth-helpers-nextjs',
        '@supabase/ssr',
        '@supabase/supabase-js',
        'react',
        'react-dom',
        'react-router-dom',
        'tailwindcss',
        'postcss',
        'autoprefixer',
        '@tailwindcss/nesting',
        'file-saver',
        'jspdf',
        'jspdf-autotable'
      ]
    },
    plugins: [
      react(),
      nodePolyfills({
        exclude: [],
        protocolImports: true,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        util: 'util',
        path: 'path-browserify',
        os: 'os-browserify/browser',
        https: 'agent-base',
        http: 'agent-base',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs']
    },
    // Development server configuration
    server: {
      port: 3001,
      open: true,
      strictPort: true,
      host: true,
      cors: true,
      fs: {
        allow: [
          fileURLToPath(new URL('./', import.meta.url)),
          fileURLToPath(new URL('../', import.meta.url))
        ]
      },
      proxy: {
        '^/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    
    // Build configuration
    build: {
      manifest: true,
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
          }
          warn(warning);
        }
      }
    }
  };
});