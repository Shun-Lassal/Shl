import { apiGet } from './client';
import type { GameScore, ApiResponse } from '../types';

export const gameScoreApi = {
  // Get all game scores
  listGameScores: async (): Promise<ApiResponse<{ gameScores: GameScore[] }>> => {
    return apiGet<ApiResponse<{ gameScores: GameScore[] }>>('/game-scores');
  },

  // Get leaderboard
  getLeaderboard: async (): Promise<ApiResponse<{ leaderboard: GameScore[] }>> => {
    return apiGet<ApiResponse<{ leaderboard: GameScore[] }>>('/game-scores/leaderboard');
  },
};
