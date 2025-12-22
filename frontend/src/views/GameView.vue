<template>
  <div class="min-h-[calc(100vh-4rem)] bg-slate-900 text-white">
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">
            {{ gameStore.currentGame ? `Étage ${gameStore.currentGame.currentFloor}` : 'Chargement…' }}
          </h1>
          <div class="text-sm text-slate-400">
            <span v-if="rewardSecondsLeft !== null">Récompense: {{ rewardSecondsLeft }}s</span>
            <span v-else-if="planningSecondsLeft !== null">Planification: {{ planningSecondsLeft }}s</span>
            <span v-else-if="currentTurnLabel">Tour: {{ currentTurnLabel }}</span>
            <span v-if="gameStore.currentGame" class="ml-3">Phase: {{ gameStore.currentGame.phase }}</span>
          </div>
        </div>
        <button
          @click="returnToLobby"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
        >
          ← Retour
        </button>
      </div>

      <div v-if="gameStore.error" class="p-3 bg-red-900 border border-red-500 rounded-lg text-red-200 text-sm">
        {{ gameStore.error }}
      </div>

      <div v-if="!gameStore.currentGame" class="text-center py-16 bg-slate-800 rounded-lg border border-slate-700">
        <div class="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        <p class="text-slate-400 mt-4">Chargement du jeu…</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Game Over -->
        <div v-if="gameStore.currentGame.phase === 'GAME_OVER'" class="space-y-4">
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div class="text-3xl font-black" :class="isVictory ? 'text-green-300' : 'text-red-300'">
              {{ isVictory ? 'Victoire' : 'Défaite' }}
            </div>
            <div class="mt-2 text-sm text-slate-300">
              Étage atteint: {{ gameStore.gameOverFinalFloor ?? gameStore.currentGame.currentFloor }}
            </div>

            <div class="mt-6">
              <div class="text-xs uppercase tracking-wide text-slate-400">Gagnants</div>
              <div class="mt-2 text-sm text-slate-200">
                <span v-if="winnerNames.length === 0">—</span>
                <span v-else>{{ winnerNames.join(', ') }}</span>
              </div>
            </div>

            <div class="mt-8 flex justify-center gap-3">
              <button
                class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
                @click="returnToLobby"
              >
                Retour aux lobbies
              </button>
            </div>
          </div>
        </div>

        <!-- Reward Phase -->
        <div v-else-if="gameStore.currentGame.phase === 'REWARD'" class="space-y-4">
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-bold">Choisissez une récompense</div>
                <div class="text-xs text-slate-400">
                  Tous les joueurs voient les mêmes 4 cartes. Sélectionnez 1 carte puis validez.
                </div>
              </div>
              <button
                class="px-4 py-2 rounded-lg text-sm font-semibold transition"
                :class="canConfirmReward ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 text-slate-400 cursor-not-allowed'"
                :disabled="!canConfirmReward || isActing"
                @click="confirmReward"
              >
                {{ isRewardConfirmed ? 'Validé' : 'Valider' }}
              </button>
            </div>
          </div>

          <div
            v-if="gameStore.rewardOptions.length === 0"
            class="text-center py-10 bg-slate-800 rounded-xl border border-slate-700"
          >
            <div class="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            <div class="text-slate-400 mt-4 text-sm">Chargement des récompenses…</div>
          </div>

          <div class="flex justify-center gap-4 flex-wrap">
            <button
              v-for="c in gameStore.rewardOptions"
              :key="c.id"
              class="w-[140px] h-[190px] rounded-xl border bg-slate-900/40 hover:border-purple-400 transition text-left p-3"
              :class="myPickedCardId === c.id ? 'ring-2 ring-purple-400 border-purple-400' : 'border-slate-600'"
              @click="selectRewardCard(c)"
              :disabled="isRewardConfirmed || isCardTakenByOther(c.id)"
            >
              <div class="flex items-start justify-between">
                <div class="text-sm font-bold">{{ rankLabel(c.rank) }}</div>
                <div class="text-lg">{{ suitIcon(c.suit) }}</div>
              </div>
              <div class="mt-8 text-center text-4xl font-black">
                {{ suitIcon(c.suit) }}
              </div>
              <div class="mt-6 text-xs text-slate-300">
                {{ rewardEffectLabel(c) }}
              </div>
            </button>
          </div>
        </div>

        <!-- Battle Phase -->
        <div v-else class="space-y-6">
        <!-- Enemies Row -->
        <div class="flex justify-center gap-6 flex-wrap">
          <div
            v-for="enemy in gameStore.currentGame.enemies"
            :key="enemy.id"
            class="w-[260px] bg-gradient-to-b from-red-950/60 to-slate-800 rounded-xl border border-red-500/40 p-4"
            :class="isEnemySelected(enemy.id) ? 'ring-2 ring-yellow-400' : ''"
            @click="toggleEnemyTarget(enemy.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-red-200">{{ enemy.type }}</div>
                <div class="text-xs text-red-200/70">HP {{ enemy.hp }}/{{ enemy.maxHp }}</div>
              </div>
              <div class="text-xs px-2 py-1 rounded-full bg-black/30 border border-white/10">
                {{ enemyIntentLabel(enemy) }}
              </div>
            </div>

            <div class="mt-3">
              <div class="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  class="h-2 bg-red-500"
                  :style="{ width: `${Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100))}%` }"
                ></div>
              </div>
            </div>

            <div class="mt-3 text-sm">
              <div class="text-slate-300">
                Intention:
                <span class="font-semibold">{{ enemy.intent.type }}</span>
                <span class="ml-1">({{ enemy.intent.value }})</span>
              </div>
              <div v-if="enemy.intent.targets?.length" class="text-slate-400 text-xs mt-1">
                Cible: {{ formatTargetNames(enemy.intent.targets) }}
              </div>
              <div v-else class="text-slate-500 text-xs mt-1">Cible: —</div>
            </div>

            <div v-if="selectedCard && needsTargets && targetMode === 'ENEMIES'" class="mt-3 text-xs text-yellow-200/90">
              Cliquez pour sélectionner ({{ selectedTargets.size }}/{{ maxTargetsForSelectedCard }})
            </div>
          </div>
        </div>

        <!-- Battlefield Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

        <!-- Players Row -->
        <div class="flex justify-center gap-6 flex-wrap">
          <div
            v-for="p in gameStore.currentGame.players"
            :key="p.id"
            class="w-[260px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-slate-600 p-4"
            :class="[
              p.userId === myUserId ? 'border-purple-500/70 shadow-lg shadow-purple-500/10' : '',
              targetMode === 'PLAYERS' && needsTargets && isPlayerTargetSelected(p.id) ? 'ring-2 ring-green-400 border-green-400/60' : '',
              targetMode === 'PLAYERS' && needsTargets && p.isAlive ? 'cursor-pointer' : '',
            ]"
            @click="targetMode === 'PLAYERS' && needsTargets && p.isAlive ? togglePlayerTarget(p.id) : undefined"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold">
                  {{ p.user?.name || shortId(p.userId) }}
                  <span v-if="p.userId === lobbyStore.currentLobby?.ownerId" class="text-xs text-yellow-300 ml-1">
                    (proprio)
                  </span>
                </div>
                <div class="text-xs text-slate-400">
                  HP {{ p.hp }}/{{ p.maxHp }}
                  <span v-if="shieldValue(p) > 0" class="ml-2 text-sky-300">Bouclier {{ shieldValue(p) }}</span>
                </div>
                <div v-if="isPlanningActive" class="mt-1 text-xs text-slate-300">
                  <span :class="isPlayerConfirmed(p.userId) ? 'text-green-300' : 'text-slate-400'">
                    {{ isPlayerConfirmed(p.userId) ? 'Validé' : 'En attente' }}
                  </span>
                  <span class="text-slate-500"> • </span>
                  <span class="text-slate-300">Action: {{ plannedActionLabelFor(p) }}</span>
                </div>
              </div>
              <div
                class="text-xs px-2 py-1 rounded-full bg-black/30 border border-white/10"
                :class="isCurrentEntity(`player-${p.userId}`) ? 'text-green-200 border-green-400/40' : 'text-slate-300'"
              >
                {{ isCurrentEntity(`player-${p.userId}`) ? 'À jouer' : '—' }}
              </div>
            </div>

            <div class="mt-3">
              <div class="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  class="h-2 bg-purple-500"
                  :style="{ width: `${Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100))}%` }"
                ></div>
              </div>
            </div>

            <div class="mt-4">
              <div class="text-xs text-slate-400 mb-2">Main</div>
              <div class="flex justify-center gap-1 flex-nowrap">
                <div
                  v-for="c in p.hand"
                  :key="c.id"
                  class="rounded-lg border transition shrink-0"
                  :class="cardMiniClass(c, p.userId === myUserId)"
                  @click="p.userId === myUserId ? selectCard(c.id) : undefined"
                >
                  <div class="px-2 py-2 w-[56px] h-[78px]">
                    <div class="flex items-start justify-between">
                      <div class="text-xs font-bold">{{ rankLabel(c.rank) }}</div>
                      <div class="text-sm">{{ suitIcon(c.suit) }}</div>
                    </div>
                    <div class="mt-5 text-center text-lg font-black">
                      {{ suitIcon(c.suit) }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="p.userId === myUserId" class="text-xs text-slate-500 mt-2 text-center">
                Cliquez une carte pour jouer
              </div>
              <div v-else class="text-xs text-slate-500 mt-2 text-center">
                Main de l’allié
              </div>
            </div>
          </div>
        </div>

        <!-- Action Panel -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
	          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
	            <div class="space-y-1">
	              <div class="text-sm text-slate-300">
	                {{ isMyTurn ? 'Planifiez votre action' : 'En attente…' }}
	              </div>
	              <div class="text-xs text-slate-500">
	                {{ selectedCard ? selectedCardLabel : 'Sélectionnez une carte, puis validez.' }}
        </div>
        </div>
      </div>

	            <div class="flex gap-2">
	              <button
	                class="px-4 py-2 rounded-lg text-sm font-semibold transition"
	                :class="canConfirm ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 text-slate-400 cursor-not-allowed'"
	                :disabled="!canConfirm || isActing"
	                @click="confirmTurn"
	              >
	                {{ isConfirmed ? 'Validé' : 'Valider' }}
	              </button>
	              <button
	                class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
	                :disabled="isActing"
	                @click="clearSelection"
              >
                Annuler
              </button>
	            </div>
	          </div>
	          <div v-if="selectedCard && needsTargets" class="mt-3 text-xs text-slate-400">
              <span v-if="targetMode === 'ENEMIES'">
                Trèfle: jusqu’à 3 cibles, Pique: 1 cible. Si vous ne sélectionnez rien, la cible sera choisie automatiquement.
              </span>
              <span v-else-if="targetMode === 'PLAYERS'">
                Ciblez un joueur (vous ou un allié). Si vous ne sélectionnez personne, l’effet s’applique sur vous.
              </span>
	          </div>
	        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLobbyStore } from '../stores/lobby';
