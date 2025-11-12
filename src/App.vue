<template>
  <div id="app">
    <Navbar 
      v-if="showNavbar" 
      @logout="handleLogout" 
      :studentName="studentData?.persona || studentData?.nombre" 
    />
    <router-view />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
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
    const currentPath = ref(route.path);
    
    // Watch para actualizar la ruta actual
    watch(() => route.path, (newPath) => {
      currentPath.value = newPath;
    });
    
    const isAuthenticated = computed(() => {
      return !!localStorage.getItem('jwt_token');
    });

    const isLoginRoute = computed(() => {
      return currentPath.value === '/login';
    });

    const showNavbar = computed(() => {
      return isAuthenticated.value && !isLoginRoute.value;
    });
    
    const handleLogout = () => {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('student_data');
      studentData.value = null;
      router.push('/login');
    };
    
    onMounted(() => {
      const savedData = localStorage.getItem('student_data');
      if (savedData) {
        studentData.value = JSON.parse(savedData);
      }
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