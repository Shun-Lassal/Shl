import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Lobby } from '../types';
import { lobbyApi } from '../api/lobby';

export const useLobbyStore = defineStore('lobby', () => {
  const lobbies = ref<Lobby[]>([]);
  const currentLobby = ref<Lobby | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const hasLoadedLobbies = computed(() => lobbies.value.length > 0);

  const setError = (message: string | null) => {
    error.value = message;
  };

  const setCurrentLobby = (lobby: Lobby | null) => {
    currentLobby.value = lobby;
    if (lobby) {
      const index = lobbies.value.findIndex(l => l.id === lobby.id);
      if (index !== -1) {
        lobbies.value[index] = lobby;
      }
    }
  };

  const fetchLobbies = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await lobbyApi.listLobbies();
      if (response.success && response.data) {
        // Handle both array and object formats
        const data = Array.isArray(response.data) ? response.data : response.data;
        lobbies.value = data;
      } else {
        error.value = response.message || 'Failed to fetch lobbies';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching lobbies';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchLobbyById = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await lobbyApi.getLobbyById(id);
      if (response.success && response.data) {
        currentLobby.value = response.data;
        return response.data;
      } else {
        error.value = response.message || 'Failed to fetch lobby';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching lobby';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const createLobby = async (name: string, slots: number, password?: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await lobbyApi.createLobby({
        name,
        slots,
        password,
      });
      if (response.success && response.data) {
        setCurrentLobby(response.data);
        lobbies.value.push(response.data);
        return response.data;
      } else {
        error.value = response.message || 'Failed to create lobby';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating lobby';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const joinLobby = async (lobbyId: string, password?: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await lobbyApi.addPlayerToLobby(lobbyId, password);
      if (response.success && response.data) {
        setCurrentLobby(response.data);
        return response.data;
      } else {
        error.value = response.message || 'Failed to join lobby';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error joining lobby';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const leaveLobby = async (lobbyId: string, playerId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await lobbyApi.removePlayerFromLobby(lobbyId, playerId);
      if (response.success) {
        if (response.data) {
          setCurrentLobby(response.data);
        } else {
          lobbies.value = lobbies.value.filter(l => l.id !== lobbyId);
          if (currentLobby.value?.id === lobbyId) {
            currentLobby.value = null;
          }
        }
        return true;
      }

      error.value = response.message || 'Failed to leave lobby';
      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error leaving lobby';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const updateLobby = async (id: string, data: Partial<Lobby>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await lobbyApi.updateLobby(id, data);
      if (response.success && response.data) {
        setCurrentLobby(response.data);
        return response.data;
      } else {
        error.value = response.message || 'Failed to update lobby';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating lobby';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteLobby = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await lobbyApi.deleteLobby(id);
      if (response.success) {
        lobbies.value = lobbies.value.filter(l => l.id !== id);
        if (currentLobby.value?.id === id) {
          currentLobby.value = null;
        }
        return true;
      } else {
        error.value = response.message || 'Failed to delete lobby';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting lobby';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const clearCurrentLobby = () => {
    currentLobby.value = null;
  };

  return {
    lobbies,
    currentLobby,
    isLoading,
    error,
    hasLoadedLobbies,
    setError,
    setCurrentLobby,
    fetchLobbies,
    fetchLobbyById,
    createLobby,
    joinLobby,
    leaveLobby,
    updateLobby,
    deleteLobby,
    clearCurrentLobby,
  };
});
