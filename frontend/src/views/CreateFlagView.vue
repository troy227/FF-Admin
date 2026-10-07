<script setup>
import { reactive, ref } from 'vue';
import api from '../services/api.js';
import { clearAdminCache } from '../services/flagAdminCache.js';
import { refreshFlags } from '../services/flags.js';

const error = ref('');
const newFlag = reactive({
  key: '',
  userIds: '',
});

function parseUserIds(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

function resetForm() {
  newFlag.key = '';
  newFlag.userIds = '';
}

async function handleCreateFlag() {
  error.value = '';
  try {
    await api.post('/ff', {
      key: newFlag.key.trim(),
      userIds: parseUserIds(newFlag.userIds),
      enabled: false,
    });
    clearAdminCache();
    await refreshFlags();
    resetForm();
  } catch {
    error.value = 'Failed to create feature flag.';
  }
}
</script>

<template>
  <main class="content">
    <h1>Create a flag</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <form class="create-form" @submit.prevent="handleCreateFlag">
      <div>
        <label for="key">Key</label>
        <input id="key" v-model="newFlag.key" type="text" required />
      </div>
      <div>
        <label for="userIds">User IDs</label>
        <input
          id="userIds"
          v-model="newFlag.userIds"
          type="text"
          placeholder="Comma separated (empty = all)"
        />
      </div>
      <button type="submit">Create</button>
    </form>
  </main>
</template>

<style scoped>
.content {
  padding: 1.5rem 1rem;
}

h1 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.error {
  color: #b00020;
}

.create-form div {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.create-form label {
  min-width: 5rem;
}
</style>