import { useGameStore } from '../stores/game';
import { getSocket } from '../utils/socket';
import type { Card, CardSuit, EnemyState, PlayerState, PlannedAction } from '../types';

const router = useRouter();
const authStore = useAuthStore();
const lobbyStore = useLobbyStore();
const gameStore = useGameStore();

const myUserId = computed(() => authStore.user?.id || null);

const selectedCardId = ref<string | null>(null);
const selectedTargets = ref<Set<string>>(new Set());
const isActing = ref(false);
const nowMs = ref(Date.now());
let interval: number | null = null;

const currentEntityId = computed(() => {
  const g = gameStore.currentGame;
  if (!g) return null;
  return g.turnOrder[g.currentTurn] || null;
});

const isCurrentEntity = (entityId: string) => currentEntityId.value === entityId;

const isMyTurn = computed(() => {
  // Planning mode replaces strict turn order; allow actions while planning is active
  return !!myUserId.value;
});

const planningSecondsLeft = computed(() => {
  if (!gameStore.planningEndsAt) return null;
  const diff = gameStore.planningEndsAt - nowMs.value;
  return Math.max(0, Math.ceil(diff / 1000));
});

const rewardSecondsLeft = computed(() => {
  if (!gameStore.rewardEndsAt) return null;
  const diff = gameStore.rewardEndsAt - nowMs.value;
  return Math.max(0, Math.ceil(diff / 1000));
});

