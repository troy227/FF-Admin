import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { bootstrapFfSession } from './services/sessionBootstrap.js'

bootstrapFfSession()

const app = createApp(App)

app.use(router)

app.mount('#app')
