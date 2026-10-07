<script setup>
import { computed, onMounted, ref, reactive } from 'vue';
import api from '../services/api.js';

const flags = ref([]);
const draftEnabled = reactive({});
const loading = ref(true);
const error = ref('');

function syncDraftEnabled(data) {
  for (const flag of data) {
    draftEnabled[flag.id] = flag.enabled;
  }
}

const hasUnsavedChanges = computed(() =>
  flags.value.some((flag) => draftEnabled[flag.id] !== flag.enabled),
);

function formatUserIds(userIds) {
  if (userIds == null || userIds.length === 0) {
    return 'All';
  }
  return userIds.join(', ');
}

async function loadFlags() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/ff');
    flags.value = data;
    syncDraftEnabled(data);
  } catch {
    error.value = 'Failed to load feature flags.';
  } finally {
    loading.value = false;
  }
}

async function saveAllFlags() {
  const changed = flags.value.filter(
    (flag) => draftEnabled[flag.id] !== flag.enabled,
  );
  if (changed.length === 0) {
    return;
  }

  try {
    await Promise.all(
      changed.map(async (flag) => {
        const enabled = draftEnabled[flag.id];
        const { data } = await api.patch(`/ff/${flag.id}`, { enabled });
        flag.enabled = data.enabled;
        draftEnabled[flag.id] = data.enabled;
      }),
    );
  } catch {
    error.value = 'Failed to update feature flags.';
  }
}
const newFlag = reactive({
  key: '',
  userIds: [],
  enabled: false,
});

async function handleCreateFlag() {
  try {
    const { data } = await api.post('/ff', newFlag);
    flags.value.push(data);
    draftEnabled[data.id] = data.enabled;
  } catch {
    error.value = 'Failed to create feature flag.';
  }
}

onMounted(loadFlags);
</script>

<template>
  <main class="content">
    <h1>Feature flags</h1>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <table v-else class="flags-table">
      <thead>
        <tr>
          <th>Key</th>
          <th>User IDs</th>
          <th>Enabled</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="flags.length === 0">
          <td colspan="3">No feature flags yet.</td>
        </tr>
        <tr v-for="flag in flags" :key="flag.id">
          <td>{{ flag.key }}</td>
          <td>{{ formatUserIds(flag.userIds) }}</td>
          <td>
            <label class="toggle">
              <input v-model="draftEnabled[flag.id]" type="checkbox" />
              <span>{{ draftEnabled[flag.id] ? 'On' : 'Off' }}</span>
            </label>
          </td>
        </tr>
      </tbody>
    </table>
    <form @submit="saveAllFlags">
        <button
      v-if="!loading && !error"
      type="submit"
      class="save-button"
      :disabled="!hasUnsavedChanges"
    >
      Save
    </button>
    </form>
    <h1>Create a Flag</h1>
    <form class="create-form" @submit="handleCreateFlag">
      <div>
        <label for="key">Key</label>
        <input type="text" id="key" v-model="newFlag.key" />
      </div>
      <div>
        <label for="userIds">User IDs</label>
        <input type="text" id="userIds" v-model="newFlag.userIds" />
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

.flags-table {
  width: 100%;
  max-width: 720px;
  border-collapse: collapse;
}

.flags-table th,
.flags-table td {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.flags-table th {
  background: #f5f5f5;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.save-button {
  margin-top: 0.75rem;
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

.create-form button {
  margin-top: 0.25rem;
}
</style>
