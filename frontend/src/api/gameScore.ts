import { apiDelete, apiGet } from './client';
import type { ApiResponse, ScoreboardRun } from '../types';

export const gameScoreApi = {
  getScoreboard: async (): Promise<ApiResponse<ScoreboardRun[]>> => {
    return apiGet<ApiResponse<ScoreboardRun[]>>('/game-scores/scoreboard');
  },
  deleteScore: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<ApiResponse<null>>(`/game-scores/${id}`);
  },
};
