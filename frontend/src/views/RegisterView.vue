<template>
  <div class="min-h-[calc(100vh-4rem)] px-4 py-12">
    <div class="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
      <div class="space-y-4">
        <div class="inline-flex items-center gap-3">
          <div class="h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-500"></div>
          <div>
            <div class="text-sm font-semibold text-slate-200">Slay The Horde</div>
            <div class="text-xs text-slate-400">Créer un compte</div>
          </div>
        </div>
        <h1 class="text-3xl font-black tracking-tight text-white">
          Une équipe. Un deck. Une stratégie.
        </h1>
        <p class="text-slate-300">
          Inscrivez-vous pour rejoindre une partie coop, partager vos plans et progresser étage après étage.
        </p>
      </div>

      <UiCard class="mx-auto w-full max-w-md" padding="lg">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-white">Inscription</h2>
          <p class="text-sm text-slate-400">Créez votre compte.</p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
          <UiInput
            v-model="form.name"
            label="Nom d'utilisateur"
            autocomplete="nickname"
            placeholder="Votre pseudo"
            required
          />
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
            autocomplete="new-password"
            placeholder="••••••••"
            required
          />

          <UiAlert v-if="authStore.error" variant="danger">
            {{ authStore.error }}
          </UiAlert>

          <UiButton class="w-full" type="submit" :loading="authStore.isLoading">
            Créer le compte
          </UiButton>
        </form>

        <div class="mt-6 text-center text-sm text-slate-400">
          Déjà un compte ?
          <RouterLink class="font-semibold text-purple-300 hover:text-purple-200" to="/login">
            Se connecter
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
  name: '',
  email: '',
  password: '',
});

const handleRegister = async () => {
  const success = await authStore.register(
    form.name,
    form.email,
    form.password
  );
  if (!success) return;
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home';
  await router.replace(redirect);
};
</script>
