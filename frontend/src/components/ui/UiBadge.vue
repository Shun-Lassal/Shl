<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold"
    :class="variantClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
  }>(),
  { variant: 'neutral' }
);

const variantClass = computed(() => {
  if (props.variant === 'primary') return 'border-purple-500/30 bg-purple-500/10 text-purple-200';
  if (props.variant === 'success') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (props.variant === 'danger') return 'border-red-500/30 bg-red-500/10 text-red-200';
  if (props.variant === 'warning') return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
  return 'border-slate-700 bg-slate-900/40 text-slate-200';
});
</script>

