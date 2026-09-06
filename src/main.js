import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueSignaturePad from 'vue-signature-pad'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueSignaturePad)

app.mount('#app')