<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-purple-500 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center font-bold text-white">
            SHL
          </div>
          <h1 class="text-2xl font-bold text-white">Slay The Horde</h1>
        </div>
        <nav class="flex items-center gap-6">
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-6">
            <span class="text-gray-300">{{ authStore.user?.name }}</span>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
          <div v-else class="flex gap-3">
            <router-link
              to="/login"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Connexion
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
            >
              Inscription
            </router-link>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  // Check if user is already logged in
  await authStore.checkSession();
});

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    router.push('/login');
  }
};
</script>
