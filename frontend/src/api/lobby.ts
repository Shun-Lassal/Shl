import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from './client';
import type { Lobby, User, ApiResponse } from '../types';

export const lobbyApi = {
  // Get all lobbies
  listLobbies: async (): Promise<ApiResponse<Lobby[]>> => {
    return apiGet<ApiResponse<Lobby[]>>('/lobbies');
  },

  // Get lobby by ID
  getLobbyById: async (id: string): Promise<ApiResponse<Lobby>> => {
    return apiGet<ApiResponse<Lobby>>(`/lobbies/${id}`);
  },

  // Create a new lobby
  createLobby: async (data: {
    name: string;
    slots: number;
    password?: string;
  }): Promise<ApiResponse<Lobby>> => {
    return apiPost<ApiResponse<Lobby>>('/lobbies', data);
  },

  // Update lobby
  updateLobby: async (
    id: string,
    data: Partial<Lobby>
  ): Promise<ApiResponse<Lobby>> => {
    return apiPatch<ApiResponse<Lobby>>(`/lobbies/${id}`, data);
  },

  // Add player to lobby
  addPlayerToLobby: async (
    id: string,
    password?: string
  ): Promise<ApiResponse<Lobby>> => {
    return apiPost<ApiResponse<Lobby>>(`/lobbies/${id}/players`, { password });
  },

  // Remove player from lobby
  removePlayerFromLobby: async (
    id: string,
    playerId: string
  ): Promise<ApiResponse<Lobby>> => {
    return apiDelete<ApiResponse<Lobby>>(`/lobbies/${id}/players/${playerId}`);
  },

  // Set players in lobby (update multiple)
  setLobbyPlayers: async (
    id: string,
    players: User[]
  ): Promise<ApiResponse<Lobby>> => {
    return apiPut<ApiResponse<Lobby>>(`/lobbies/${id}/players`, { players });
  },

  // Delete lobby
  deleteLobby: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/lobbies/${id}`);
  },
};
