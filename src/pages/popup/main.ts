import '~/styles'

import { createApp } from 'vue'
import { setupApp } from '~/logic/common-setup'
import App from './Popup.vue'

if (IS_DEV) {
  import('~/utils/esbuild-reload')
}

const app = createApp(App)
setupApp(app)
app.mount('#app')
