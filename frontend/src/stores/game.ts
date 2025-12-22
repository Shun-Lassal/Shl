import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Game, PlayerState, EnemyState, PlannedAction } from '../types';
import { gameApi } from '../api/game';
import type { Card } from '../types';

export const useGameStore = defineStore('game', () => {
  const currentGame = ref<Game | null>(null);
  const currentPlayer = ref<PlayerState | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const planningEndsAt = ref<number | null>(null);
  const confirmedUserIds = ref<string[]>([]);
  const plannedActionsByUserId = ref<Record<string, PlannedAction>>({});
  const rewardEndsAt = ref<number | null>(null);
  const rewardConfirmedUserIds = ref<string[]>([]);
  const rewardOptions = ref<Card[]>([]);
  const rewardPickedByUserId = ref<Record<string, string>>({});
  const gameOverWinners = ref<string[]>([]);
  const gameOverFinalFloor = ref<number | null>(null);

  const isGameActive = computed(() => currentGame.value !== null);
  const gamePhase = computed(() => currentGame.value?.phase);
  const currentFloor = computed(() => currentGame.value?.currentFloor);
  const enemies = computed(() => currentGame.value?.enemies || []);
  const players = computed(() => currentGame.value?.players || []);

  const setError = (message: string | null) => {
    error.value = message;
  };

  const setCurrentGame = (game: Game | null) => {
    currentGame.value = game;
  };

  const setCurrentPlayer = (player: PlayerState | null) => {
    currentPlayer.value = player;
  };

  const selectCurrentPlayer = (userId: string | null | undefined) => {
    if (!userId || !currentGame.value) {
      currentPlayer.value = null;
      return;
    }
    const match = currentGame.value.players.find(p => p.userId === userId) || null;
    currentPlayer.value = match;
  };

  const updateGame = (game: Partial<Game>) => {
    if (currentGame.value) {
      currentGame.value = { ...currentGame.value, ...game };
    }
  };

  const updatePlayerState = (playerState: Partial<PlayerState>) => {
    if (currentPlayer.value) {
      currentPlayer.value = { ...currentPlayer.value, ...playerState } as PlayerState;
    }
  };

  const updatePlayerInGame = (playerId: string, updates: Partial<PlayerState>) => {
    if (currentGame.value) {
      const index = currentGame.value.players.findIndex(p => p.id === playerId);
      if (index !== -1) {
        currentGame.value.players[index] = {
          ...currentGame.value.players[index],
          ...updates,
        } as PlayerState;
      }
    }
  };

  const updateEnemyInGame = (enemyId: string, updates: Partial<EnemyState>) => {
    if (currentGame.value) {
      const index = currentGame.value.enemies.findIndex(e => e.id === enemyId);
      if (index !== -1) {
        currentGame.value.enemies[index] = {
          ...currentGame.value.enemies[index],
          ...updates,
        } as EnemyState;
      }
    }
  };

  const fetchGame = async (lobbyId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await gameApi.getGameByLobby(lobbyId);
      if (response.success && response.data) {
        currentGame.value = response.data.game;
        return response.data.game;
      } else {
        error.value = response.message || 'Failed to fetch game';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching game';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const clearGame = () => {
    currentGame.value = null;
    currentPlayer.value = null;
    planningEndsAt.value = null;
    confirmedUserIds.value = [];
    plannedActionsByUserId.value = {};
    rewardEndsAt.value = null;
    rewardConfirmedUserIds.value = [];
    rewardOptions.value = [];
    rewardPickedByUserId.value = {};
    gameOverWinners.value = [];
    gameOverFinalFloor.value = null;
  };

  const setPlanning = (endsAt: number | null, confirmed: string[] = [], planned: Record<string, PlannedAction> = {}) => {
    planningEndsAt.value = endsAt;
    confirmedUserIds.value = confirmed;
    plannedActionsByUserId.value = planned;
  };

  const setReward = (
    endsAt: number | null,
    confirmed: string[] = [],
    options: Card[] = [],
    pickedByUserId: Record<string, string> = {}
  ) => {
    rewardEndsAt.value = endsAt;
    rewardConfirmedUserIds.value = confirmed;
    rewardOptions.value = options;
    rewardPickedByUserId.value = pickedByUserId;
  };

  const setGameOver = (payload: { winners?: string[]; finalFloor?: number } | null) => {
    if (!payload) {
      gameOverWinners.value = [];
      gameOverFinalFloor.value = null;
      return;
    }
    gameOverWinners.value = Array.isArray(payload.winners) ? payload.winners : [];
    gameOverFinalFloor.value = typeof payload.finalFloor === 'number' ? payload.finalFloor : null;
  };

  return {
    currentGame,
    currentPlayer,
    isLoading,
    error,
    planningEndsAt,
    confirmedUserIds,
    plannedActionsByUserId,
    rewardEndsAt,
    rewardConfirmedUserIds,
    rewardOptions,
    rewardPickedByUserId,
    gameOverWinners,
    gameOverFinalFloor,
    isGameActive,
    gamePhase,
    currentFloor,
    enemies,
    players,
    setError,
    setCurrentGame,
    setCurrentPlayer,
    selectCurrentPlayer,
    setPlanning,
    setReward,
    setGameOver,
    updateGame,
    updatePlayerState,
    updatePlayerInGame,
    updateEnemyInGame,
    fetchGame,
    clearGame,
  };
});
