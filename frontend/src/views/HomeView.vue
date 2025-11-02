<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
    <section class="flex flex-col gap-2 text-center">
      <p class="text-sm font-medium uppercase tracking-wide text-sky-600">
        Stack ready
      </p>
      <h1 class="text-4xl font-bold text-slate-900 dark:text-slate-100">
        Vite + Vue 3 + Pinia + TailwindCSS
      </h1>
      <p class="text-base text-slate-600 dark:text-slate-300">
        Cette base de projet est prête pour bâtir votre interface. Modifiez
        <code class="rounded bg-slate-800 px-1 py-0.5 text-xs text-slate-100">src/views/HomeView.vue</code>
        et commencez à construire&nbsp;!
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 class="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Vue Router
        </h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          Les routes sont déclarées via <code class="rounded bg-slate-800 px-1 py-0.5 text-xs text-slate-100">src/router/index.ts</code>.
          Ajoutez vos vues et composants, le hot-reload est activé.
        </p>
      </article>

      <CounterCard />

      <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 class="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Backend Express
        </h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          Vérification rapide de l&apos;API&nbsp;:&nbsp;
          <span
            :class="[
              'font-semibold',
              apiStatus === 'ok' ? 'text-emerald-600' : apiStatus === 'error' ? 'text-rose-600' : 'text-slate-500',
            ]"
          >
            {{ apiStatusLabel }}
          </span>
        </p>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {{ apiMessage }}
        </p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import CounterCard from '@/components/CounterCard.vue'

const apiStatus = ref<'idle' | 'ok' | 'error'>('idle')
const apiMessage = ref('Ping en cours...')

const apiStatusLabel = computed(() => {
  if (apiStatus.value === 'ok') return 'Backend joignable'
  if (apiStatus.value === 'error') return 'Erreur de connexion'
  return 'Chargement'
})

onMounted(async () => {
  const backendUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/merde'

  try {
    const response = await fetch(`${backendUrl}/`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const body = (await response.json()) as { message?: string }
    apiStatus.value = 'ok'
    apiMessage.value = body.message ?? 'Réponse reçue.'
  } catch (error) {
    console.error('Backend check failed', error)
    apiStatus.value = 'error'
    apiMessage.value = 'Impossible de joindre le backend. Vérifiez docker compose.'
  }
})
</script>
