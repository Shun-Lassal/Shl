<template>
  <div class="rounded-xl border px-4 py-3 text-sm" :class="[variantClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'danger';
  }>(),
  { variant: 'info' }
);

const variantClass = computed(() => {
  if (props.variant === 'success') return 'border-emerald-500/30 bg-emerald-950/40 text-emerald-100';
  if (props.variant === 'warning') return 'border-amber-500/30 bg-amber-950/40 text-amber-100';
  if (props.variant === 'danger') return 'border-red-500/30 bg-red-950/40 text-red-100';
  return 'border-slate-700 bg-slate-900/40 text-slate-200';
});
</script>

