import { BaseService } from "../../shared/base/index.ts";
import { ValidationError, NotFoundError } from "../../shared/errors.ts";
import { GameRepository } from "./game.repository.ts";
import { LobbyRepository } from "../lobby/lobby.repository.ts";
import type { Game, PlayerState, EnemyState, GameAction, Card } from "./game.model.ts";
import { GamePhase } from "@prisma/client";
import { createStandardDeck, shuffleDeck, drawCards, reshuffleDiscard } from "./cardDeck.service.ts";
import { generateEnemy, executeEnemyTurn, type EnemyType } from "./aiEngine.service.ts";
import { emitGameUpdate, emitGamePhaseChange, emitGameOver, emitTurnChange } from "./game.realtime.ts";
import { emitLobbyUpdate } from "../lobby/lobby.realtime.ts";

export class GameService extends BaseService {
  private repo: GameRepository;
  private lobbyRepo: LobbyRepository;

  constructor() {
    super();
    this.repo = new GameRepository();
    this.lobbyRepo = new LobbyRepository();
  }

  async startGame(lobbyId: string): Promise<Game> {
    // Verify lobby exists and is in WAITING state
    const lobby = await this.lobbyRepo.findById(lobbyId);
    
    if (lobby.status !== "WAITING") {
      throw new ValidationError("Lobby must be in WAITING state to start game");
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
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const deck = shuffleDeck(createStandardDeck(), `${seed}-${player.id}`);
      const { drawn: hand, remaining } = drawCards(deck, 5);

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

    // Initialize enemy
    const enemyData = generateEnemy("GOBLIN", 1);
    const enemy = await this.repo.createEnemyState({
      gameId: game.id,
      type: enemyData.type,
      hp: enemyData.hp,
      maxHp: enemyData.maxHp,
      intent: enemyData.intent,
      order: turnOrder.length,
    });

    turnOrder.push(`enemy-${enemy.id}`);

    // Update game with turn order
    const updatedGame = await this.repo.update(game.id, { turnOrder });

    // Update lobby status
    await this.lobbyRepo.update(lobbyId, { status: "PLAYING" });
    emitLobbyUpdate(lobby, { systemMessage: "Game started!" });

    emitGameUpdate(updatedGame);
    return updatedGame;
  }

  async getGame(gameId: string): Promise<Game> {
    return this.repo.findById(gameId);
  }

  async executeAction(action: GameAction): Promise<Game> {
    const game = await this.repo.findById(action.gameId);

    if (game.phase !== GamePhase.BATTLE) {
      throw new ValidationError("Can only execute actions during battle phase");
    }

    const currentEntity = game.turnOrder[game.currentTurn];

    // Validate it's the player's turn
    if (currentEntity !== `player-${action.playerId}`) {
      throw new ValidationError("Not your turn");
    }

    const player = game.players.find((p) => p.userId === action.playerId);
    if (!player) {
      throw new NotFoundError("Player not found in game");
    }

    if (!player.isAlive) {
      throw new ValidationError("Player is dead");
    }

    if (action.action.type === "PLAY_CARD") {
      await this.playCard(game, player, action.action.cardId, action.action.targetId);
    }

    // Advance turn
    await this.advanceTurn(game);

    const updatedGame = await this.repo.findById(game.id);
    emitGameUpdate(updatedGame);
    return updatedGame;
  }

  private async playCard(game: Game, player: PlayerState, cardId: string, targetId?: string): Promise<void> {
    const cardIndex = player.hand.findIndex((c: Card) => c.id === cardId);
    if (cardIndex === -1) {
      throw new NotFoundError("Card not found in hand");
    }

    const card = player.hand[cardIndex];
    const newHand = player.hand.filter((_: any, i: number) => i !== cardIndex);
    const newDiscard = [...player.discard, card];

    // Simple card logic: all cards deal damage equal to their value
    let target: EnemyState | PlayerState | undefined;

    if (targetId) {
      if (targetId.startsWith("enemy-")) {
        const enemyId = targetId.replace("enemy-", "");
        target = game.enemies.find((e) => e.id === enemyId);
      } else if (targetId.startsWith("player-")) {
        const playerId = targetId.replace("player-", "");
        target = game.players.find((p) => p.userId === playerId);
      }
    } else {
      // Default: target first alive enemy
      target = game.enemies.find((e) => e.hp > 0);
    }

    if (!target) {
      throw new NotFoundError("Target not found");
    }

    // Apply damage
    const newHp = Math.max(0, target.hp - card.value);
    
    if ("userId" in target) {
      // Target is player
      await this.repo.updatePlayerState(target.id, {
        hp: newHp,
        isAlive: newHp > 0,
      });
    } else {
      // Target is enemy
      await this.repo.updateEnemyState(target.id, { hp: newHp });
    }

    // Update player hand/discard
    await this.repo.updatePlayerState(player.id, {
      hand: newHand,
      discard: newDiscard,
    });

    // Draw a new card
    await this.drawCard(player);
  }

  private async drawCard(player: PlayerState): Promise<void> {
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

      await this.repo.updatePlayerState(player.id, {
        deck: remaining,
        hand: newHand,
        discard,
      });
    }
  }