const isConfirmed = computed(() => {
  if (!myUserId.value) return false;
  return (gameStore.confirmedUserIds || []).includes(myUserId.value);
});

const isRewardConfirmed = computed(() => {
  if (!myUserId.value) return false;
  return (gameStore.rewardConfirmedUserIds || []).includes(myUserId.value);
});

const isVictory = computed(() => {
  if (!myUserId.value) return false;
  const winners = gameStore.gameOverWinners || [];
  return winners.includes(myUserId.value);
});

const winnerNames = computed(() => {
  const winners = gameStore.gameOverWinners || [];
  const g = gameStore.currentGame;
  if (!g || winners.length === 0) return [];
  return winners.map((id) => {
    const p = g.players.find((x) => x.userId === id);
    return p?.user?.name || shortId(id);
  });
});

const myPickedCardId = computed(() => {
  const id = myUserId.value;
  if (!id) return null;
  return gameStore.rewardPickedByUserId?.[id] || null;
});

const canConfirm = computed(() => {
  if (!myUserId.value) return false;
  if (planningSecondsLeft.value === null) return false;
  if (planningSecondsLeft.value <= 0) return false;
  if (isConfirmed.value) return false;
  return true;
});

const canConfirmReward = computed(() => {
  if (!myUserId.value) return false;
  if (rewardSecondsLeft.value === null) return false;
  if (rewardSecondsLeft.value <= 0) return false;
  if (isRewardConfirmed.value) return false;
  return !!myPickedCardId.value;
});

