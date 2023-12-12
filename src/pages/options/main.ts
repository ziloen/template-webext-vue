import '~/styles'

import { createApp } from 'vue'
import App from './Options.vue'

if (IS_DEV) {
  import('~/utils/esbuild-reload')
}

const app = createApp(App)
app.mount('#app')
