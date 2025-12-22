// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
  lobbyId?: string;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  user: User;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Lobby types
export type LobbyStatus = 'WAITING' | 'PLAYING' | 'ENDED';

export interface Lobby {
  id: string;
  status: LobbyStatus;
  name: string;
  slots: number;
  ownerId: string;
  players: User[];
  password?: string;
  gamescores: GameScore[];
  game?: Game;
  createdAt?: string;
  updatedAt?: string;
}

// Game types
export type GamePhase = 'LOBBY_WAIT' | 'BATTLE' | 'REWARD' | 'SHOP' | 'GAME_OVER';

export type CardSuit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES' | 'JOKER';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOKER';

export interface Card {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  value: number;
}

export interface PlayerState {
  id: string;
  gameId: string;
  userId: string;
  user?: User;
  hp: number;
  maxHp: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  bonuses: object[];
  isAlive: boolean;
  order: number;
}

export interface EnemyState {
  id: string;
  gameId: string;
  type: string;
  hp: number;
  maxHp: number;
  intent: {
    type: 'ATTACK' | 'DEFEND' | 'SPECIAL';
    value: number;
    targets?: string[];
  };
  order: number;
}

export interface Game {
  id: string;
  lobbyId: string;
  lobby?: Lobby;
  phase: GamePhase;
  currentFloor: number;
  seed: string;
  turnOrder: string[];
  currentTurn: number;
  players: PlayerState[];
  enemies: EnemyState[];
  createdAt: string;
  updatedAt: string;
}

export type PlannedAction =
  | { type: 'END_TURN' }
  | { type: 'PLAY_CARD'; cardId: string; targetIds?: string[] };

// GameScore types
export interface GameScore {
  id: string;
  userId: string;
  user: User;
  position: number;
  lobbyId: string;
  lobby: Lobby;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  user: User;
  sessionId: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