const currentTurnLabel = computed(() => {
  const id = currentEntityId.value;
  if (!id) return null;
  if (id.startsWith('player-')) return 'Joueur';
  if (id.startsWith('enemy-')) return 'Ennemi';
  return id;
});

const selectedCard = computed<Card | null>(() => {
  if (!selectedCardId.value || !gameStore.currentPlayer) return null;
  return gameStore.currentPlayer.hand.find(c => c.id === selectedCardId.value) || null;
});

const targetMode = computed<'NONE' | 'ENEMIES' | 'PLAYERS'>(() => {
  const c = selectedCard.value;
  if (!c) return 'NONE';
  if (c.suit === 'SPADES' || c.suit === 'CLUBS') return 'ENEMIES';
  if (c.suit === 'HEARTS' || c.suit === 'DIAMONDS') return 'PLAYERS';
  return 'NONE';
});

const maxTargetsForSelectedCard = computed(() => {
  if (!selectedCard.value) return 0;
  if (selectedCard.value.suit === 'CLUBS') return 3;
  if (selectedCard.value.suit === 'SPADES') return 1;
  if (selectedCard.value.suit === 'HEARTS') return 1;
  if (selectedCard.value.suit === 'DIAMONDS') return 1;
  return 0;
});

const needsTargets = computed(() => maxTargetsForSelectedCard.value > 0);

const isSelectionValid = computed(() => {
  if (!selectedCard.value) return true;
  if (!needsTargets.value) return true;
  return selectedTargets.value.size <= maxTargetsForSelectedCard.value;
});

const selectedCardLabel = computed(() => {
  if (!selectedCard.value) return '';
  const c = selectedCard.value;
  const effect =
    c.suit === 'HEARTS'
      ? `Soin +${c.value}`
      : c.suit === 'DIAMONDS'
        ? `Bouclier +${c.value}`
        : c.suit === 'SPADES'
          ? `Attaque ${c.value} (1 cible)`
          : c.suit === 'CLUBS'
            ? `Attaque ${c.value} (jusqu'à 3 cibles)`
            : '—';
  return `${suitIcon(c.suit)} ${rankLabel(c.rank)} • ${effect}`;
});

const shortId = (id: string) => `${id.slice(0, 6)}…`;

const rankLabel = (rank: Card['rank']) => {
  if (rank === 'A') return '1';
  if (rank === 'J') return 'V';
  if (rank === 'Q') return 'D';
  if (rank === 'K') return 'R';
  if (rank === 'JOKER') return '🃏';
  return rank;
};

const suitIcon = (suit: CardSuit) => {
  if (suit === 'HEARTS') return '♥';
  if (suit === 'DIAMONDS') return '♦';
  if (suit === 'CLUBS') return '♣';
  if (suit === 'SPADES') return '♠';
  return '🃏';
};

