<template>
  <component
    :is="to ? RouterLink : 'button'"
    v-bind="to ? { to } : undefined"
    :type="to ? undefined : type"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[sizeClass, variantClass]"
    :disabled="to ? undefined : isDisabled"
  >
    <UiSpinner v-if="loading" size="sm" />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, type RouteLocationRaw } from 'vue-router';
import UiSpinner from './UiSpinner.vue';

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
  }
);

const isDisabled = computed(() => props.disabled || props.loading);

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'px-3 py-2 text-sm';
  if (props.size === 'lg') return 'px-5 py-3 text-sm';
  return 'px-4 py-2 text-sm';
});

const variantClass = computed(() => {
  if (props.variant === 'secondary') {
    return 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/80';
  }
  if (props.variant === 'ghost') {
    return 'bg-transparent hover:bg-slate-800/70 text-slate-200 border border-transparent';
  }
  if (props.variant === 'danger') {
    return 'bg-red-600 hover:bg-red-500 text-white';
  }
  return 'bg-purple-600 hover:bg-purple-500 text-white';
});
</script>

