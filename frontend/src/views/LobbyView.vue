<template>
  <div class="space-y-8">
    <!-- Lobby Detail -->
    <div v-if="activeLobbyId" class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white">Lobby</h1>
          <p class="text-gray-400 mt-2">ID: {{ activeLobbyId }}</p>
        </div>
        <button
          @click="router.push('/lobbies')"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
        >
          ← Retour
        </button>
      </div>

      <div v-if="lobbyStore.currentLobby" class="bg-slate-800 rounded-lg border border-purple-500 p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-2xl font-bold text-white">{{ lobbyStore.currentLobby.name }}</h2>
            <p class="text-gray-400 text-sm mt-1">
              Propriétaire: {{ lobbyStore.currentLobby.ownerId }}
            </p>
          </div>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              {
                'bg-green-900 text-green-200': lobbyStore.currentLobby.status === 'WAITING',
                'bg-blue-900 text-blue-200': lobbyStore.currentLobby.status === 'PLAYING',
                'bg-gray-900 text-gray-200': lobbyStore.currentLobby.status === 'ENDED',
              },
            ]"
          >
            {{ lobbyStore.currentLobby.status }}
          </span>
        </div>

        <div class="mb-4 text-gray-400">
          <span class="font-semibold">Joueurs:</span>
          {{ lobbyStore.currentLobby.players?.length || 0 }}/{{ lobbyStore.currentLobby.slots }}
          <span v-if="lobbyStore.currentLobby.password" class="ml-2 text-sm">🔒</span>
        </div>

        <div class="mb-6">
          <div class="text-sm text-gray-400 mb-2">Joueurs:</div>
          <div class="space-y-1">
            <div
              v-for="player in lobbyStore.currentLobby.players"
              :key="player.id"
              class="text-sm text-gray-300 bg-slate-700 px-2 py-1 rounded"
            >
              {{ player.name }}
            </div>
          </div>
        </div>

        <div v-if="lobbyStore.error" class="mb-4 p-3 bg-red-900 border border-red-500 rounded-lg text-red-200 text-sm">
          {{ lobbyStore.error }}
        </div>

        <div class="flex gap-2">
          <button
            v-if="canJoinOrRejoinCurrentLobby"
            @click="joinLobby(lobbyStore.currentLobby)"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition text-sm"
          >
            {{
              lobbyStore.currentLobby.status === 'PLAYING'
                ? 'Rejoindre la partie'
                : isUserInCurrentLobby
                  ? 'Rejoindre à nouveau'
                  : 'Rejoindre'
            }}
          </button>
          <button
            v-if="canStartGame"
            @click="startGame"
            :disabled="startingGame"
            class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50"
          >
            {{ startingGame ? 'Lancement...' : 'Lancer le jeu' }}
          </button>
          <button
            @click="refreshCurrentLobby"
            :disabled="lobbyStore.isLoading"
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50"
          >
            {{ lobbyStore.isLoading ? 'Chargement...' : 'Rafraîchir' }}
          </button>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-slate-800 rounded-lg border border-purple-500">
        <p class="text-gray-400">Chargement du lobby...</p>
      </div>
    </div>

    <!-- Lobby List -->
    <div v-else>
    <!-- Header with Create Button -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-white">Lobbies</h1>
        <p class="text-gray-400 mt-2">Rejoignez une partie ou en créez une nouvelle</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="lobbyStore.fetchLobbies()"
          :disabled="lobbyStore.isLoading"
          class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {{ lobbyStore.isLoading ? 'Chargement...' : 'Rafraîchir' }}
        </button>
        <button
          @click="showCreateForm = true"
          class="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
        >
          + Créer un Lobby
        </button>
      </div>
    </div>

    <!-- Create Lobby Form -->
    <div v-if="showCreateForm" class="bg-slate-800 rounded-lg border border-purple-500 p-8">
      <h2 class="text-2xl font-bold text-white mb-6">Créer un nouveau Lobby</h2>
      <form @submit.prevent="handleCreateLobby" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
            Nom du Lobby
          </label>
          <input
            id="name"
            v-model="createForm.name"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            placeholder="Mon épique aventure"
          />
        </div>

        <div>
          <label for="slots" class="block text-sm font-medium text-gray-300 mb-2">
            Nombre de joueurs (1-4)
          </label>
          <input
            id="slots"
            v-model.number="createForm.slots"
            type="number"
            min="1"
            max="4"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            Mot de passe (optionnel)
          </label>
          <input
            id="password"
            v-model="createForm.password"
            type="password"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            placeholder="Laissez vide pour public"
          />
        </div>

        <div v-if="lobbyStore.error" class="p-3 bg-red-900 border border-red-500 rounded-lg text-red-200 text-sm">
          {{ lobbyStore.error }}
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="lobbyStore.isLoading"
            class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {{ lobbyStore.isLoading ? 'Création...' : 'Créer' }}
          </button>
          <button
            type="button"
            @click="showCreateForm = false"
            class="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="lobbyStore.isLoading && lobbyStore.lobbies.length === 0" class="text-center py-12">
      <div class="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      <p class="text-gray-400 mt-4">Chargement des lobbies...</p>
    </div>

    <!-- Lobbies List -->
    <div v-else-if="lobbyStore.lobbies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="lobby in lobbyStore.lobbies"
        :key="lobby.id"
        class="bg-slate-800 rounded-lg border border-purple-500 p-6 hover:border-purple-400 transition hover:shadow-lg hover:shadow-purple-500/20"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-white">{{ lobby.name }}</h3>
            <p class="text-gray-400 text-sm mt-1">
              Propriétaire: {{ lobby.ownerId }}
            </p>
          </div>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              {
                'bg-green-900 text-green-200': lobby.status === 'WAITING',
                'bg-blue-900 text-blue-200': lobby.status === 'PLAYING',
                'bg-gray-900 text-gray-200': lobby.status === 'ENDED',
              },
            ]"
          >
            {{ lobby.status }}
          </span>
        </div>

        <div class="mb-4 space-y-2">
          <div class="text-gray-400">
            <span class="font-semibold">Joueurs:</span>
            {{ lobby.players?.length || 0 }}/{{ lobby.slots }}
          </div>
          <div v-if="lobby.password" class="text-gray-400 text-sm">
            🔒 Protégé par mot de passe
          </div>
        </div>

        <!-- Player List -->
        <div class="mb-4">
          <div class="text-sm text-gray-400 mb-2">Joueurs:</div>
          <div class="space-y-1">
            <div
              v-for="player in lobby.players"
              :key="player.id"
              class="text-sm text-gray-300 bg-slate-700 px-2 py-1 rounded"
            >
              {{ player.name }}
            </div>
            <div
              v-if="!lobby.players || lobby.players.length === 0"
              class="text-sm text-gray-500 italic"
            >
              Aucun joueur
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            v-if="canJoinLobby(lobby)"
            @click="joinLobby(lobby)"
            class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition text-sm"
          >
            {{ lobby.status === 'PLAYING' ? 'Rejoindre la partie' : 'Rejoindre' }}
          </button>
          <button
            v-else
            disabled
            class="flex-1 px-4 py-2 bg-slate-700 text-gray-400 font-semibold rounded-lg text-sm cursor-not-allowed"
          >
            Non disponible
          </button>
          <button
            @click="viewLobby(lobby)"
            class="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-sm"
          >
            Voir détails
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-slate-800 rounded-lg border border-purple-500">
      <p class="text-gray-400 text-lg">Aucun lobby disponible</p>
      <p class="text-gray-500 text-sm mt-2">Soyez le premier à en créer un!</p>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLobbyStore } from '../stores/lobby';
