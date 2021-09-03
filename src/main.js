import { createApp } from 'vue'
import App from './App.vue'
import 'lib-flexible'
import lazyPlugin from 'vue3-lazy'
import DefaultImage from 'assets/logo.png'
import router from './router'

const app = createApp(App)
app.use(router).use(lazyPlugin, {
  loading: DefaultImage,
  error: DefaultImage,
})
app.mount('#app')
