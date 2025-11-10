<template>
  <nav class="navbar navbar-expand-lg navbar-dark" id="navbar">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/dashboard">
        <span class="letra_logo">
          <span class="tsukitones_diseno_principal">SII</span> ITC
        </span>
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
              data-bs-target="#navbarContent" aria-controls="navbarContent" 
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">
              <i class="fas fa-home me-2"></i>Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/calificaciones">
              <i class="fas fa-graduation-cap me-2"></i>Calificaciones
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/kardex">
              <i class="fas fa-file-alt me-2"></i>Kardex
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/horario">
              <i class="fas fa-calendar-alt me-2"></i>Horario
            </router-link>
          </li>
        </ul>

        <div class="dropdown">
          <a href="#" class="nav-user-dropdown dropdown-toggle" id="userDropdown" 
             data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-user-circle fa-2x"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li class="px-3 py-2">
              <small class="text-muted">{{ studentName || 'Estudiante' }}</small>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="$emit('logout')">
                <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    studentName: {
      type: String,
      default: ''
    }
  },
  emits: ['logout']
};
</script>

<style scoped>
.navbar {
  background: rgba(97, 18, 50, 0.95) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
}

.letra_logo {
  font-family: 'Unbounded', sans-serif;
  font-weight: 700;
}

.tsukitones_diseno_principal {
  background: linear-gradient(90deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85) !important;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1);
}

.nav-user-dropdown {
  color: #fff;
  text-decoration: none;
}

.nav-user-dropdown:hover {
  opacity: 0.8;
}

.dropdown-menu {
  background: rgba(97, 18, 50, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-item {
  color: #fff !important;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

@media (max-width: 991px) {
  .navbar {
    padding: 1rem;
  }
}
</style>