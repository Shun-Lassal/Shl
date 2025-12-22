<template>
  <div
    class="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/20 backdrop-blur"
    :class="paddingClass"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    padding?: 'none' | 'sm' | 'md' | 'lg';
  }>(),
  { padding: 'md' }
);

const paddingClass = computed(() => {
  if (props.padding === 'none') return '';
  if (props.padding === 'sm') return 'p-4';
  if (props.padding === 'lg') return 'p-8';
  return 'p-6';
});
</script>

