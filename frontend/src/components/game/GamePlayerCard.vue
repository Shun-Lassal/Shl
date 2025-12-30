<template>
  <div
    class="w-full min-w-[220px] flex-shrink-0 rounded-2xl border bg-gradient-to-b from-slate-900/70 to-slate-950/30 p-3 md:p-4 transition"
    :class="[
      isMe ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-800',
      canTarget ? 'cursor-pointer hover:border-emerald-400/60' : '',
      isTargetSelected ? 'ring-2 ring-emerald-400/80 border-emerald-400/60' : '',
    ]"
    @click="canTarget ? $emit('target') : undefined"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="truncate text-base md:text-lg font-bold text-white">
          {{ name }}
          <span v-if="isOwner" class="ml-1 text-xs font-semibold text-amber-200">(proprio)</span>
        </div>
        <div class="text-[11px] md:text-xs text-slate-400">
          HP {{ player.hp }}/{{ player.maxHp }}
          <span v-if="shield > 0" class="ml-2 text-sky-300">Bouclier {{ shield }}</span>
        </div>
        <div v-if="planningActive" class="mt-1 text-[11px] md:text-xs text-slate-300">
          <span :class="confirmed ? 'text-emerald-300' : 'text-slate-400'">
            {{ confirmed ? 'Validé' : 'En attente' }}
          </span>
          <span class="text-slate-500"> • </span>
          <span class="text-slate-300">Action: {{ plannedActionLabel || '—' }}</span>
        </div>
      </div>

      <UiBadge :variant="isCurrent ? 'success' : 'neutral'">
        {{ isCurrent ? 'À jouer' : '—' }}
      </UiBadge>
    </div>

    <div class="mt-3">
      <div class="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div class="h-2 bg-purple-500" :style="{ width: hpPercent }"></div>
      </div>
    </div>

    <div class="mt-4">
      <div class="flex items-center justify-between">
        <div class="text-xs font-semibold text-slate-400">Main</div>
        <UiBadge v-if="!isMe" variant="neutral">Allié</UiBadge>
      </div>
      <div class="mt-2">
        <GameHand
          :cards="player.hand"
          :selected-card-id="isMe ? selectedCardId : null"
          :interactive="isMe"
          @select="$emit('selectCard', $event)"
        />
      </div>
      <div v-if="isMe" class="mt-2 text-center text-xs text-slate-500">
        Cliquez une carte pour jouer
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlayerState } from '@/types';
import UiBadge from '../ui/UiBadge.vue';
import GameHand from './GameHand.vue';

defineEmits<{
  (e: 'selectCard', cardId: string): void;
  (e: 'target'): void;
}>();

const props = withDefaults(
  defineProps<{
    player: PlayerState;
    name: string;
    isMe?: boolean;
    isOwner?: boolean;
    isCurrent?: boolean;
    planningActive?: boolean;
    confirmed?: boolean;
    plannedActionLabel?: string | null;
    selectedCardId?: string | null;
    canTarget?: boolean;
    isTargetSelected?: boolean;
  }>(),
  {
    isMe: false,
    isOwner: false,
    isCurrent: false,
    planningActive: false,
    confirmed: false,
    plannedActionLabel: null,
    selectedCardId: null,
    canTarget: false,
    isTargetSelected: false,
  }
);

const hpPercent = computed(() => {
  const pct = props.player.maxHp > 0 ? (props.player.hp / props.player.maxHp) * 100 : 0;
  const clamped = Math.max(0, Math.min(100, pct));
  return `${clamped}%`;
});

const shield = computed(() => {
  const bonuses = Array.isArray(props.player.bonuses) ? props.player.bonuses : [];
  return bonuses
    .filter((b: any) => b?.type === 'SHIELD' && typeof b.value === 'number')
    .reduce((sum: number, b: any) => sum + (b.value as number), 0);
});
</script>
