import { createRouter, createWebHistory } from 'vue-router'
import { getAuthToken } from '../utils/cookies'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const token = getAuthToken()
  
  const requiresAuth = to.meta.requiresAuth
  
  if (requiresAuth && !token) {
    return { name: 'login' }
  } else if (!requiresAuth && token && to.name === 'login') {
    return { name: 'home' }
  } else {
    return true
  }
})

export default router

