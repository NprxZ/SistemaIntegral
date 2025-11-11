import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Importar el servicio API para inicializarlo
import './services/api'

const app = createApp(App)
app.use(router)
app.mount('#app')