  private async advanceTurn(game: Game): Promise<void> {
    // Check battle end conditions
    const allEnemiesDead = game.enemies.every((e) => e.hp <= 0);
    const allPlayersDead = game.players.every((p) => !p.isAlive);

    if (allEnemiesDead) {
      await this.transitionToReward(game);
      return;
    }

    if (allPlayersDead) {
      await this.transitionToGameOver(game, false);
      return;
    }

    // Advance to next turn
    let nextTurn = (game.currentTurn + 1) % game.turnOrder.length;
    
    // Skip dead entities
    let attempts = 0;
    while (attempts < game.turnOrder.length) {
      const entityId = game.turnOrder[nextTurn];
      
      if (entityId.startsWith("player-")) {
        const playerId = entityId.replace("player-", "");
        const player = game.players.find((p) => p.userId === playerId);
        if (player && player.isAlive) {
          break;
        }
      } else if (entityId.startsWith("enemy-")) {
        const enemyId = entityId.replace("enemy-", "");
        const enemy = game.enemies.find((e) => e.id === enemyId);
        if (enemy && enemy.hp > 0) {
          break;
        }
      }
      
      nextTurn = (nextTurn + 1) % game.turnOrder.length;
      attempts++;
    }

    await this.repo.update(game.id, { currentTurn: nextTurn });

    // If it's an enemy turn, execute AI action
    const currentEntity = game.turnOrder[nextTurn];
    if (currentEntity.startsWith("enemy-")) {
      await this.executeEnemyAction(game, currentEntity.replace("enemy-", ""));
    }

    emitTurnChange(game.id, currentEntity, nextTurn);
  }

  private async executeEnemyAction(game: Game, enemyId: string): Promise<void> {
    const enemy = game.enemies.find((e) => e.id === enemyId);
    if (!enemy || enemy.hp <= 0) return;

    const { action, value, newIntent } = executeEnemyTurn(enemy);

    if (action === "ATTACK") {
      // Attack random alive player
      const alivePlayers = game.players.filter((p) => p.isAlive);
      if (alivePlayers.length > 0) {
        const targetPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const newHp = Math.max(0, targetPlayer.hp - value);

        await this.repo.updatePlayerState(targetPlayer.id, {
          hp: newHp,
          isAlive: newHp > 0,
        });
      }
    }

    // Update enemy intent
    await this.repo.updateEnemyState(enemy.id, { intent: newIntent });

    // Continue advancing turn after enemy action
    const updatedGame = await this.repo.findById(game.id);
    await this.advanceTurn(updatedGame);
  }

  private async transitionToReward(game: Game): Promise<void> {
    await this.repo.update(game.id, { phase: GamePhase.REWARD });
    emitGamePhaseChange(game, "REWARD");
  }

  private async transitionToGameOver(game: Game, victory: boolean): Promise<void> {
    await this.repo.update(game.id, { phase: GamePhase.GAME_OVER });
    
    const winners = victory
      ? game.players.filter((p) => p.isAlive).map((p) => p.userId)
      : [];

    // Update lobby status
    await this.lobbyRepo.update(game.lobbyId, { status: "ENDED" });

    emitGameOver(game.id, winners, game.currentFloor);
  }
}
