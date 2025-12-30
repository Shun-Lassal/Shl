<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
    <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div class="mx-auto max-w-7xl px-4">
        <div class="flex items-center justify-between gap-4 py-4">
          <RouterLink to="/home" class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600" />
            <div class="leading-tight">
              <div class="text-sm font-black text-white">Slay The Horde</div>
              <div class="text-xs text-slate-400" v-if="authStore.isAuthenticated">
                {{ authStore.user?.name }}
              </div>
            </div>
          </RouterLink>

          <div class="flex items-center gap-2 md:hidden">
            <UiButton variant="ghost" size="sm" @click="mobileMenuOpen = !mobileMenuOpen">
              <span v-if="!mobileMenuOpen">Menu</span>
              <span v-else>Fermer</span>
            </UiButton>
          </div>

          <nav class="hidden flex-wrap items-center gap-2 md:flex">
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

        <div v-if="mobileMenuOpen" class="flex flex-col gap-2 pb-4 md:hidden">
          <UiButton v-if="authStore.isAuthenticated" to="/home" variant="ghost" size="sm" class="w-full" @click="mobileMenuOpen = false">Accueil</UiButton>
          <UiButton v-if="authStore.isAuthenticated" to="/lobbies" variant="ghost" size="sm" class="w-full" @click="mobileMenuOpen = false">Lobbies</UiButton>
          <UiButton v-if="authStore.isAuthenticated" to="/scores" variant="ghost" size="sm" class="w-full" @click="mobileMenuOpen = false">Scores</UiButton>

          <div v-if="!authStore.isAuthenticated" class="flex flex-col gap-2">
            <UiButton to="/login" variant="secondary" size="sm" class="w-full" @click="mobileMenuOpen = false">Connexion</UiButton>
            <UiButton to="/register" variant="primary" size="sm" class="w-full" @click="mobileMenuOpen = false">Inscription</UiButton>
          </div>
          <UiButton v-else variant="danger" size="sm" class="w-full" @click="handleLogout">Déconnexion</UiButton>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import UiButton from './components/ui/UiButton.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const mobileMenuOpen = ref(false);

onMounted(async () => {
  // Check if user is already logged in
  await authStore.checkSession();
});

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  }
);

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    router.push('/login');
  }
};
</script>
