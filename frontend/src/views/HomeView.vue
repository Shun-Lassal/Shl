<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
      <h1 class="text-4xl font-bold mb-2">Bienvenue dans Slay The Horde!</h1>
      <p class="text-lg opacity-90">Préparez-vous pour une aventure roguelike épique</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-800 rounded-lg border border-purple-500 p-6">
        <div class="text-4xl font-bold text-purple-400 mb-2">{{ stats.lobbyCount }}</div>
        <div class="text-gray-400">Lobbies actifs</div>
      </div>
      <div class="bg-slate-800 rounded-lg border border-purple-500 p-6">
        <div class="text-4xl font-bold text-purple-400 mb-2">{{ stats.playerCount }}</div>
        <div class="text-gray-400">Joueurs en ligne</div>
      </div>
      <div class="bg-slate-800 rounded-lg border border-purple-500 p-6">
        <div class="text-4xl font-bold text-purple-400 mb-2">Étage Max</div>
        <div class="text-gray-400">{{ stats.maxFloor }}</div>
      </div>
    </div>

    <!-- CTA Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <router-link
        to="/lobbies"
        class="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-lg p-8 text-center transition transform hover:scale-105"
      >
        <div class="text-3xl mb-2">🎪</div>
        <div class="text-xl font-bold">Rejoindre un Lobby</div>
        <div class="text-sm opacity-75 mt-2">Chercher et rejoindre un lobby existant</div>
      </router-link>
      <router-link
        to="/lobbies?create=true"
        class="bg-gradient-to-br from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900 text-white rounded-lg p-8 text-center transition transform hover:scale-105"
      >
        <div class="text-3xl mb-2">✨</div>
        <div class="text-xl font-bold">Créer un Lobby</div>
        <div class="text-sm opacity-75 mt-2">Créer votre propre partie et attendre des joueurs</div>
      </router-link>
    </div>

    <!-- Info Section -->
    <div class="bg-slate-800 rounded-lg border border-purple-500 p-8">
      <h2 class="text-2xl font-bold text-white mb-4">Comment jouer</h2>
      <div class="space-y-4 text-gray-300">
        <p>
          <span class="text-purple-400 font-semibold">1. Créez ou rejoignez un Lobby</span>
          - Attendez que les joueurs se rejoignent (max 4 joueurs)
        </p>
        <p>
          <span class="text-purple-400 font-semibold">2. Démarrez la partie</span>
          - Commencez votre aventure roguelike
        </p>
        <p>
          <span class="text-purple-400 font-semibold">3. Explorez et combattez</span>
          - Parcourez les étages, collectez des cartes, et éliminez vos ennemis
        </p>
        <p>
          <span class="text-purple-400 font-semibold">4. Survivez et triomphez</span>
          - Gagnez des points en fonction de votre position finale
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLobbyStore } from '../stores/lobby';

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
  stats.value.maxFloor = 10;
});
</script>
