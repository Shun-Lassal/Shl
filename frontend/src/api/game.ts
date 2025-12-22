import { apiGet } from './client';
import type { Game, ApiResponse } from '../types';

export const gameApi = {
  // Get game by lobby ID
  getGameByLobby: async (lobbyId: string): Promise<ApiResponse<{ game: Game }>> => {
    return apiGet<ApiResponse<{ game: Game }>>(`/games/${lobbyId}`);
  },

  // The actual game logic is managed via Socket.IO events
  // See game.socket.ts for real-time game interactions
};
