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
            <div
              v-for="p in run.players"
              :key="p.scoreId"
              class="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-100"
            >
              <span>{{ p.name }}</span>
              <span v-if="authStore.isAdmin && p.ipAddress" class="text-xs text-slate-400">
                {{ p.ipAddress }}
              </span>
              <button
                v-if="authStore.isAdmin"
                type="button"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="deletingScoreId === p.scoreId"
                :aria-label="`Supprimer le score de ${p.name}`"
                @click="deleteScore(run.lobbyName, p.scoreId, p.name)"
              >
                <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M9 3.75A2.25 2.25 0 0 1 11.25 1.5h1.5A2.25 2.25 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5h-.568l-.61 12.197A2.25 2.25 0 0 1 15.326 20.4H8.674a2.25 2.25 0 0 1-2.246-2.203L5.818 6H5.25a.75.75 0 0 1 0-1.5H9v-.75Zm1.5.75h3v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v.75ZM7.32 6l.606 12.122a.75.75 0 0 0 .748.734h6.652a.75.75 0 0 0 .748-.734L16.68 6H7.32Zm2.43 2.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm4.5 0A.75.75 0 0 1 15 9v6a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Z" />
                </svg>
              </button>
            </div>
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
import { useAuthStore } from '../stores/auth';
import type { ScoreboardRun } from '../types';

const authStore = useAuthStore();
const runs = ref<ScoreboardRun[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const deletingScoreId = ref<string | null>(null);

const runKey = (run: ScoreboardRun) => `${run.lobbyId}-${run.endedAt ?? 'unknown'}`;

const formatPosition = (position: number) => {
  if (position === -1) return 'Victoire';
  return `Étage ${position}`;
};

const getRunPosition = (run: ScoreboardRun) => {
  const positions = run.players.map((player) => player.position);
  return positions.some((position) => position === -1) ? -1 : Math.max(...positions);
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

const deleteScore = async (lobbyName: string, scoreId: string, playerName: string) => {
  if (!authStore.isAdmin) return;

  const confirmed = window.confirm(
    `Supprimer le score de ${playerName} pour la partie "${lobbyName}" ?`
  );
  if (!confirmed) return;

  deletingScoreId.value = scoreId;
  error.value = null;

  try {
    const response = await gameScoreApi.deleteScore(scoreId);
    if (!response.success) {
      error.value = response.message || 'Impossible de supprimer le score';
      return;
    }

    runs.value = runs.value
      .map((run) => ({
        ...run,
        players: run.players.filter((player) => player.scoreId !== scoreId),
      }))
      .filter((run) => run.players.length > 0)
      .map((run) => ({
        ...run,
        position: getRunPosition(run),
      }));
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de supprimer le score';
  } finally {
    deletingScoreId.value = null;
  }
};

onMounted(() => {
  void load();
});
</script>
