import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import LoginCallback from '@/pages/LoginCallback.vue'
import AdminPage from '@/pages/AdminPage.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/login/callback',
    name: 'login-callback',
    component: LoginCallback,
  },
  {
    path: '/about',
    name: 'about',
    component: {
      template: '<div class="text-center text-xl p-8">About Page - Coming Soon</div>',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

let publicAccessFetched = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (!publicAccessFetched) {
    await authStore.fetchPublicAccess();
    publicAccessFetched = true;
  }
  
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }

  if (authStore.publicAccess) {
    if (!authStore.user && !authStore.token) {
      authStore.setGuestUser();
    }
    
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next('/login?redirect=' + encodeURIComponent(to.fullPath));
      return;
    }
    
    if (to.path === '/login' && authStore.isAuthenticated && !authStore.isGuest) {
      const redirect = to.query.redirect as string;
      next(redirect || '/');
      return;
    }
    
    next();
    return;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router
