<template>
  <div class="space-y-8">
    <!-- Lobby Detail -->
    <div v-if="activeLobbyId" class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-white">Lobby</h1>
          <p class="mt-2 text-sm text-slate-400">ID: {{ activeLobbyId }}</p>
        </div>
        <UiButton variant="secondary" @click="router.push('/lobbies')">Retour</UiButton>
      </div>

      <UiCard v-if="lobbyStore.currentLobby" padding="lg">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-2xl font-bold text-white">{{ lobbyStore.currentLobby.name }}</h2>
            <p class="mt-1 text-sm text-slate-400">
              {{ (lobbyStore.currentLobby.players?.length || 0) }}/{{ lobbyStore.currentLobby.slots }} joueurs
            </p>
          </div>
          <LobbyStatusBadge :status="lobbyStore.currentLobby.status" />
        </div>

        <div class="mt-6">
          <div class="text-xs font-semibold text-slate-400">Joueurs</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <UiBadge v-for="p in lobbyStore.currentLobby.players" :key="p.id" variant="neutral">
              {{ p.name }}
            </UiBadge>
          </div>
        </div>

        <UiAlert v-if="lobbyStore.error" class="mt-6" variant="danger">
          {{ lobbyStore.error }}
        </UiAlert>

        <div class="mt-6 flex flex-wrap gap-2">
          <UiButton v-if="canJoinOrRejoinCurrentLobby" :disabled="lobbyStore.isLoading" @click="joinLobbyById({ lobbyId: lobbyStore.currentLobby.id })">
            {{
              lobbyStore.currentLobby.status === 'PLAYING'
                ? 'Rejoindre la partie'
                : isUserInCurrentLobby
                  ? 'Rejoindre à nouveau'
                  : 'Rejoindre'
            }}
          </UiButton>
          <UiButton
            v-if="canStartGame"
            variant="primary"
            :disabled="startingGame"
            :loading="startingGame"
            @click="startGame"
          >
            Lancer le jeu
          </UiButton>
          <UiButton variant="secondary" :disabled="lobbyStore.isLoading" @click="refreshCurrentLobby">
            Rafraîchir
          </UiButton>
        </div>
      </UiCard>

      <UiCard v-else class="text-center py-12" padding="lg">
        <div class="mx-auto flex w-fit items-center gap-3 text-slate-300">
          <UiSpinner />
          <span>Chargement du lobby…</span>
        </div>
      </UiCard>
    </div>

    <!-- Lobby List -->
    <div class="flex flex-col gap-6" v-else>
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-white">Lobbies</h1>
          <p class="mt-2 text-sm text-slate-400">Rejoignez une partie ou créez-en une nouvelle.</p>
        </div>
        <div class="flex gap-2">
          <UiButton variant="secondary" :disabled="lobbyStore.isLoading" @click="lobbyStore.fetchLobbies()">
            Rafraîchir
          </UiButton>
          <UiButton variant="primary" @click="openCreate">
            Créer un lobby
          </UiButton>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-1">
          <LobbyCreateCard
            v-if="showCreateForm"
            :form="createForm"
            :disabled="lobbyStore.isLoading"
            :error="lobbyStore.error"
            @submit="handleCreateLobby"
            @cancel="closeCreate"
          />
          <UiCard v-else padding="lg">
            <div class="space-y-3">
              <div class="text-lg font-bold text-white">Créer une partie</div>
              <p class="text-sm text-slate-400">
                Créez un lobby public ou protégé, puis lancez la partie quand tout le monde est prêt.
              </p>
              <UiButton class="w-full" @click="openCreate">Créer un lobby</UiButton>
            </div>
          </UiCard>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <UiCard v-if="lobbyStore.isLoading && lobbyStore.lobbies.length === 0" class="text-center py-10" padding="lg">
            <div class="mx-auto flex w-fit items-center gap-3 text-slate-300">
              <UiSpinner />
              <span class="text-sm">Chargement des lobbies…</span>
            </div>
          </UiCard>

          <div v-else-if="lobbyStore.lobbies.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LobbyListCard
              v-for="lobby in lobbyStore.lobbies"
              :key="lobby.id"
              :lobby="lobby"
              :current-user-id="myUserId"
              :disabled="lobbyStore.isLoading"
              :can-join="canJoinLobby(lobby)"
              @view="viewLobby(lobby)"
              @join="joinLobbyById"
            />
          </div>

          <UiCard v-else class="text-center py-10" padding="lg">
            <div class="text-lg font-bold text-white">Aucun lobby</div>
            <div class="mt-2 text-sm text-slate-400">Soyez le premier à en créer un.</div>
            <div class="mt-6 flex justify-center">
              <UiButton @click="openCreate">Créer un lobby</UiButton>
            </div>
          </UiCard>
        </div>
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
import UiAlert from '../components/ui/UiAlert.vue';
import UiBadge from '../components/ui/UiBadge.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiCard from '../components/ui/UiCard.vue';
import UiSpinner from '../components/ui/UiSpinner.vue';
import LobbyCreateCard from '../components/lobby/LobbyCreateCard.vue';
import LobbyListCard from '../components/lobby/LobbyListCard.vue';
import LobbyStatusBadge from '../components/lobby/LobbyStatusBadge.vue';

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

const myUserId = computed(() => authStore.user?.id || null);

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

  if (route.query.create === 'true') {
    showCreateForm.value = true;
  }
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
    closeCreate();
    // Navigate to lobby
    await router.push(`/lobby/${lobby.id}`);
  }
};

const joinLobbyById = async (payload: { lobbyId: string; password?: string }) => {
  const joined = await lobbyStore.joinLobby(payload.lobbyId, payload.password);
  if (joined) {
    if (joined.status === 'PLAYING') {
      await router.push('/game');
    } else {
      await router.push(`/lobby/${payload.lobbyId}`);
    }
  }
};

const viewLobby = async (lobby: Lobby) => {
  await router.push(`/lobby/${lobby.id}`);
};

const openCreate = () => {
  showCreateForm.value = true;
};

const closeCreate = () => {
  showCreateForm.value = false;
  createForm.name = '';
  createForm.slots = 1;
  createForm.password = '';
};
</script>
