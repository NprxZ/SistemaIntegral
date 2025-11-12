import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Calificaciones from '../views/Calificaciones.vue'
import Kardex from '../views/Kardex.vue'
import Horario from '../views/Horario.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/calificaciones',
    name: 'Calificaciones',
    component: Calificaciones,
    meta: { requiresAuth: true }
  },
  {
    path: '/kardex',
    name: 'Kardex',
    component: Kardex,
    meta: { requiresAuth: true }
  },
  {
    path: '/horario',
    name: 'Horario',
    component: Horario,
    meta: { requiresAuth: true }
  },

  {
  path: '/servicios',
  name: 'Servicios',
  component: () => import('../views/Servicios.vue'),
  meta: { requiresAuth: true }
}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard de navegación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwt_token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router