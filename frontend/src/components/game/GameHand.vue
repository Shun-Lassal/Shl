<template>
  <div class="grid grid-cols-4 gap-1">
    <button
      v-for="c in cards"
      :key="c.id"
      type="button"
      class="group relative aspect-[2/3] w-full rounded-lg border bg-slate-950/40 p-2 text-left transition"
      :class="[
        interactive ? 'hover:border-purple-400/70 hover:bg-slate-900/60' : 'cursor-default',
        selectedCardId === c.id ? 'ring-2 ring-purple-400/80 border-purple-400/70' : 'border-slate-800',
      ]"
      :disabled="!interactive"
      @click="interactive ? $emit('select', c.id) : undefined"
    >
      <div class="flex items-start justify-between">
        <div class="text-xs font-black" :class="rankColor(c.suit)">{{ rankLabel(c.rank) }}</div>
        <div class="text-sm" :class="suitColor(c.suit)">{{ suitIcon(c.suit) }}</div>
      </div>
      <div class="mt-5 text-center text-xl font-black" :class="suitColor(c.suit)">
        {{ suitIcon(c.suit) }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Card, CardSuit } from '@/types';

defineEmits<{
  (e: 'select', cardId: string): void;
}>();

const props = withDefaults(
  defineProps<{
    cards: Card[];
    selectedCardId?: string | null;
    interactive?: boolean;
  }>(),
  { selectedCardId: null, interactive: false }
);

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

const suitColor = (suit: CardSuit) => {
  if (suit === 'HEARTS' || suit === 'DIAMONDS') return 'text-rose-300';
  if (suit === 'CLUBS' || suit === 'SPADES') return 'text-slate-100';
  return 'text-slate-300';
};

const rankColor = (suit: CardSuit) => suitColor(suit);
</script>

