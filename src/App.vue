<template>
  <div id="app">
    <Navbar 
      v-if="showNavbar" 
      @logout="handleLogout" 
      :studentName="studentData?.persona || studentData?.nombre" 
    />
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const studentData = ref(null);
    const showNavbar = ref(false);
    
    // Función para verificar autenticación
    const checkAuth = () => {
      const token = localStorage.getItem('jwt_token');
      const isLogin = route.path === '/login';
      showNavbar.value = !!token && !isLogin;
      
      console.log('🔍 CheckAuth:', {
        token: token ? 'exists' : 'none',
        path: route.path,
        isLogin,
        showNavbar: showNavbar.value
      });
    };
    
    // Cargar datos del estudiante
    const loadStudentData = () => {
      const savedData = localStorage.getItem('student_data');
      if (savedData) {
        try {
          studentData.value = JSON.parse(savedData);
        } catch (e) {
          console.error('Error parsing student data:', e);
        }
      }
    };
    
    const handleLogout = () => {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('student_data');
      studentData.value = null;
      showNavbar.value = false;
      router.push('/login');
    };
    
    // Ejecutar al montar
    onMounted(() => {
      loadStudentData();
      checkAuth();
    });
    
    // Vigilar cambios en la ruta
    watchEffect(() => {
      // Esto se ejecutará cada vez que route.path cambie
      route.path;
      checkAuth();
    });
    
    // También vigilar cambios en localStorage (para cuando se hace login)
    window.addEventListener('storage', () => {
      loadStudentData();
      checkAuth();
    });
    
    return {
      showNavbar,
      studentData,
      handleLogout
    };
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Cabin', sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #fff;
}

#app {
  min-height: 100vh;
}
</style>
