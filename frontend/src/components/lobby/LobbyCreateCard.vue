<template>
  <UiCard padding="lg">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-lg font-bold text-white">Créer un lobby</div>
        <div class="mt-1 text-sm text-slate-400">
          Configurez la partie puis invitez vos amis.
        </div>
      </div>
      <UiBadge variant="primary">Nouveau</UiBadge>
    </div>

    <form class="mt-6 space-y-5" @submit.prevent="$emit('submit')">
      <UiInput
        v-model="form.name"
        label="Nom du lobby"
        placeholder="Mon run coop"
        :disabled="disabled"
        required
      />

      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-200" for="slots">
          Nombre de joueurs
        </label>
        <select
          id="slots"
          class="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
          :disabled="disabled"
          v-model.number="form.slots"
        >
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
        </select>
        <div class="text-sm text-slate-400">De 1 à 4 joueurs.</div>
      </div>

      <UiInput
        v-model="form.password"
        label="Mot de passe (optionnel)"
        type="password"
        autocomplete="off"
        placeholder="Laissez vide pour public"
        :disabled="disabled"
      />

      <UiAlert v-if="error" variant="danger">
        {{ error }}
      </UiAlert>

      <div class="flex gap-2">
        <UiButton class="flex-1" type="submit" :loading="disabled">
          Créer
        </UiButton>
        <UiButton class="flex-1" variant="secondary" type="button" :disabled="disabled" @click="$emit('cancel')">
          Annuler
        </UiButton>
      </div>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import UiAlert from '../ui/UiAlert.vue';
import UiBadge from '../ui/UiBadge.vue';
import UiButton from '../ui/UiButton.vue';
import UiCard from '../ui/UiCard.vue';
import UiInput from '../ui/UiInput.vue';

defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

defineProps<{
  form: { name: string; slots: number; password: string };
  disabled: boolean;
  error: string | null;
}>();
</script>
