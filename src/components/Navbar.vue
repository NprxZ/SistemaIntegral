<template>
  <!-- Banner Superior -->
  <div class="top-banner">
    <div class="banner-container">

      <!-- Fallback si no hay imagen -->
      <div class="banner-fallback" v-if="!bannerLoaded">
        <div class="banner-logos">
          <img src="/logo_sep.webp" alt="SEP" class="banner-logo" @error="hideLogo" />
          <img src="/logo_tecnm.webp" alt="TecNM" class="banner-logo" @error="hideLogo" />
          <img src="/logo_tec.webp" alt="Instituto" class="banner-logo" @error="hideLogo" />
        </div>
      </div>
    </div>
  </div>

  <!-- Navbar -->
  <nav class="navbar-modern">
    <div class="navbar-container">
      <!-- Logo Section -->
      <div class="navbar-brand-section">
        <!-- Logo 1 - TecNM -->
        <div class="logo-wrapper">
          <img 
            src="/logo_tec.webp" 
            alt="TecNM Logo" 
            class="navbar-logo"
            @error="handleLogoError"
          />
        </div>

        <!-- Brand Text -->
        <router-link class="brand-link" to="/dashboard">
          <div class="brand-text">
            <span class="brand-highlight">SII</span>
            <span class="brand-normal">ITC</span>
          </div>
          <div class="brand-subtitle">Sistema Integral de Información</div>
        </router-link>

        <!-- Logo 2 - Instituto -->
        <div class="logo-wrapper">
          <img 
            src="/logo_tecnm.webp" 
            alt="Instituto Logo" 
            class="navbar-logo"
            @error="handleLogoError"
          />
        </div>
      </div>

      <!-- Mobile Toggle -->
      <button 
        class="mobile-toggle" 
        @click="toggleMobileMenu"
        :class="{ 'active': mobileMenuOpen }"
      >
        <span class="toggle-line"></span>
        <span class="toggle-line"></span>
        <span class="toggle-line"></span>
      </button>

      <!-- Navigation Links -->
      <div class="navbar-menu" :class="{ 'mobile-open': mobileMenuOpen }">
        <ul class="nav-links">
          <li class="nav-item">
            <router-link class="nav-link-modern" to="/dashboard" @click="closeMobileMenu">
              <div class="nav-link-content">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
              </div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link-modern" to="/calificaciones" @click="closeMobileMenu">
              <div class="nav-link-content">
                <i class="fas fa-clipboard-check"></i>
                <span>Calificaciones</span>
              </div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link-modern" to="/kardex" @click="closeMobileMenu">
              <div class="nav-link-content">
                <i class="fas fa-file-alt"></i>
                <span>Kardex</span>
              </div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link-modern" to="/horario" @click="closeMobileMenu">
              <div class="nav-link-content">
                <i class="fas fa-calendar-alt"></i>
                <span>Horario</span>
              </div>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link-modern" to="/servicios" @click="closeMobileMenu">
              <div class="nav-link-content">
                <i class="fas fa-tools"></i>
                <span>Tools</span>
              </div>
            </router-link>
          </li>
        </ul>

        <!-- User Menu -->
        <div class="user-menu">
          <div class="user-dropdown" @click="toggleUserDropdown">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-info">
              <span class="user-name">{{ studentName || 'Estudiante' }}</span>
              <span class="user-role">Estudiante</span>
            </div>
            <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotated': userDropdownOpen }"></i>
          </div>

          <!-- Dropdown Menu -->
          <transition name="dropdown">
            <div v-if="userDropdownOpen" class="dropdown-menu-modern">
              <div class="dropdown-header">
                <div class="dropdown-user-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="dropdown-user-info">
                  <span class="dropdown-user-name">{{ studentName || 'Estudiante' }}</span>
                  <span class="dropdown-user-email">Cuenta Institucional</span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item-modern" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Navbar',
  props: {
    studentName: {
      type: String,
      default: ''
    }
  },
  emits: ['logout'],
  setup(props, { emit }) {
    const mobileMenuOpen = ref(false);
    const userDropdownOpen = ref(false);

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
      if (mobileMenuOpen.value) {
        userDropdownOpen.value = false;
      }
    };

    const closeMobileMenu = () => {
      mobileMenuOpen.value = false;
    };

    const toggleUserDropdown = () => {
      userDropdownOpen.value = !userDropdownOpen.value;
    };

    const handleLogout = () => {
      userDropdownOpen.value = false;
      mobileMenuOpen.value = false;
      emit('logout');
    };

    const handleLogoError = (event) => {
      // Si el logo no carga, ocultar el contenedor
      event.target.style.display = 'none';
      event.target.parentElement.style.display = 'none';
    };

    // Cerrar dropdown al hacer click fuera
    if (typeof window !== 'undefined') {
      window.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
          userDropdownOpen.value = false;
        }
      });
    }

    return {
      mobileMenuOpen,
      userDropdownOpen,
      toggleMobileMenu,
      closeMobileMenu,
      toggleUserDropdown,
      handleLogout,
      handleLogoError
    };
  }
};
</script>

