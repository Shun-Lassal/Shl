<template>
  <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Pinia Counter
      </h3>
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Incrémentez le compteur pour vérifier le bon fonctionnement de Pinia.
      </p>
    </div>

    <p class="text-4xl font-bold text-sky-600">
      {{ counter.count }}
    </p>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Double: {{ counter.double }}
    </p>

    <div class="flex gap-2">
      <button
        class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        type="button"
        @click="counter.increment"
      >
        Incrémenter
      </button>
      <button
        class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200"
        type="button"
        @click="counter.reset"
      >
        Réinitialiser
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>