import type { Lobby } from '../types';
import { getSocket } from '../utils/socket';

const authStore = useAuthStore();
const lobbyStore = useLobbyStore();
const router = useRouter();
const route = useRoute();

const showCreateForm = ref(false);
const createForm = reactive({
  name: '',
  slots: 1,
  password: '',
});

const activeLobbyId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' && id.length ? id : null;
});

const isUserInCurrentLobby = computed(() => {
  const lobby = lobbyStore.currentLobby;
  const userId = authStore.user?.id;
  if (!lobby || !userId) return false;
  return (lobby.players ?? []).some(p => p.id === userId);
});

const canJoinOrRejoinCurrentLobby = computed(() => {
  const lobby = lobbyStore.currentLobby;
  const userId = authStore.user?.id;
  if (!lobby || !userId) return false;
  if (lobby.status === 'WAITING') return true;
  // During PLAYING we allow attempting to (re)join; backend enforces that only actual participants can rejoin.
  if (lobby.status === 'PLAYING') return true;
  return false;
});

const canJoinLobby = (lobby: Lobby) => {
  const userId = authStore.user?.id;
  if (!userId) return false;
  if (lobby.status === 'WAITING') return true;
  // Allow attempting to rejoin a running game; backend will reject non-participants.
  if (lobby.status === 'PLAYING') return true;
  return false;
};

const isLobbyOwner = computed(() => {
  const lobby = lobbyStore.currentLobby;
  const userId = authStore.user?.id;
  if (!lobby || !userId) return false;
  return lobby.ownerId === userId;
});

const canStartGame = computed(() => {
  const lobby = lobbyStore.currentLobby;
  if (!lobby) return false;
  return lobby.status === 'WAITING' && isLobbyOwner.value;
});

const startingGame = ref(false);
const startGame = async () => {
  if (!activeLobbyId.value || startingGame.value) return;
  startingGame.value = true;
  lobbyStore.setError(null);

  const socket = getSocket();
  try {
    const game = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout starting game')), 8000);
      const onStarted = (payload: any) => {
        clearTimeout(timeout);
        socket.off('game:error', onError);
        resolve(payload?.game);
      };
      const onError = (payload: any) => {
        clearTimeout(timeout);
        socket.off('game:started', onStarted);
        reject(new Error(payload?.message || 'Failed to start game'));
      };

      socket.once('game:started', onStarted);
      socket.once('game:error', onError);
      socket.emit('game:start', { lobbyId: activeLobbyId.value });
    });

    if (game) {
      await router.push('/game');
    }
  } catch (err) {
    lobbyStore.setError(err instanceof Error ? err.message : 'Failed to start game');
  } finally {
    startingGame.value = false;
  }
};

