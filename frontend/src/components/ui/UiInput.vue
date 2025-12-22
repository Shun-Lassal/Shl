<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-slate-200" :for="inputId">
      {{ label }}
    </label>
    <input
      :id="inputId"
      class="w-full rounded-xl border bg-slate-950/40 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
      :class="error ? 'border-red-500/50 focus:ring-red-400/60' : 'border-slate-800 focus:border-purple-400/60'"
      :type="type"
      :name="name"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <div v-if="error" class="text-sm text-red-200">
      {{ error }}
    </div>
    <div v-else-if="hint" class="text-sm text-slate-400">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    label?: string;
    hint?: string;
    error?: string | null;
    type?: string;
    name?: string;
    autocomplete?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
  }>(),
  {
    id: undefined,
    label: undefined,
    hint: undefined,
    error: null,
    type: 'text',
    name: undefined,
    autocomplete: undefined,
    placeholder: undefined,
    disabled: false,
    required: false,
  }
);

const internalId = `ui-input-${Math.random().toString(36).slice(2)}`;
const inputId = computed(() => props.id || props.name || internalId);
</script>

