<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-white">Tableau des scores</h1>
        <p class="mt-2 text-sm text-slate-400">
          Historique des runs terminés (étage atteint, ou victoire).
        </p>
      </div>
      <div class="flex gap-2">
        <UiButton variant="secondary" :disabled="loading" @click="load">
          Rafraîchir
        </UiButton>
      </div>
    </div>

    <UiAlert v-if="error" variant="danger">{{ error }}</UiAlert>

    <UiCard v-if="loading" class="text-center py-10" padding="lg">
      <div class="mx-auto flex w-fit items-center gap-3 text-slate-300">
        <UiSpinner />
        <span class="text-sm">Chargement des scores…</span>
      </div>
    </UiCard>

    <div v-else-if="runs.length > 0" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UiCard v-for="run in runs" :key="runKey(run)" padding="lg">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate text-lg font-bold text-white">{{ run.lobbyName }}</div>
            <div class="mt-1 text-sm text-slate-400">
              {{ formatDateTime(run.endedAt) }}
            </div>
          </div>
          <UiBadge :variant="run.position === -1 ? 'success' : 'primary'">
            {{ formatPosition(run.position) }}
          </UiBadge>
        </div>

        <div class="mt-6">
          <div class="text-xs font-semibold text-slate-400">Joueurs</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <UiBadge v-for="p in run.players" :key="p.userId" variant="neutral">
              {{ p.name }}
            </UiBadge>
          </div>
        </div>
      </UiCard>
    </div>

    <UiCard v-else class="text-center py-10" padding="lg">
      <div class="text-lg font-bold text-white">Aucun score</div>
      <div class="mt-2 text-sm text-slate-400">
        Terminez une partie pour voir apparaître les scores.
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import UiAlert from '../components/ui/UiAlert.vue';
import UiBadge from '../components/ui/UiBadge.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiCard from '../components/ui/UiCard.vue';
import UiSpinner from '../components/ui/UiSpinner.vue';
import { gameScoreApi } from '../api/gameScore';
import type { ScoreboardRun } from '../types';

const runs = ref<ScoreboardRun[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const runKey = (run: ScoreboardRun) => `${run.lobbyId}-${run.endedAt ?? 'unknown'}`;

const formatPosition = (position: number) => {
  if (position === -1) return 'Victoire';
  return `Étage ${position}`;
};

const formatDateTime = (endedAt: string | null) => {
  if (!endedAt) return '—';
  const date = new Date(endedAt);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await gameScoreApi.getScoreboard();
    if (response.success && response.data) {
      runs.value = response.data;
    } else {
      error.value = response.message || 'Impossible de charger les scores';
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de charger les scores';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void load();
});
</script>

