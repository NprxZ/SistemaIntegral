<template>
  <div class="login-container">
    <h1>SII ITC</h1>
    <p>Sistema de Información Institucional</p>

    <form @submit.prevent="handleLogin">
      <div v-if="error" class="alert">{{ error }}</div>

      <input
        v-model="email"
        type="email"
        placeholder="Correo institucional"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Contraseña"
        required
      />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Iniciando...' : 'Iniciar sesión' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Llamada al endpoint real del sistema
    const res = await axios.post('https://cetech.roque.tecnm.mx/api/login', {
      email: email.value,
      password: password.value
    })

    // Guarda el token
    const token = res.data?.token || res.data?.access_token || res.data?.message?.login?.token
    if (!token) throw new Error('No se recibió token')

    localStorage.setItem('jwt_token', token)

    // Redirige al dashboard
    router.push('/dashboard')
  } catch (err) {
    console.error(err)
    error.value = 'Error al iniciar sesión. Verifica tus datos.'
  } finally {
    loading.value = false
  }
}
</script>