<template>
  <UiCard padding="md" class="relative">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="truncate text-lg font-bold text-white">
          {{ lobby.name }}
        </div>
        <div class="mt-1 text-xs text-slate-400">
          {{ playersCountLabel }}
          <span v-if="isProtected" class="ml-2">
            <UiBadge variant="warning">Protégé</UiBadge>
          </span>
        </div>
      </div>
      <LobbyStatusBadge :status="lobby.status" />
    </div>

    <div class="mt-4">
      <div class="text-xs font-semibold text-slate-400">Joueurs</div>
      <div class="mt-2 flex flex-wrap gap-2">
        <UiBadge v-for="p in lobby.players" :key="p.id" variant="neutral">
          {{ p.name }}
        </UiBadge>
        <div v-if="!lobby.players || lobby.players.length === 0" class="text-xs text-slate-500">
          Aucun joueur
        </div>
      </div>
    </div>

    <div v-if="needsPassword && passwordPromptOpen" class="mt-4">
      <UiInput
        v-model="password"
        label="Mot de passe"
        type="password"
        autocomplete="off"
        placeholder="Entrez le mot de passe"
        :disabled="disabled"
      />
    </div>

    <div class="mt-5 flex gap-2">
      <UiButton
        class="flex-1"
        :disabled="disabled || !canJoin"
        @click="onJoinClick"
      >
        {{ lobby.status === 'PLAYING' ? 'Rejoindre la partie' : 'Rejoindre' }}
      </UiButton>
      <UiButton class="flex-1" variant="secondary" :disabled="disabled" @click="$emit('view')">
        Détails
      </UiButton>
    </div>

    <div v-if="!canJoin" class="mt-3 text-xs text-slate-500">
      Non disponible
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Lobby } from '@/types';
import UiBadge from '../ui/UiBadge.vue';
import UiButton from '../ui/UiButton.vue';
import UiCard from '../ui/UiCard.vue';
import UiInput from '../ui/UiInput.vue';
import LobbyStatusBadge from './LobbyStatusBadge.vue';

const emit = defineEmits<{
  (e: 'join', payload: { lobbyId: string; password?: string }): void;
  (e: 'view'): void;
}>();

const props = withDefaults(
  defineProps<{
    lobby: Lobby;
    currentUserId: string | null;
    disabled?: boolean;
    canJoin: boolean;
  }>(),
  { disabled: false }
);

const isProtected = computed(() => !!props.lobby.password);

const alreadyInLobby = computed(() => {
  const userId = props.currentUserId;
  if (!userId) return false;
  return (props.lobby.players ?? []).some((p) => p.id === userId);
});

const needsPassword = computed(() => {
  // In PLAYING we never prompt (rejoin is validated server-side).
  if (props.lobby.status === 'PLAYING') return false;
  if (!isProtected.value) return false;
  return !alreadyInLobby.value;
});

const passwordPromptOpen = ref(false);
const password = ref('');

const playersCountLabel = computed(() => `${props.lobby.players?.length || 0}/${props.lobby.slots} joueurs`);

const onJoinClick = () => {
  if (!props.canJoin) return;
  if (needsPassword.value && !passwordPromptOpen.value) {
    passwordPromptOpen.value = true;
    return;
  }
  if (needsPassword.value && !password.value) return;
  emit('join', { lobbyId: props.lobby.id, password: password.value || undefined });
};
</script>

