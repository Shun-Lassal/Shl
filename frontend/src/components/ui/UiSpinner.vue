<template>
  <span
    class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
    :class="sizeClass"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md' }
);

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-3.5 w-3.5';
  if (props.size === 'lg') return 'h-5 w-5';
  return 'h-4 w-4';
});
</script>

