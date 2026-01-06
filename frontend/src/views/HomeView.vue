<template>
  <div class="space-y-8">
    <UiCard padding="lg">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="space-y-2">
          <h1 class="text-3xl font-black tracking-tight text-white">Accueil</h1>
          <p class="text-slate-300">
            Planifiez vos cartes, protégez vos alliés et grimpez les étages en coop.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UiButton to="/lobbies" variant="primary">Lobbies</UiButton>
          <UiButton to="/lobbies?create=true" variant="secondary">Créer un lobby</UiButton>
        </div>
      </div>
    </UiCard>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <UiCard padding="sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Lobbies actifs</div>
        <div class="mt-2 text-3xl font-black text-white">{{ stats.lobbyCount }}</div>
      </UiCard>
      <UiCard padding="sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Joueurs (dans les lobbies)</div>
        <div class="mt-2 text-3xl font-black text-white">{{ stats.playerCount }}</div>
      </UiCard>
      <UiCard padding="sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Progression</div>
        <div class="mt-2 text-3xl font-black text-white">Étage {{ stats.maxFloor }} MAX</div>
      </UiCard>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UiCard padding="lg">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-lg font-bold text-white">Démarrer</div>
            <UiBadge variant="primary">Co-op</UiBadge>
          </div>
          <p class="text-sm text-slate-300">
            Rejoignez un lobby existant ou créez le vôtre. Le propriétaire démarre la partie quand tout le monde est prêt.
          </p>
          <div class="flex flex-wrap gap-2">
            <UiButton to="/lobbies">Rejoindre un lobby</UiButton>
            <UiButton to="/lobbies?create=true" variant="secondary">Créer un lobby</UiButton>
          </div>
        </div>
      </UiCard>

      <UiCard padding="lg">
        <div class="space-y-4">
          <div class="text-lg font-bold text-white">Comment ça marche</div>
          <ol class="space-y-2 text-sm text-slate-300">
            <li><span class="font-semibold text-slate-100">1.</span> Chaque round, vous planifiez une carte.</li>
            <li><span class="font-semibold text-slate-100">2.</span> Vous pouvez aider un allié avec ♥ (soin) ou ♦ (armure persistante).</li>
            <li><span class="font-semibold text-slate-100">3.</span> Une fois tous validés, le serveur résout le round.</li>
          </ol>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLobbyStore } from '../stores/lobby';
import UiBadge from '../components/ui/UiBadge.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiCard from '../components/ui/UiCard.vue';

const lobbyStore = useLobbyStore();

const stats = ref({
  lobbyCount: 0,
  playerCount: 0,
  maxFloor: 0,
});

onMounted(async () => {
  // Fetch lobbies and calculate stats
  if (!lobbyStore.hasLoadedLobbies) {
    await lobbyStore.fetchLobbies();
  }
  
  stats.value.lobbyCount = lobbyStore.lobbies.length;
  stats.value.playerCount = lobbyStore.lobbies.reduce((sum, l) => sum + (l.players?.length || 0), 0);
  stats.value.maxFloor = 50;
});
</script>
