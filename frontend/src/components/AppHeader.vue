<template>
  <header class="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Shl Frontend
      </h1>
      <nav class="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
        <RouterLink class="transition hover:text-sky-600" to="/">
          Accueil
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
