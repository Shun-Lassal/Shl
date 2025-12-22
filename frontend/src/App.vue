<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
    <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <RouterLink to="/home" class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600" />
          <div class="leading-tight">
            <div class="text-sm font-black text-white">Slay The Horde</div>
            <div class="text-xs text-slate-400" v-if="authStore.isAuthenticated">
              {{ authStore.user?.name }}
            </div>
          </div>
        </RouterLink>

        <nav class="flex items-center gap-2">
          <UiButton v-if="authStore.isAuthenticated" to="/home" variant="ghost" size="sm">Accueil</UiButton>
          <UiButton v-if="authStore.isAuthenticated" to="/lobbies" variant="ghost" size="sm">Lobbies</UiButton>
          <UiButton v-if="authStore.isAuthenticated" to="/scores" variant="ghost" size="sm">Scores</UiButton>

          <div v-if="!authStore.isAuthenticated" class="flex items-center gap-2">
            <UiButton to="/login" variant="secondary" size="sm">Connexion</UiButton>
            <UiButton to="/register" variant="primary" size="sm">Inscription</UiButton>
          </div>
          <UiButton v-else variant="danger" size="sm" @click="handleLogout">Déconnexion</UiButton>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import UiButton from './components/ui/UiButton.vue';

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
