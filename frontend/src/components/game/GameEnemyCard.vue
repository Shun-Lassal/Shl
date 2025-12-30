<template>
  <div
    class="w-full min-w-[180px] flex-shrink-0 rounded-2xl border bg-gradient-to-b from-red-950/50 to-slate-900/60 p-3 md:p-4 transition"
    :class="[
      selected ? 'ring-2 ring-yellow-400/90 border-yellow-400/40' : 'border-red-500/30',
      selectable ? 'cursor-pointer hover:border-red-400/60' : 'cursor-default',
    ]"
    @click="selectable ? $emit('toggle') : undefined"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="text-base md:text-lg font-bold text-red-200">{{ enemy.type }}</div>
        <div class="text-[11px] md:text-xs text-red-200/70">HP {{ enemy.hp }}/{{ enemy.maxHp }}</div>
      </div>
      <UiBadge variant="danger">{{ intentShort }}</UiBadge>
    </div>

    <div class="mt-3">
      <div class="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div class="h-2 bg-red-500" :style="{ width: hpPercent }"></div>
      </div>
    </div>

    <div class="mt-3 text-sm">
      <div class="text-slate-300">
        Intention:
        <span class="font-semibold">{{ enemy.intent.type }}</span>
        <span class="ml-1">({{ enemy.intent.value }})</span>
      </div>
      <div v-if="targetLabel" class="text-slate-400 text-xs mt-1">Cible: {{ targetLabel }}</div>
      <div v-else class="text-slate-500 text-xs mt-1">Cible: —</div>
    </div>

    <div v-if="showSelectionHint" class="mt-3 text-xs text-yellow-200/90">
      Cliquez pour sélectionner
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EnemyState } from '@/types';
import UiBadge from '../ui/UiBadge.vue';

defineEmits<{
  (e: 'toggle'): void;
}>();

const props = withDefaults(
  defineProps<{
    enemy: EnemyState;
    selected?: boolean;
    selectable?: boolean;
    targetLabel?: string | null;
    showSelectionHint?: boolean;
  }>(),
  { selected: false, selectable: false, targetLabel: null, showSelectionHint: false }
);

const hpPercent = computed(() => {
  const pct = props.enemy.maxHp > 0 ? (props.enemy.hp / props.enemy.maxHp) * 100 : 0;
  const clamped = Math.max(0, Math.min(100, pct));
  return `${clamped}%`;
});

const intentShort = computed(() => {
  if (props.enemy.intent.type === 'ATTACK') return `ATK ${props.enemy.intent.value}`;
  if (props.enemy.intent.type === 'DEFEND') return `DEF ${props.enemy.intent.value}`;
  return `${props.enemy.intent.type} ${props.enemy.intent.value}`;
});
</script>
