import { BaseService } from "../../shared/base/index.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../../shared/errors.js";
import { GameRepository } from "./game.repository.js";
import { LobbyRepository } from "../lobby/lobby.repository.js";
import type { Game, PlayerState, EnemyState, GameAction, Card } from "./game.model.js";
import { GamePhase } from "@prisma/client";
import { createStarterDeck, shuffleDeck, drawCards, reshuffleDiscard } from "./cardDeck.service.js";
import { generateEnemy, executeEnemyTurn, type EnemyType } from "./aiEngine.service.js";
import { emitGameUpdate, emitGamePhaseChange, emitGameOver, emitGamePlanning, emitGameReward } from "./game.realtime.js";
import { emitLobbyUpdate } from "../lobby/lobby.realtime.js";
import { randomUUID } from "node:crypto";
import { GameScoreService } from "../gameScore/gameScore.service.js";

type PlannedAction = GameAction["action"];
type PlanningState = {
  endsAt: number;
  plannedByUserId: Map<string, PlannedAction>;
  confirmedUserIds: Set<string>;
  resolving: boolean;
  timeout: NodeJS.Timeout | null;
};

type RewardState = {
  endsAt: number;
  options: Card[];
  pickedCardIdByUserId: Map<string, string>;
  confirmedUserIds: Set<string>;
  resolving: boolean;
  timeout: NodeJS.Timeout | null;
};

export class GameService extends BaseService {
  private repo: GameRepository;
  private lobbyRepo: LobbyRepository;
  private gameScoreService: GameScoreService;
  private static planningByGameId = new Map<string, PlanningState>();
  private static rewardByGameId = new Map<string, RewardState>();

  constructor() {
    super();
    this.repo = new GameRepository();
    this.lobbyRepo = new LobbyRepository();
    this.gameScoreService = new GameScoreService();
  }

  private computeEnemyCount(floor: number, alivePlayerCount: number): number {
    const baseCount = Math.min(1 + Math.floor((floor - 1) / 2), 4);
    // Scale enemy count with players; tuned so 2 players don't spike too hard around floor 4.
    const playerFactor = Math.max(0.6, alivePlayerCount / 3);
    return Math.max(1, Math.min(4, Math.round(baseCount * playerFactor)));
  }

  private selectEnemyTypes(floor: number, enemyCount: number): EnemyType[] {
    const tiers: EnemyType[] = ["GOBLIN", "ORC", "TROLL"];
    const maxTier = Math.min(tiers.length - 1, Math.floor((floor - 1) / 3));
    const allowedTypes = tiers.slice(0, maxTier + 1);
    if (allowedTypes.length === 0) return [];
    if (allowedTypes.length === 1) {
      return Array(enemyCount).fill(allowedTypes[0]);
    }

    // Bias towards stronger enemies on higher floors but keep variety.
    const weights = allowedTypes.map((_, idx) => 1 + idx * Math.max(1, floor / 6));
    const picks: EnemyType[] = [];

    // Ensure at least one highest-tier enemy when unlocked.
    if (enemyCount > 0) {
      picks.push(allowedTypes[allowedTypes.length - 1]);
    }
    // Encourage mixes by also forcing a secondary type when possible.
    if (enemyCount > 1 && allowedTypes.length >= 2) {
      picks.push(allowedTypes[Math.max(allowedTypes.length - 2, 0)]);
    }

    while (picks.length < enemyCount) {
      picks.push(this.weightedEnemyPick(allowedTypes, weights));
    }

    return picks.slice(0, enemyCount);
  }

