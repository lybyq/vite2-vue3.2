import path from 'path'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import styleImport from 'vite-plugin-style-import'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteCompression from 'vite-plugin-compression'

// const isProduction = process.env.NODE_ENV === 'production'
// https://vitejs.dev/config/
export default ({ command, mode }) => {
  // console.log('command:', command, mode)
  const config = {
    base: './',
    minify: 'esbuild',
    cssPreprocessOptions: {
      scss: {
        additionalData: '@import "./src/assets/style/index.scss";',
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),
      styleImport({
        libs: [
          {
            libraryName: 'vant',
            esModule: true,
            resolveStyle: name => `vant/es/${name}/style`,
          },
        ],
      }),
      {
        ...viteCompression(),
        apply: 'build', // 告诉rollup只在build环境下生效
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'comp': path.resolve(__dirname, './src/components'),
        'jsx': path.resolve(__dirname, './src/jsx'),
        'views': path.resolve(__dirname, './src/views'),
        'assets': path.resolve(__dirname, './src/assets'),
        'utils': path.resolve(__dirname, './src/utils'),
        'service': path.resolve(__dirname, './src/service'),
      },
    },
    define: {
      'process.env': {
        VUE_ENV: mode,
      },
    },
  }

  if(mode === 'development') {
    config.server = {
      proxy: {
        '/xx': {
          target: 'https://www.baidu.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/xx/, ''),
        },
      },
      port: 3001,
    }
    return config
  } else {
    return config
  }
}
