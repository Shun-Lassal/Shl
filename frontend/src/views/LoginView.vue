<template>
  <div class="min-h-[calc(100vh-4rem)] px-4 py-12">
    <div class="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
      <div class="space-y-4">
        <div class="inline-flex items-center gap-3">
          <div class="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600"></div>
          <div>
            <div class="text-sm font-semibold text-slate-200">Slay The Horde</div>
            <div class="text-xs text-slate-400">Co-op • Deck • Roguelike</div>
          </div>
        </div>
        <h1 class="text-3xl font-black tracking-tight text-white">
          Reprenez votre run en quelques secondes.
        </h1>
        <p class="text-slate-300">
          Connectez-vous pour rejoindre votre lobby, planifier vos actions et survivre aux étages.
        </p>
      </div>

      <UiCard class="mx-auto w-full max-w-md" padding="lg">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-white">Connexion</h2>
          <p class="text-sm text-slate-400">Connectez-vous à votre compte.</p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
          <UiInput
            v-model="form.email"
            label="Email"
            type="email"
            autocomplete="email"
            placeholder="votre@email.com"
            required
          />
          <UiInput
            v-model="form.password"
            label="Mot de passe"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
          />

          <UiAlert v-if="authStore.error" variant="danger">
            {{ authStore.error }}
          </UiAlert>

          <UiButton class="w-full" type="submit" :loading="authStore.isLoading">
            Se connecter
          </UiButton>
        </form>

        <div class="mt-6 text-center text-sm text-slate-400">
          Pas de compte ?
          <RouterLink class="font-semibold text-purple-300 hover:text-purple-200" to="/register">
            Créer un compte
          </RouterLink>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import UiAlert from '../components/ui/UiAlert.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiCard from '../components/ui/UiCard.vue';
import UiInput from '../components/ui/UiInput.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  const success = await authStore.login(form.email, form.password);
  if (!success) return;
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home';
  await router.replace(redirect);
};
</script>
