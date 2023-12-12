import '~/styles'

import { createApp } from 'vue'
import App from './Popup.vue'

if (IS_DEV) {
  import('~/utils/esbuild-reload')
}

const app = createApp(App)
app.mount('#app')
