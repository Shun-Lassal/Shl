import { io, type Socket } from 'socket.io-client';
import { useLobbyStore } from '../stores/lobby';
import { useGameStore } from '../stores/game';
import { useAuthStore } from '../stores/auth';
import { API_BASE_URL } from '../config/api';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketBaseUrl = API_BASE_URL.endsWith('/api')
      ? API_BASE_URL.slice(0, -4)
      : API_BASE_URL;
    socket = io(socketBaseUrl, {
      withCredentials: true,
      autoConnect: true,
      path: '/socket.io',
    });

    setupSocketListeners();
  }
  return socket;
};

const setupSocketListeners = () => {
  if (!socket) return;

  const lobbyStore = useLobbyStore();
  const gameStore = useGameStore();
  const authStore = useAuthStore();

  socket.on('connect_error', async (err) => {
    const message = typeof (err as any)?.message === 'string' ? (err as any).message : '';
    console.error('Socket connect_error:', err);
    if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('session')) {
      const [{ default: router }] = await Promise.all([import('../router')]);
      authStore.setUser(null);
      if (router.currentRoute.value?.path !== '/login') {
        await router.push({ path: '/login', query: { redirect: router.currentRoute.value?.fullPath || '/home' } });
      }
    }
  });

  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket');
    // Socket.IO reconnect does NOT keep room membership; re-join active rooms.
    if (authStore.isAuthenticated && authStore.user?.id) {
      const lobbyId = lobbyStore.currentLobby?.id;
      if (lobbyId) socket?.emit('lobby:join', { lobbyId });
      const gameId = gameStore.currentGame?.id;
      if (gameId) socket?.emit('game:join', { gameId });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket');
  });

  // Lobby events
  socket.on('lobby:update', (data) => {
    console.log('Lobby updated:', data);
    if (data.lobby && lobbyStore.currentLobby?.id === data.lobby.id) {
      lobbyStore.setCurrentLobby(data.lobby);
    }
  });

  socket.on('lobby:error', (data) => {
    const message = typeof data?.message === 'string' ? data.message : 'Lobby error';
    console.error('Lobby error:', data);
    lobbyStore.setError(message);
  });

  socket.on('lobby:player_joined', (data) => {
    console.log('Player joined lobby:', data);
    if (data.lobby && lobbyStore.currentLobby?.id === data.lobby.id) {
      lobbyStore.fetchLobbyById(data.lobby.id);
    }
  });

  socket.on('lobby:player_left', (data) => {
    console.log('Player left lobby:', data);
    if (data.lobby && lobbyStore.currentLobby?.id === data.lobby.id) {
      lobbyStore.fetchLobbyById(data.lobby.id);
    }
  });

  // Game events
  socket.on('game:started', (data) => {
    console.log('Game started:', data);
    gameStore.setCurrentGame(data.game);
    gameStore.selectCurrentPlayer(authStore.user?.id);
  });

  socket.on('game:update', (data) => {
    console.log('Game updated:', data);
    gameStore.setCurrentGame(data.game);
    gameStore.selectCurrentPlayer(authStore.user?.id);
  });

  socket.on('game:planning', (data) => {
    if (typeof data?.endsAt === 'number') {
      gameStore.setPlanning(
        data.endsAt,
        Array.isArray(data.confirmedUserIds) ? data.confirmedUserIds : [],
        data && typeof data.plannedActionsByUserId === 'object' && data.plannedActionsByUserId ? data.plannedActionsByUserId : {}
      );
    }
  });

  socket.on('game:reward', (data) => {
    if (typeof data?.endsAt === 'number') {
      gameStore.setReward(
        data.endsAt,
        Array.isArray(data.confirmedUserIds) ? data.confirmedUserIds : [],
        Array.isArray(data.options) ? data.options : [],
        data && typeof data.pickedByUserId === 'object' && data.pickedByUserId ? data.pickedByUserId : {}
      );
    }
  });

  socket.on('game:phase_change', (data) => {
    console.log('Game phase changed:', data);
    gameStore.updateGame({ phase: data.phase });
  });

  socket.on('game:player_turn', (data) => {
    console.log('Player turn:', data);
    // Update whose turn it is
  });

  socket.on('game:over', (data) => {
    console.log('Game over:', data);
    gameStore.updateGame({ phase: 'GAME_OVER' });
    gameStore.setGameOver({
      winners: Array.isArray(data?.winners) ? data.winners : [],
      finalFloor: typeof data?.finalFloor === 'number' ? data.finalFloor : undefined,
    });
  });

  socket.on('game:error', (data) => {
    console.error('Game error:', data);
    gameStore.setError(data.message);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