const refreshCurrentLobby = async () => {
  if (activeLobbyId.value) {
    await lobbyStore.fetchLobbyById(activeLobbyId.value);
  }
};

const syncLobbyFromRoute = async () => {
  if (!activeLobbyId.value) {
    return;
  }
  await lobbyStore.fetchLobbyById(activeLobbyId.value);
};

const joinedLobbyId = ref<string | null>(null);
const syncSocketRoomFromRoute = () => {
  const socket = getSocket();
  const targetLobbyId = activeLobbyId.value;
  if (joinedLobbyId.value && joinedLobbyId.value !== targetLobbyId) {
    socket.emit('lobby:leave', { lobbyId: joinedLobbyId.value });
    joinedLobbyId.value = null;
  }
  if (targetLobbyId && joinedLobbyId.value !== targetLobbyId) {
    socket.emit('lobby:join', { lobbyId: targetLobbyId });
    joinedLobbyId.value = targetLobbyId;
  }
};

const leaveLobbyPresence = async (lobbyId: string) => {
  const userId = authStore.user?.id;
  if (!userId) return;
  try {
    await lobbyStore.leaveLobby(lobbyId, userId);
  } catch {
    // Ignore; navigation should still work even if backend refuses (e.g. owner/last player)
  }
};

onMounted(async () => {
  // Redirect if not authenticated
  if (!authStore.isAuthenticated) {
    await router.push('/login');
    return;
  }

  // Fetch lobbies
  if (!lobbyStore.hasLoadedLobbies) {
    await lobbyStore.fetchLobbies();
  }

  await syncLobbyFromRoute();
  syncSocketRoomFromRoute();
});

// Watch for error changes
watch(() => lobbyStore.error, (newError) => {
  if (newError) {
    console.error('Lobby error:', newError);
  }
});

watch(activeLobbyId, async () => {
  await syncLobbyFromRoute();
  syncSocketRoomFromRoute();

  if (!activeLobbyId.value) {
    await lobbyStore.fetchLobbies();
  }
});

watch(
  () => lobbyStore.currentLobby?.status,
  async (status) => {
    if (activeLobbyId.value && status === 'PLAYING' && isUserInCurrentLobby.value) {
      await router.push('/game');
    }
  }
  ,
  { immediate: true }
);

onBeforeRouteLeave(async (to, from) => {
  const fromLobbyId = typeof from.params.id === 'string' ? from.params.id : null;
  const toLobbyId = typeof to.params.id === 'string' ? to.params.id : null;
  const isGoingToGame = to.name === 'game' || (typeof to.path === 'string' && to.path.startsWith('/game'));

  if (fromLobbyId && fromLobbyId !== toLobbyId) {
    getSocket().emit('lobby:leave', { lobbyId: fromLobbyId });
    joinedLobbyId.value = null;
    // When transitioning to the game view, keep lobby membership and state.
    // Otherwise the game view will treat it as "left lobby" and redirect back to /lobbies.
    if (!isGoingToGame) {
      await leaveLobbyPresence(fromLobbyId);
      lobbyStore.clearCurrentLobby();
      await lobbyStore.fetchLobbies();
    }
  }
});

onBeforeUnmount(() => {
  if (joinedLobbyId.value) {
    getSocket().emit('lobby:leave', { lobbyId: joinedLobbyId.value });
    joinedLobbyId.value = null;
  }
});

const handleCreateLobby = async () => {
  const lobby = await lobbyStore.createLobby(
    createForm.name,
    createForm.slots,
    createForm.password || undefined
  );
  if (lobby) {
    showCreateForm.value = false;
    createForm.name = '';
    createForm.slots = 1;
    createForm.password = '';
    // Navigate to lobby
    await router.push(`/lobby/${lobby.id}`);
  }
};

const joinLobby = async (lobby: Lobby) => {
  const userId = authStore.user?.id;
  const alreadyInLobby = !!userId && (lobby.players ?? []).some(p => p.id === userId);
  let password = undefined;
  // Don't prompt for password during PLAYING; rejoin is validated server-side.
  if (lobby.status !== 'PLAYING' && lobby.password && !alreadyInLobby) {
    password = prompt('Ce lobby est protégé. Entrez le mot de passe:');
    if (!password) return;
  }
  
  const joined = await lobbyStore.joinLobby(lobby.id, password);
  if (joined) {
    if (joined.status === 'PLAYING') {
      await router.push('/game');
    } else {
      await router.push(`/lobby/${lobby.id}`);
    }
  }
};

const viewLobby = async (lobby: Lobby) => {
  await router.push(`/lobby/${lobby.id}`);
};
</script>
