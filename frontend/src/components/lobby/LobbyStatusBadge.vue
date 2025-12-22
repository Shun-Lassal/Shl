<template>
  <UiBadge :variant="variant">
    {{ label }}
  </UiBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiBadge from '../ui/UiBadge.vue';
import type { LobbyStatus } from '@/types';

const props = defineProps<{
  status: LobbyStatus;
}>();

const label = computed(() => {
  if (props.status === 'WAITING') return 'En attente';
  if (props.status === 'PLAYING') return 'En cours';
  return 'Terminé';
});

const variant = computed(() => {
  if (props.status === 'WAITING') return 'success' as const;
  if (props.status === 'PLAYING') return 'primary' as const;
  return 'neutral' as const;
});
</script>