  private weightedEnemyPick(types: EnemyType[], weights: number[]): EnemyType {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < types.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        return types[i];
      }
    }
    return types[types.length - 1];
  }

  async startPlanningRound(gameId: string, durationMs: number = 20000): Promise<void> {
    const game = await this.repo.findById(gameId);
    if (game.phase !== GamePhase.BATTLE) return;

    const state: PlanningState = {
      endsAt: Date.now() + durationMs,
      plannedByUserId: new Map(),
      confirmedUserIds: new Set(),
      resolving: false,
      timeout: null,
    };

    const existing = GameService.planningByGameId.get(gameId);
    if (existing?.timeout) {
      clearTimeout(existing.timeout);
    }

    state.timeout = setTimeout(() => {
      this.resolvePlanningRound(gameId).catch(() => {});
    }, durationMs);

    GameService.planningByGameId.set(gameId, state);

    await this.ensureEnemyTargets(gameId);
    emitGamePlanning(gameId, { endsAt: state.endsAt, confirmedUserIds: [], plannedActionsByUserId: {} });
  }

  getPlanningState(gameId: string): { endsAt: number; confirmedUserIds: string[]; plannedActionsByUserId: Record<string, PlannedAction> } | null {
    const state = GameService.planningByGameId.get(gameId);
    if (!state) return null;
    return {
      endsAt: state.endsAt,
      confirmedUserIds: Array.from(state.confirmedUserIds),
      plannedActionsByUserId: Object.fromEntries(state.plannedByUserId.entries()),
    };
  }

  submitPlannedAction(gameId: string, userId: string, action: PlannedAction): void {
    const state = GameService.planningByGameId.get(gameId);
    if (!state) {
      throw new ValidationError("Planning round not started");
    }
    if (Date.now() > state.endsAt) {
      throw new ValidationError("Planning window closed");
    }
    if (state.confirmedUserIds.has(userId)) {
      throw new ValidationError("Action already confirmed");
    }

    state.plannedByUserId.set(userId, action);
    emitGamePlanning(gameId, {
      endsAt: state.endsAt,
      confirmedUserIds: Array.from(state.confirmedUserIds),
      plannedActionsByUserId: Object.fromEntries(state.plannedByUserId.entries()),
    });
  }

  confirmPlannedAction(gameId: string, userId: string): void {
    const state = GameService.planningByGameId.get(gameId);
    if (!state) {
      throw new ValidationError("Planning round not started");
    }
    if (Date.now() > state.endsAt) {
      return;
    }
    state.confirmedUserIds.add(userId);
    emitGamePlanning(gameId, {
      endsAt: state.endsAt,
      confirmedUserIds: Array.from(state.confirmedUserIds),
      plannedActionsByUserId: Object.fromEntries(state.plannedByUserId.entries()),
    });
    void this.maybeResolveEarly(gameId);
  }

  private async maybeResolveEarly(gameId: string): Promise<void> {
    const game = await this.repo.findById(gameId);
    const state = GameService.planningByGameId.get(gameId);
    if (!state) return;

    const aliveUserIds = game.players.filter((p) => p.isAlive).map((p) => p.userId);
    const allConfirmed = aliveUserIds.every((id) => state.confirmedUserIds.has(id));
    if (!allConfirmed) return;

    if (state.timeout) {
      clearTimeout(state.timeout);
      state.timeout = null;
    }
    await this.resolvePlanningRound(gameId);
  }

  private async ensureEnemyTargets(gameId: string): Promise<void> {
    const game = await this.repo.findById(gameId);
    const alivePlayerIds = game.players.filter((p) => p.isAlive).map((p) => p.userId);
    if (!alivePlayerIds.length) return;

    for (const enemy of game.enemies) {
      if (enemy.hp <= 0) continue;
      if (enemy.intent?.type === "ATTACK" && (!enemy.intent.targets || !enemy.intent.targets.length)) {
        const target = alivePlayerIds[Math.floor(Math.random() * alivePlayerIds.length)];
        await this.repo.updateEnemyState(enemy.id, { intent: { ...enemy.intent, targets: [target] } });
      }
    }

    const updated = await this.repo.findById(gameId);
    emitGameUpdate(updated);
  }

  private async resolvePlanningRound(gameId: string): Promise<void> {
    const state = GameService.planningByGameId.get(gameId);
    if (!state) return;
    if (state.resolving) return;
    state.resolving = true;

    try {
      const game = await this.repo.findById(gameId);
      if (game.phase !== GamePhase.BATTLE) return;

      const alivePlayers = game.players.filter((p) => p.isAlive).sort((a, b) => a.order - b.order);

      // Auto-validate: any missing confirmation becomes confirmed (with existing plan or no-op)
      for (const p of alivePlayers) {
        if (!state.confirmedUserIds.has(p.userId)) {
          state.confirmedUserIds.add(p.userId);
        }
      }
      emitGamePlanning(gameId, {
        endsAt: state.endsAt,
        confirmedUserIds: Array.from(state.confirmedUserIds),
        plannedActionsByUserId: Object.fromEntries(state.plannedByUserId.entries()),
      });

      // Apply all planned actions (sequentially, but submitted concurrently)
      for (const p of alivePlayers) {
        const planned = state.plannedByUserId.get(p.userId);
        if (!planned || planned.type === "END_TURN") continue;
        if (planned.type === "PLAY_CARD") {
          await this.applyPlayerCard(gameId, p.userId, planned.cardId, planned.targetIds);
        }
      }

      // Enemies act once
      const afterPlayers = await this.repo.findById(gameId);
      for (const enemy of afterPlayers.enemies) {
        if (enemy.hp <= 0) continue;
        await this.applyEnemyIntent(gameId, enemy.id);
      }

      const updated = await this.repo.findById(gameId);

      // End conditions
      const allEnemiesDead = updated.enemies.every((e) => e.hp <= 0);
      const allPlayersDead = updated.players.every((p) => !p.isAlive);
      if (allEnemiesDead) {
        const MAX_FLOOR = 50;
        if (updated.currentFloor >= MAX_FLOOR) {
          await this.transitionToGameOver(updated, true);
        } else {
          await this.transitionToReward(updated);
        }
        GameService.planningByGameId.delete(gameId);
        return;
      }
      if (allPlayersDead) {
        await this.transitionToGameOver(updated, false);
        GameService.planningByGameId.delete(gameId);
        return;
      }

      // End of round: discard full hands and redraw fresh hands
      await this.discardHandsAndRedraw(gameId, 4);

      // Start next round
      await this.startPlanningRound(gameId);
    } finally {
      const current = GameService.planningByGameId.get(gameId);
      if (current) current.resolving = false;
    }
  }

  async startRewardPhase(gameId: string, durationMs: number = 20000): Promise<void> {
    const game = await this.repo.findById(gameId);
    if (game.phase !== GamePhase.REWARD) return;

    const state: RewardState = {
      endsAt: Date.now() + durationMs,
      options: this.generateRewardOptions(game.seed, game.currentFloor),
      pickedCardIdByUserId: new Map(),
      confirmedUserIds: new Set(),
      resolving: false,
      timeout: null,
    };

    const existing = GameService.rewardByGameId.get(gameId);
    if (existing?.timeout) clearTimeout(existing.timeout);

    state.timeout = setTimeout(() => {
      this.resolveRewardPhase(gameId).catch(() => {});
    }, durationMs);

    GameService.rewardByGameId.set(gameId, state);
    emitGameUpdate(game);
    emitGameReward(gameId, { endsAt: state.endsAt, confirmedUserIds: [], options: state.options, pickedByUserId: {} });
  }

  getRewardState(
    gameId: string
  ): { endsAt: number; confirmedUserIds: string[]; options: Card[]; pickedByUserId: Record<string, string> } | null {
    const state = GameService.rewardByGameId.get(gameId);
    if (!state) return null;
    return {
      endsAt: state.endsAt,
      confirmedUserIds: Array.from(state.confirmedUserIds),
      options: state.options,
      pickedByUserId: Object.fromEntries(state.pickedCardIdByUserId),
    };
  }

  pickReward(gameId: string, userId: string, cardId?: string | null): void {
    const state = GameService.rewardByGameId.get(gameId);
    if (!state) throw new ValidationError("Reward phase not started");
    if (Date.now() > state.endsAt) throw new ValidationError("Reward window closed");
    if (state.confirmedUserIds.has(userId)) throw new ValidationError("Reward already confirmed");

    // Un-pick (free the card for someone else)
    if (!cardId) {
      state.pickedCardIdByUserId.delete(userId);
      emitGameReward(gameId, {
        endsAt: state.endsAt,
        confirmedUserIds: Array.from(state.confirmedUserIds),
        options: state.options,
        pickedByUserId: Object.fromEntries(state.pickedCardIdByUserId),
      });
      return;
    }

    if (!state.options.some((c) => c.id === cardId)) throw new ValidationError("Invalid reward card");

    // First-come-first-served: a card can only be reserved by one player at a time
    for (const [otherUserId, otherCardId] of state.pickedCardIdByUserId.entries()) {
      if (otherCardId === cardId && otherUserId !== userId) {
        throw new ValidationError("This reward card is already taken");
      }
    }

    state.pickedCardIdByUserId.set(userId, cardId);
    emitGameReward(gameId, {
      endsAt: state.endsAt,
      confirmedUserIds: Array.from(state.confirmedUserIds),
      options: state.options,
      pickedByUserId: Object.fromEntries(state.pickedCardIdByUserId),
    });
  }

  confirmReward(gameId: string, userId: string): void {
    const state = GameService.rewardByGameId.get(gameId);
    if (!state) throw new ValidationError("Reward phase not started");
    if (Date.now() > state.endsAt) return;

    state.confirmedUserIds.add(userId);
    emitGameReward(gameId, {
      endsAt: state.endsAt,
      confirmedUserIds: Array.from(state.confirmedUserIds),
      options: state.options,
      pickedByUserId: Object.fromEntries(state.pickedCardIdByUserId),
    });
    void this.maybeResolveRewardEarly(gameId);
  }

  private async maybeResolveRewardEarly(gameId: string): Promise<void> {
    const game = await this.repo.findById(gameId);
    const state = GameService.rewardByGameId.get(gameId);
    if (!state) return;

    const aliveUserIds = game.players.filter((p) => p.isAlive).map((p) => p.userId);
    const allConfirmed = aliveUserIds.every((id) => state.confirmedUserIds.has(id));
    if (!allConfirmed) return;

    if (state.timeout) {
      clearTimeout(state.timeout);
      state.timeout = null;
    }
    await this.resolveRewardPhase(gameId);
  }

  private async resolveRewardPhase(gameId: string): Promise<void> {
    const state = GameService.rewardByGameId.get(gameId);
    if (!state) return;
    if (state.resolving) return;
    state.resolving = true;

    try {
      const game = await this.repo.findById(gameId);
      if (game.phase !== GamePhase.REWARD) return;

      const alivePlayers = game.players.filter((p) => p.isAlive);
      if (!alivePlayers.length) return;

      // Auto-pick: first-come-first-served, choose among remaining cards only
      const orderedPlayers = [...alivePlayers].sort((a, b) => a.order - b.order);
      const taken = new Set<string>(Array.from(state.pickedCardIdByUserId.values()));
      for (const p of orderedPlayers) {
        if (!state.pickedCardIdByUserId.has(p.userId)) {
          const available = state.options.filter((c) => !taken.has(c.id));
          if (available.length > 0) {
            const r = this.seededRandom(`${game.seed}-${game.currentFloor}-${p.userId}`);
            const pick = available[Math.floor(r * available.length)];
            state.pickedCardIdByUserId.set(p.userId, pick.id);
            taken.add(pick.id);
          }
        }
        state.confirmedUserIds.add(p.userId);
      }

      // Apply rewards: add chosen card to player's deck (as a new instance id)
      for (const p of alivePlayers) {
        const pickedId = state.pickedCardIdByUserId.get(p.userId);
        if (!pickedId) continue;
        const picked = state.options.find((c) => c.id === pickedId);
        if (!picked) continue;
        const newDeck = [...p.deck, { ...picked, id: randomUUID() }];
        await this.repo.updatePlayerState(p.id, { deck: newDeck });
      }

      GameService.rewardByGameId.delete(gameId);

      await this.advanceToNextFloor(gameId);
    } finally {
      const current = GameService.rewardByGameId.get(gameId);
      if (current) current.resolving = false;
    }
  }

  private async advanceToNextFloor(gameId: string): Promise<void> {
    const game = await this.repo.findById(gameId);
    const nextFloor = game.currentFloor + 1;

    // End-of-floor recovery: restore half of max HP (alive players only)
    for (const p of game.players) {
      if (!p.isAlive) continue;
      const healAmount = Math.floor(p.maxHp / 2);
      const healed = Math.min(p.maxHp, p.hp + healAmount);
      if (healed !== p.hp) {
        await this.repo.updatePlayerState(p.id, { hp: healed });
      }
    }

    await this.repo.deleteEnemiesByGameId(gameId);

    // Create new enemies and intents for the next floor
    const alivePlayerIds = game.players.filter((p) => p.isAlive).map((p) => p.userId);
    const enemyCount = this.computeEnemyCount(nextFloor, alivePlayerIds.length);
    const enemyTypes = this.selectEnemyTypes(nextFloor, enemyCount);

    const newTurnOrder: string[] = [];
    for (const p of game.players) {
      if (p.isAlive) newTurnOrder.push(`player-${p.userId}`);
    }

    for (let i = 0; i < enemyCount; i++) {
      const type = enemyTypes[i] ?? enemyTypes[enemyTypes.length - 1];
      const enemyData = generateEnemy(type, nextFloor);
      const target = alivePlayerIds.length ? alivePlayerIds[Math.floor(Math.random() * alivePlayerIds.length)] : undefined;
      enemyData.intent = {
        ...enemyData.intent,
        targets: enemyData.intent.type === "ATTACK" && target ? [target] : enemyData.intent.targets,
      };

      const enemy = await this.repo.createEnemyState({
        gameId,
        type: enemyData.type,
        hp: enemyData.hp,
        maxHp: enemyData.maxHp,
        intent: enemyData.intent,
        order: newTurnOrder.length,
      });

      newTurnOrder.push(`enemy-${enemy.id}`);
    }

    await this.repo.update(gameId, { currentFloor: nextFloor, phase: GamePhase.BATTLE, turnOrder: newTurnOrder, currentTurn: 0 });

    // Refill hands up to max (4)
    const refreshed = await this.repo.findById(gameId);
    for (const p of refreshed.players) {
      if (!p.isAlive) continue;
      while (p.hand.length < 4) {
        await this.drawCard(p, 4);
        const again = await this.repo.findById(gameId);
        const updatedP = again.players.find((x) => x.id === p.id);
        if (!updatedP) break;
        p.hand = updatedP.hand;
        p.deck = updatedP.deck;
        p.discard = updatedP.discard;
      }
    }

    const updated = await this.repo.findById(gameId);
    emitGameUpdate(updated);
    await this.startPlanningRound(gameId);
  }

  async startGame(lobbyId: string, requestedByUserId: string): Promise<Game> {
    // Verify lobby exists and is in WAITING state
    const lobby = await this.lobbyRepo.findById(lobbyId);
    
    if (lobby.status !== "WAITING") {
      throw new ValidationError("Lobby must be in WAITING state to start game");
    }

    if (lobby.ownerId !== requestedByUserId) {
      throw new ForbiddenError("Only the lobby owner can start the game");
    }

    // Check if game already exists
    const existingGame = await this.repo.findByLobbyId(lobbyId);
    if (existingGame) {
      throw new ValidationError("Game already exists for this lobby");
    }

    const players = (lobby as any).players || [];
    if (players.length === 0) {
      throw new ValidationError("Lobby must have at least one player");
    }

    // Generate game seed
    const seed = `${lobbyId}-${Date.now()}`;

    // Create game
    const game = await this.repo.create({
      lobbyId,
      phase: GamePhase.BATTLE,
      currentFloor: 1,
      seed,
      turnOrder: [],
    });

    // Initialize player states
    const turnOrder: string[] = [];
    const MAX_HAND_SIZE = 4;
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const deck = shuffleDeck(createStarterDeck(), `${seed}-${player.id}`);
      const { drawn: hand, remaining } = drawCards(deck, MAX_HAND_SIZE);

      await this.repo.createPlayerState({
        gameId: game.id,
        userId: player.id,
        hp: 50,
        maxHp: 50,
        deck: remaining,
        hand,
        discard: [],
        bonuses: [],
        order: i,
      });

      turnOrder.push(`player-${player.id}`);
    }

    // Initialize enemies (scaled by floor)
    const floor = 1;
    const alivePlayerIds = players.map((p: any) => p.id);
    const enemyCount = this.computeEnemyCount(floor, alivePlayerIds.length);
    const enemyTypes = this.selectEnemyTypes(floor, enemyCount);

    for (let i = 0; i < enemyCount; i++) {
      const type = enemyTypes[i] ?? enemyTypes[enemyTypes.length - 1];
      const enemyData = generateEnemy(type, floor);
      // Ensure enemy intention includes current targets (for UI)
      enemyData.intent = {
        ...enemyData.intent,
        targets: enemyData.intent.targets?.length ? enemyData.intent.targets : [alivePlayerIds[0]],
      };

      const enemy = await this.repo.createEnemyState({
        gameId: game.id,
        type: enemyData.type,
        hp: enemyData.hp,
        maxHp: enemyData.maxHp,
        intent: enemyData.intent,
        order: turnOrder.length,
      });

      turnOrder.push(`enemy-${enemy.id}`);
    }

    // Update game with turn order
    const updatedGame = await this.repo.update(game.id, { turnOrder });

    // Update lobby status
    const updatedLobby = await this.lobbyRepo.update(lobbyId, { status: "PLAYING" });
    emitLobbyUpdate(updatedLobby, { systemMessage: "Game started!" });

    emitGameUpdate(updatedGame);
    return updatedGame;
  }

  async getGame(gameId: string): Promise<Game> {
    return this.repo.findById(gameId);
  }

  async getGameByLobbyId(lobbyId: string): Promise<Game> {
    const game = await this.repo.findByLobbyId(lobbyId);
    if (!game) {
      throw new NotFoundError("Game not found for lobby");
    }
    return game;
  }

  // Kept for potential legacy mode; current gameplay uses planning rounds + resolve.

  private async applyPlayerCard(gameId: string, userId: string, cardId: string, targetIds?: string[]): Promise<void> {
    const game = await this.repo.findById(gameId);
    if (game.phase !== GamePhase.BATTLE) return;
    const player = game.players.find((p) => p.userId === userId);
    if (!player || !player.isAlive) return;
    await this.playCard(gameId, game, player, cardId, targetIds);
    emitGameUpdate(await this.repo.findById(gameId));
  }

  private async playCard(gameId: string, game: Game, player: PlayerState, cardId: string, targetIds?: string[]): Promise<void> {
    const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
    if (cardIndex === -1) {
      throw new NotFoundError("Card not found in hand");
    }

    const card = player.hand[cardIndex];
    const newHand = player.hand.filter((_: any, i: number) => i !== cardIndex);
    const newDiscard = [...player.discard, card];

    // Apply card effect by suit
    if (card.suit === "HEARTS") {
      const fresh = await this.repo.findById(gameId);
      const alivePlayers = fresh.players.filter((p) => p.isAlive);
      const requested = Array.from(new Set((targetIds ?? []).filter(Boolean))).slice(0, 1);
      const requestedTarget = requested.length ? alivePlayers.find((p) => p.id === requested[0]) : undefined;
      const target = requestedTarget ?? alivePlayers.find((p) => p.id === player.id) ?? player;
      const healed = Math.min(target.maxHp, target.hp + card.value);
      await this.repo.updatePlayerState(target.id, { hp: healed });
    } else if (card.suit === "DIAMONDS") {
      const fresh = await this.repo.findById(gameId);
      const alivePlayers = fresh.players.filter((p) => p.isAlive);
      const requested = Array.from(new Set((targetIds ?? []).filter(Boolean))).slice(0, 1);
      const requestedTarget = requested.length ? alivePlayers.find((p) => p.id === requested[0]) : undefined;
      const target = requestedTarget ?? alivePlayers.find((p) => p.id === player.id) ?? player;

      const bonuses = Array.isArray(target.bonuses) ? [...target.bonuses] : [];
      bonuses.push({ type: "SHIELD", value: card.value });
      await this.repo.updatePlayerState(target.id, { bonuses });
    } else if (card.suit === "SPADES" || card.suit === "CLUBS") {
      const fresh = await this.repo.findById(gameId);
      const aliveEnemies = fresh.enemies.filter((e) => e.hp > 0);
      if (aliveEnemies.length === 0) {
        // Multiplayer/planning rounds: another player's action may have killed the last enemy earlier in the same resolve.
        // In that case, this attack simply fizzles (but the card is still consumed).
        await this.repo.updatePlayerState(player.id, {
          hand: newHand,
          discard: newDiscard,
        });
        return;
      }

      const maxTargets = card.suit === "CLUBS" ? 3 : 1;
      const requested = (targetIds ?? []).filter(Boolean);
      const uniqueRequested = Array.from(new Set(requested)).slice(0, maxTargets);

      const targets: EnemyState[] = [];
      for (const id of uniqueRequested) {
        const enemy = aliveEnemies.find((e) => e.id === id);
        if (enemy) targets.push(enemy);
      }

      if (targets.length === 0) {
        targets.push(...aliveEnemies.slice(0, maxTargets));
      }

      const damagePerTarget = card.suit === "SPADES" ? card.value * 2 : card.value;

      for (const target of targets) {
        const current = await this.repo.findEnemyStateById(target.id);
        const newHp = Math.max(0, current.hp - damagePerTarget);
        await this.repo.updateEnemyState(target.id, { hp: newHp });
      }
    } else {
      throw new ValidationError("Unsupported card");
    }

    // Update player hand/discard
    await this.repo.updatePlayerState(player.id, {
      hand: newHand,
      discard: newDiscard,
    });
  }

  private async drawCard(player: PlayerState, maxHandSize: number): Promise<void> {
    if (player.hand.length >= maxHandSize) return;

    let deck = player.deck;
    let discard = player.discard;

    if (deck.length === 0) {
      // Reshuffle discard into deck
      deck = reshuffleDiscard(discard, `${player.gameId}-reshuffle-${Date.now()}`);
      discard = [];
    }

    if (deck.length > 0) {
      const { drawn, remaining } = drawCards(deck, 1);
      const newHand = [...player.hand, ...drawn];
      if (newHand.length > maxHandSize) {
        return;
      }

      await this.repo.updatePlayerState(player.id, {
        deck: remaining,
        hand: newHand,
        discard,
      });
    }
  }

  private async applyEnemyIntent(gameId: string, enemyId: string): Promise<void> {
    // Always load fresh state to avoid executing intents for enemies killed earlier in the resolve.
    const currentEnemy = await this.repo.findEnemyStateById(enemyId);
    if (!currentEnemy || currentEnemy.hp <= 0) return;

    const game = await this.repo.findById(gameId);
    const enemy = game.enemies.find((e) => e.id === enemyId);
    if (!enemy || enemy.hp <= 0) return;

    const { action, value, targets, newIntent } = executeEnemyTurn(enemy);

    if (action === "DEFEND") {
      const healed = Math.min(enemy.maxHp, enemy.hp + value);
      await this.repo.updateEnemyState(enemy.id, { hp: healed });
    } else {
      const alivePlayers = game.players.filter((p) => p.isAlive);
      if (alivePlayers.length === 0) return;

      const targetUserId =
        targets?.length && alivePlayers.some((p) => p.userId === targets[0])
          ? targets[0]
          : alivePlayers[Math.floor(Math.random() * alivePlayers.length)].userId;

      const targetPlayer = alivePlayers.find((p) => p.userId === targetUserId) ?? alivePlayers[0];

      const bonuses = Array.isArray(targetPlayer.bonuses) ? [...targetPlayer.bonuses] : [];

      let remainingDamage = value;
      const newBonuses = bonuses
        .map((b: any) => {
          if (b?.type !== "SHIELD" || typeof b.value !== "number" || b.value <= 0) return b;
          const absorbed = Math.min(b.value, remainingDamage);
          remainingDamage -= absorbed;
          const leftover = b.value - absorbed;
          if (leftover > 0) return { ...b, value: leftover };
          return null;
        })
        .filter((b: any) => b !== null);

      const damage = Math.max(0, remainingDamage);
      const newHp = Math.max(0, targetPlayer.hp - damage);

      await this.repo.updatePlayerState(targetPlayer.id, {
        hp: newHp,
        isAlive: newHp > 0,
        bonuses: newBonuses,
      });
    }

    const refreshed = await this.repo.findById(gameId);
    const alivePlayerIds = refreshed.players.filter((p) => p.isAlive).map((p) => p.userId);
    const nextTarget = alivePlayerIds.length
      ? alivePlayerIds[Math.floor(Math.random() * alivePlayerIds.length)]
      : undefined;

    await this.repo.updateEnemyState(enemy.id, {
      intent: {
        ...newIntent,
        targets: newIntent.type === "ATTACK" && nextTarget ? [nextTarget] : undefined,
      },
    });
  }

  private async transitionToReward(game: Game): Promise<void> {
    await this.repo.update(game.id, { phase: GamePhase.REWARD });
    const updated = await this.repo.findById(game.id);
    emitGamePhaseChange(updated, "REWARD");
    emitGameUpdate(updated);
    await this.startRewardPhase(game.id);
  }

  private async transitionToGameOver(game: Game, victory: boolean): Promise<void> {
    await this.repo.update(game.id, { phase: GamePhase.GAME_OVER });
    
    const winners = victory
      ? game.players.filter((p) => p.isAlive).map((p) => p.userId)
      : [];

    // Update lobby status
    await this.lobbyRepo.update(game.lobbyId, { status: "ENDED" });

    const position = victory ? -1 : game.currentFloor;
    for (const p of game.players) {
      await this.gameScoreService.upsertGameScore({
        userId: p.userId,
        lobbyId: game.lobbyId,
        position,
      });
    }

    emitGameOver(game.id, winners, game.currentFloor);
  }

  private async discardHandsAndRedraw(gameId: string, handSize: number): Promise<void> {
    const game = await this.repo.findById(gameId);
    if (game.phase !== GamePhase.BATTLE) return;

    for (const p of game.players) {
      if (!p.isAlive) continue;
      const discard = [...p.discard, ...p.hand];
      let deck = p.deck;
      let newDiscard = discard;
      const newHand: Card[] = [];

      while (newHand.length < handSize) {
        if (deck.length === 0) {
          deck = reshuffleDiscard(newDiscard, `${gameId}-reshuffle-${Date.now()}-${p.userId}`);
          newDiscard = [];
        }
        if (deck.length === 0) break;
        const { drawn, remaining } = drawCards(deck, 1);
        if (drawn.length === 0) break;
        newHand.push(...drawn);
        deck = remaining;
      }

      await this.repo.updatePlayerState(p.id, {
        hand: newHand,
        deck,
        discard: newDiscard,
      });
    }

    emitGameUpdate(await this.repo.findById(gameId));
  }

  private generateRewardOptions(seed: string, floor: number): Card[] {
    const suits: Card["suit"][] = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
    const ranks: Card["rank"][] = ["A", "2", "3", "4", "5"];
    const all: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        const value = rank === "A" ? 1 : parseInt(rank);
        all.push({ id: randomUUID(), suit, rank, value });
      }
    }
    const shuffled = shuffleDeck(all, `${seed}-reward-${floor}`);
    return shuffled.slice(0, 4);
  }

  private seededRandom(seed: string): number {
    // Mulberry32-ish from hashed seed
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (h << 5) - h + seed.charCodeAt(i);
      h |= 0;
    }
    let t = (h + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