const rewardEffectLabel = (c: Card) => {
  if (c.suit === 'HEARTS') return `+${c.value} soin`;
  if (c.suit === 'DIAMONDS') return `+${c.value} bouclier`;
  if (c.suit === 'SPADES') return `${c.value} dégâts (1 cible)`;
  if (c.suit === 'CLUBS') return `${c.value} dégâts (jusqu'à 3 cibles)`;
  return '—';
};

const isCardTakenByOther = (cardId: string) => {
  const myId = myUserId.value;
  if (!myId) return false;
  const picks = gameStore.rewardPickedByUserId || {};
  for (const [userId, pickedId] of Object.entries(picks)) {
    if (pickedId === cardId && userId !== myId) return true;
  }
  return false;
};

const selectRewardCard = (c: Card) => {
  if (isRewardConfirmed.value) return;
  if (!gameStore.currentGame) return;
  if (isCardTakenByOther(c.id)) return;
  const socket = getSocket();
  const gameId = gameStore.currentGame.id;
  if (myPickedCardId.value === c.id) {
    socket.emit('game:reward_pick', { gameId, cardId: null });
  } else {
    socket.emit('game:reward_pick', { gameId, cardId: c.id });
  }
};

const cardMiniClass = (c: Card, isMine: boolean) => {
  if (!isMine) return 'border-slate-600 bg-slate-700/40';
  const selected = selectedCardId.value === c.id;
  const base = `border-slate-500 bg-slate-900/40 hover:border-purple-400 cursor-pointer`;
  const selectedClass = selected ? 'ring-2 ring-purple-400 border-purple-400' : '';
  return `${base} ${selectedClass}`;
};

const shieldValue = (p: PlayerState) => {
  const bonuses = Array.isArray(p.bonuses) ? p.bonuses : [];
  return bonuses
    .filter((b: any) => b?.type === 'SHIELD' && typeof b.value === 'number')
    .reduce((sum: number, b: any) => sum + (b.value as number), 0);
};

const enemyIntentLabel = (enemy: EnemyState) => {
  if (enemy.intent.type === 'ATTACK') return `ATK ${enemy.intent.value}`;
  if (enemy.intent.type === 'DEFEND') return `DEF ${enemy.intent.value}`;
  return `${enemy.intent.type} ${enemy.intent.value}`;
};

const formatTargetNames = (targets: string[]) => {
  const names = targets.map((id) => {
    const player = gameStore.currentGame?.players.find((p) => p.userId === id);
    return player?.user?.name || shortId(id);
  });
  return names.join(', ');
};

const selectCard = (cardId: string) => {
  selectedCardId.value = selectedCardId.value === cardId ? null : cardId;
  selectedTargets.value = new Set();
};

const clearSelection = () => {
  selectedCardId.value = null;
  selectedTargets.value = new Set();
};

const isEnemySelected = (enemyId: string) => selectedTargets.value.has(enemyId);

const toggleEnemyTarget = (enemyId: string) => {
  if (!selectedCard.value || !needsTargets.value) return;
  if (targetMode.value !== 'ENEMIES') return;
  if (!isMyTurn.value) return;

  const next = new Set(selectedTargets.value);
  if (next.has(enemyId)) {
    next.delete(enemyId);
  } else {
    if (next.size >= maxTargetsForSelectedCard.value) return;
    next.add(enemyId);
  }
  selectedTargets.value = next;
};

const isPlayerTargetSelected = (playerStateId: string) => selectedTargets.value.has(playerStateId);

const togglePlayerTarget = (playerStateId: string) => {
  if (!selectedCard.value || !needsTargets.value) return;
  if (targetMode.value !== 'PLAYERS') return;
  if (!isMyTurn.value) return;

  const next = new Set(selectedTargets.value);
  if (next.has(playerStateId)) {
    next.delete(playerStateId);
  } else {
    next.clear();
    next.add(playerStateId);
  }
  selectedTargets.value = next;
};

const isPlanningActive = computed(() => planningSecondsLeft.value !== null);

const isPlayerConfirmed = (userId: string) => (gameStore.confirmedUserIds || []).includes(userId);

