import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lobbies',
      name: 'lobbies',
      component: () => import('../views/LobbyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lobby/:id',
      name: 'lobby-detail',
      component: () => import('../views/LobbyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home',
    },
  ],
});

// Guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth as boolean;

  const ensureSessionChecked = async () => {
    if (!authStore.isAuthenticated) {
      await authStore.checkSession();
    }
  };

  (async () => {
    if (requiresAuth) {
      await ensureSessionChecked();
      if (!authStore.isAuthenticated) {
        next('/login');
        return;
      }
      next();
      return;
    }

    // For public pages, if we have a valid session cookie, avoid flashing the login screen.
    if (to.path === '/login' || to.path === '/register') {
      await ensureSessionChecked();
      if (authStore.isAuthenticated) {
        next('/home');
        return;
      }
    }

    next();
  })().catch(() => next('/login'));
});

export default router;
