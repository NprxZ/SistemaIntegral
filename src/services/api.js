// src/services/api.js
import axios from 'axios';

// Configuración de la URL base según el entorno
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // En desarrollo usa el proxy
  : '/api';  // En producción usa la URL directa

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error(`❌ Error ${error.response?.status || 'unknown'}:`, error.message);
    
    // Si es 401, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('student_data');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Funciones del API
export const authAPI = {
  login: (credentials) => apiClient.post('/login', credentials),
};

export const studentAPI = {
  getInfo: () => apiClient.get('/movil/estudiante'),
  getCalificaciones: () => apiClient.get('/movil/estudiante/calificaciones'),
  getKardex: () => apiClient.get('/movil/estudiante/kardex'),
  getHorarios: () => apiClient.get('/movil/estudiante/horarios'),
};

export default apiClient;