const plannedActionFor = (userId: string): PlannedAction | null => {
  const planned = gameStore.plannedActionsByUserId || {};
  return planned[userId] || null;
};

const plannedActionLabelFor = (p: PlayerState) => {
  const action = plannedActionFor(p.userId);
  if (!action) return '—';
  if (action.type === 'END_TURN') return 'Passe';
  if (action.type !== 'PLAY_CARD') return '—';
  const card = p.hand.find((c) => c.id === action.cardId);
  const cardLabel = card ? `${suitIcon(card.suit)} ${rankLabel(card.rank)}` : 'Carte';

  if (card?.suit === 'HEARTS' || card?.suit === 'DIAMONDS') {
    const targetId = action.targetIds?.[0];
    const targetPlayer = targetId ? gameStore.currentGame?.players.find((x) => x.id === targetId) : undefined;
    const targetName = targetPlayer?.user?.name || (targetId ? shortId(targetId) : '—');
    return `${cardLabel} → ${targetId ? targetName : 'soi'}`;
  }

  if (card?.suit === 'SPADES' || card?.suit === 'CLUBS') {
    const targets = (action.targetIds ?? [])
      .map((id) => gameStore.currentGame?.enemies.find((e) => e.id === id))
      .filter(Boolean) as EnemyState[];
    const targetLabel = targets.length
      ? targets.map((e) => e.type).join(', ')
      : 'auto';
    return `${cardLabel} → ${targetLabel}`;
  }

  return cardLabel;
};

const confirmTurn = () => {
  if (!gameStore.currentGame || !myUserId.value) return;
  if (!canConfirm.value) return;
  if (!isSelectionValid.value) return;

  isActing.value = true;
  const socket = getSocket();
  const gameId = gameStore.currentGame.id;

  if (selectedCard.value) {
    const canHaveTargets = needsTargets.value;
    const targetIds = canHaveTargets && selectedTargets.value.size > 0 ? Array.from(selectedTargets.value) : undefined;

    socket.emit('game:action', {
      gameId,
      playerId: myUserId.value,
      action: {
        type: 'PLAY_CARD',
        cardId: selectedCard.value.id,
        targetIds,
      },
    });
  }

  socket.emit('game:confirm', { gameId });
  setTimeout(() => {
    isActing.value = false;
  }, 250);
};

const confirmReward = () => {
  if (!gameStore.currentGame || !myUserId.value) return;
  if (!canConfirmReward.value || !myPickedCardId.value) return;
  const socket = getSocket();
  socket.emit('game:reward_confirm', { gameId: gameStore.currentGame.id });
};

const returnToLobby = async () => {
  if (gameStore.currentGame) {
    getSocket().emit('game:leave', { gameId: gameStore.currentGame.id });
  }
  gameStore.clearGame();
  await router.push('/lobbies');
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await router.push('/login');
    return;
  }

  if (!lobbyStore.currentLobby) {
    await router.push('/lobbies');
    return;
  }

  if (!gameStore.currentGame) {
    const game = await gameStore.fetchGame(lobbyStore.currentLobby.id);
    if (game) {
      gameStore.setCurrentGame(game);
      gameStore.selectCurrentPlayer(myUserId.value);
    } else {
      await router.push(`/lobby/${lobbyStore.currentLobby.id}`);
      return;
    }
  }

  if (gameStore.currentGame) {
    getSocket().emit('game:join', { gameId: gameStore.currentGame.id });
  }

  interval = window.setInterval(() => {
    nowMs.value = Date.now();
  }, 250);
});

watch(
  () => gameStore.planningEndsAt,
  () => {
    // New round started (or synced): reset local UI state
    selectedCardId.value = null;
    selectedTargets.value = new Set();
  }
);

watch(
  () => gameStore.rewardEndsAt,
  () => {
    // no-op; selection is server-authoritative
  }
);

watch(
  () => gameStore.currentGame?.phase,
  (phase) => {
    if (phase === 'REWARD' && gameStore.currentGame && gameStore.rewardOptions.length === 0) {
      // resync reward payload (in case we missed the socket event)
      getSocket().emit('game:join', { gameId: gameStore.currentGame.id });
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (interval) {
    window.clearInterval(interval);
    interval = null;
  }
});
</script>