<style scoped>
.navbar-modern {
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  box-shadow: 0 4px 20px rgba(20, 158, 94, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
}

/* Logo Section */
.navbar-brand-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.logo-wrapper:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.navbar-logo {
  height: 45px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.brand-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.3s ease;
}

.brand-link:hover {
  transform: translateY(-2px);
}

.brand-text {
  font-family: 'Unbounded', 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.brand-highlight {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
}

.brand-normal {
  color: rgba(255, 255, 255, 0.95);
  margin-left: 0.25rem;
}

.brand-subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toggle-line {
  width: 24px;
  height: 2.5px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-toggle.active .toggle-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-toggle.active .toggle-line:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active .toggle-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Navigation Menu */
.navbar-menu {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link-modern {
  text-decoration: none;
  display: block;
  transition: all 0.3s ease;
}

.nav-link-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.nav-link-modern:hover .nav-link-content {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-link-modern:hover .nav-link-content::before {
  transform: translateX(0);
}

.nav-link-modern.router-link-active .nav-link-content {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.nav-link-content i {
  font-size: 1.1rem;
}

.nav-link-content span {
  font-weight: 600;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar i {
  font-size: 2rem;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  line-height: 1;
}

.dropdown-arrow {
  color: white;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu-modern {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  min-width: 280px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1001;
}

.dropdown-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dropdown-user-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dropdown-user-avatar i {
  font-size: 1.75rem;
  color: white;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-user-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
}

.dropdown-user-email {
  font-size: 0.8rem;
  color: #6c757d;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 0;
}

.dropdown-item-modern {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #495057;
  font-weight: 500;
  font-size: 0.95rem;
}

.dropdown-item-modern:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.dropdown-item-modern i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

/* Dropdown Transition */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-container {
    padding: 0 1.5rem;
  }

  .navbar-menu {
    gap: 2rem;
  }

  .nav-links {
    gap: 0.25rem;
  }

  .nav-link-content {
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
  }

  .brand-text {
    font-size: 1.3rem;
  }

  .brand-subtitle {
    font-size: 0.65rem;
  }

  .navbar-logo {
    height: 40px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
    min-height: 65px;
  }

  .mobile-toggle {
    display: flex;
  }

  .navbar-brand-section {
    gap: 1rem;
  }

  .logo-wrapper {
    padding: 0.4rem;
  }

  .navbar-logo {
    height: 35px;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .brand-subtitle {
    display: none;
  }

  .navbar-menu {
    position: fixed;
    top: 65px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #0a5f38 0%, #0d7d4d 100%);
    flex-direction: column;
    gap: 0;
    padding: 1.5rem;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .navbar-menu.mobile-open {
    max-height: calc(100vh - 65px);
    opacity: 1;
    overflow-y: auto;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }

  .nav-item {
    width: 100%;
  }

  .nav-link-content {
    width: 100%;
    padding: 1rem 1.25rem;
    justify-content: flex-start;
  }

  .user-menu {
    width: 100%;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .user-dropdown {
    width: 100%;
    justify-content: space-between;
    padding: 1rem 1.25rem;
  }

  .dropdown-menu-modern {
    position: static;
    margin-top: 0.75rem;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .navbar-brand-section {
    gap: 0.75rem;
  }

  .logo-wrapper:last-child {
    display: none;
  }

  .brand-text {
    font-size: 1.1rem;
  }

  .navbar-logo {
    height: 32px;
  }

  .user-info {
    display: none;
  }

  .user-avatar i {
    font-size: 1.75rem;
  }
}

/* ===== Ajuste de los logos del banner ===== */
.banner-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem; /* espacio entre logos */
  padding: 1rem 0;
  background-color: rgba(210, 212, 219, 1);
}

.banner-logo {
  height: 60px; /* ajusta este valor al tamaño deseado */
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.banner-logo:hover {
  transform: scale(1.05);
}

/* Responsivo */
@media (max-width: 768px) {
  .banner-logo {
    height: 45px;
  }
}

@media (max-width: 480px) {
  .banner-logo {
    height: 35px;
  }
}


</style>