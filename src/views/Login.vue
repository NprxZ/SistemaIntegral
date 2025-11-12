<template>
  <div class="login-wrapper">
    <!-- Imagen de fondo -->
    <div class="background-image">
      <!-- Aquí puedes poner tu imagen de collage -->
      <img src="/tras.webp" alt="Background" class="bg-img" /> 
      
      <!-- Overlay con degradado -->
      <div class="overlay"></div>
    </div>

    <div class="login-container">
      <!-- Logos institucionales -->
      <div class="institutional-logos">
        <div class="logo-box">
          <img src="/logo_sep.webp" alt="SEP" class="inst-logo" @error="hideLogo" />
        </div>
        <div class="logo-box">
          <img src="/logo_tecnm.webp" alt="TecNM" class="inst-logo" @error="hideLogo" />
        </div>
        <div class="logo-box">
          <img src="/logo_tec.webp" alt="Instituto" class="inst-logo" @error="hideLogo" />
        </div>
      </div>

      <div class="login-card">
        <div class="login-header">
          <!-- Brand igual que el Dashboard -->
          <div class="brand-section">
            <h1 class="letra_logo">
              <span class="brand-highlight">SII</span>
              <span class="brand-normal">ITC</span>
            </h1>
          </div>
          <p class="subtitle">Sistema de Información Institucional</p>
          <div class="subtitle-line"></div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="alert alert-danger" role="alert">
            <div class="alert-icon">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <span>{{ error }}</span>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">
              <i class="fas fa-envelope"></i>
              <span>Correo Institucional</span>
            </label>
            <div class="input-wrapper">
              <input
                type="email"
                id="email"
                v-model="credentials.email"
                class="form-control"
                placeholder="l20031363@celaya.tecnm.mx"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              <i class="fas fa-lock"></i>
              <span>Contraseña</span>
            </label>
            <div class="input-wrapper">
              <input
                type="password"
                id="password"
                v-model="credentials.password"
                class="form-control"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            <span class="btn-content">
              <span v-if="loading" class="btn-text">
                <i class="fas fa-spinner fa-spin"></i>
                Iniciando sesión...
              </span>
              <span v-else class="btn-text">
                <i class="fas fa-sign-in-alt"></i>
                Iniciar Sesión
              </span>
            </span>
          </button>
        </form>

        <div class="login-footer">
          <div class="footer-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <p class="footer-text">
            Usa tus credenciales institucionales para acceder
          </p>
        </div>
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

    const hideLogo = (event) => {
      event.target.style.display = 'none';
      event.target.parentElement.style.display = 'none';
    };

    const handleLogin = async () => {
      loading.value = true;
      error.value = '';

      try {
        console.log('🔐 Intentando login con:', credentials.value.email);
        
        const response = await authAPI.login({
          email: credentials.value.email,
          password: credentials.value.password
        });

        console.log('📦 Respuesta completa:', response);
        console.log('📄 Datos:', response.data);
        console.log('📄 Tipo de datos:', typeof response.data);
        console.log('📄 Keys:', Object.keys(response.data || {}));

        let token = null;
        
        if (response.data) {
          token = response.data.access_token || 
                  response.data.token || 
                  response.data.accessToken ||
                  response.data.jwt ||
                  response.data.message?.login?.token ||
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
            const studentResponse = await studentAPI.getInfo();
            console.log('👤 Respuesta estudiante completa:', studentResponse);
            console.log('👤 Datos del estudiante:', studentResponse.data);
            
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
          error.value = 'Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible.';
          console.error('No se recibirió respuesta del servidor');
        } else {
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
      handleLogin,
      hideLogo
    };
  }
};
</script>

<style scoped>
/* Wrapper principal con imagen de fondo */
.login-wrapper {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Imagen de fondo */
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Overlay con degradado verde TEC */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(10, 95, 56, 0.55) 0%, 
    rgba(13, 125, 77, 0.52) 50%, 
    rgba(10, 95, 56, 0.55) 100%
  );
  backdrop-filter: blur(8px);
}

/* Container principal */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Logos institucionales arriba */
.institutional-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.logo-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
}

.logo-box:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.inst-logo {
  height: 50px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

/* Card de login */
.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #0a5f38 0%, #0d7d4d 50%, #0a5f38 100%);
}

/* Header del login */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.brand-section {
  margin-bottom: 1rem;
}

.letra_logo {
  font-family: 'Unbounded', 'Inter', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.brand-highlight {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-normal {
  color: #212529;
  margin-left: 0.25rem;
}

.subtitle {
  color: #495057;
  font-size: 1rem;
  font-weight: 500;
  margin: 0.75rem 0 1rem 0;
}

.subtitle-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #0a5f38 0%, #0d7d4d 100%);
  margin: 0 auto;
  border-radius: 3px;
}

/* Formulario */
.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #212529;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.form-label i {
  color: #0a5f38;
  font-size: 1.1rem;
}

.input-wrapper {
  position: relative;
}

.form-control {
  width: 100%;
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 1rem;
  color: #212529;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  background: white;
  border-color: #0a5f38;
  box-shadow: 0 0 0 4px rgba(10, 95, 56, 0.1);
}

.form-control::placeholder {
  color: #adb5bd;
}

/* Botón de login */
.btn-login {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(10, 95, 56, 0.3);
}

.btn-content {
  position: relative;
  z-index: 1;
}

.btn-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-login:hover:not(:disabled) {
  box-shadow: 0 15px 40px rgba(10, 95, 56, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Alert */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(220, 53, 69, 0.1);
  border: 2px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

.alert-icon {
  width: 40px;
  height: 40px;
  background: rgba(220, 53, 69, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon i {
  font-size: 1.2rem;
}

/* Footer */
.login-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.footer-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-icon i {
  color: white;
  font-size: 1.2rem;
}

.footer-text {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .institutional-logos {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .logo-box {
    padding: 0.5rem 1rem;
  }

  .inst-logo {
    height: 40px;
  }

  .login-card {
    padding: 2.5rem 2rem;
    border-radius: 1.5rem;
  }

  .letra_logo {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .login-container {
    padding: 1.5rem;
  }

  .institutional-logos {
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .logo-box {
    padding: 0.4rem 0.75rem;
  }

  .inst-logo {
    height: 35px;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  .letra_logo {
    font-size: 2rem;
  }

  .form-control {
    padding: 0.875rem 1rem;
  }

  .btn-login {
    padding: 1rem;
    font-size: 1rem;
  }
}
</style>