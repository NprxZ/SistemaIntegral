<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="letra_logo">
          <span class="tsukitones_diseno_principal">SII</span> ITC
        </h1>
        <p class="subtitle">Sistema de Información Institucional</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email" class="form-label">
            <i class="fas fa-envelope me-2"></i>Correo Institucional
          </label>
          <input
            type="email"
            id="email"
            v-model="credentials.email"
            class="form-control"
            placeholder="l20031363@celaya.tecnm.mx"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            <i class="fas fa-lock me-2"></i>Contraseña
          </label>
          <input
            type="password"
            id="password"
            v-model="credentials.password"
            class="form-control"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn btn-login" :disabled="loading">
          <span v-if="loading">
            <i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...
          </span>
          <span v-else>
            <i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
          </span>
        </button>
      </form>

      <div class="login-footer">
        <p class="text-muted">
          <i class="fas fa-info-circle me-2"></i>
          Usa tus credenciales institucionales
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI, studentAPI } from '@/services/api';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const credentials = ref({
      email: '',
      password: ''
    });
    const loading = ref(false);
    const error = ref('');

    const handleLogin = async () => {
      loading.value = true;
      error.value = '';

      try {
        console.log('🔐 Intentando login con:', credentials.value.email);
        
        // Llamar al API de login
        const response = await authAPI.login({
          email: credentials.value.email,
          password: credentials.value.password
        });

        console.log('📦 Respuesta completa:', response);
        console.log('📄 Datos:', response.data);
        console.log('📄 Tipo de datos:', typeof response.data);
        console.log('📄 Keys:', Object.keys(response.data || {}));

        // Intentar encontrar el token en diferentes ubicaciones
        let token = null;
        
        // Buscar en diferentes ubicaciones comunes
        if (response.data) {
          token = response.data.access_token || 
                  response.data.token || 
                  response.data.accessToken ||
                  response.data.jwt ||
                  response.data.message?.login?.token ||  // ← ESTA ES LA UBICACIÓN CORRECTA
                  response.data.message?.token ||
                  response.data.data?.access_token ||
                  response.data.data?.token ||
                  response.data.data?.accessToken ||
                  response.data.data?.jwt;
        }

        console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');
        console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'null');

        if (token) {
          localStorage.setItem('jwt_token', token);
          console.log('✅ Token guardado correctamente');
          
          try {
            // Obtener datos del estudiante
            const studentResponse = await studentAPI.getInfo();
            console.log('👤 Respuesta estudiante completa:', studentResponse);
            console.log('👤 Datos del estudiante:', studentResponse.data);
            
            // Guardar los datos del estudiante - puede estar en diferentes ubicaciones
            let studentData = studentResponse.data?.data || 
                            studentResponse.data?.message?.estudiante ||
                            studentResponse.data?.message ||
                            studentResponse.data;
            
            console.log('👤 Student data procesada:', studentData);
            localStorage.setItem('student_data', JSON.stringify(studentData));
            
            console.log('🎉 Login exitoso, redirigiendo...');
            router.push('/dashboard');
          } catch (studentErr) {
            console.error('❌ Error obteniendo datos del estudiante:', studentErr);
            console.error('❌ Student error response:', studentErr.response);
            error.value = 'Error al obtener datos del estudiante. Por favor, intenta de nuevo.';
          }
        } else {
          console.error('⚠️ Estructura completa de response.data:');
          console.error(JSON.stringify(response.data, null, 2));
          error.value = 'Respuesta del servidor inválida: no se recibió el token de acceso';
        }
      } catch (err) {
        console.error('❌ Error completo:', err);
        console.error('❌ Error response:', err.response);
        console.error('❌ Error request:', err.request);
        
        if (err.response) {
          // El servidor respondió con un error
          const status = err.response.status;
          const message = err.response.data?.message || err.response.data?.error;
          
          if (status === 401) {
            error.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
          } else if (status === 422) {
            error.value = 'Datos inválidos. Verifica el formato del correo.';
          } else if (status === 500) {
            error.value = 'Error en el servidor. Intenta más tarde.';
          } else {
            error.value = message || `Error ${status}: No se pudo iniciar sesión`;
          }
        } else if (err.request) {
          // La petición fue enviada pero no hubo respuesta
          error.value = 'Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible.';
          console.error('No se recibió respuesta del servidor');
        } else {
          // Error al configurar la petición
          error.value = 'Error al procesar la solicitud: ' + err.message;
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      credentials,
      loading,
      error,
      handleLogin
    };
  }
};
</script>

