<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import api from '../services/api.js';
import {
  mergeFlags,
  readAdminCache,
  writeAdminCache,
} from '../services/flagAdminCache.js';
import { refreshFlags } from '../services/flags.js';

const WINDOW_SIZE = 5;
const ROW_HEIGHT = 41;

const cachedFlags = ref([]);
const nextCursor = ref(null);
const apiSearch = ref('');
const localSearch = ref('');
const windowStart = ref(0);
const scrollContainer = ref(null);
const draftEnabled = reactive({});
const loading = ref(true);
const loadingMore = ref(false);
const error = ref('');
const isSyncingScroll = ref(false);

function syncDraftEnabled(flags) {
  for (const flag of flags) {
    draftEnabled[flag.id] = flag.enabled;
  }
}

function persistCache() {
  writeAdminCache({
    flags: cachedFlags.value,
    nextCursor: nextCursor.value,
    apiSearch: apiSearch.value,
    windowStart: windowStart.value,
  });
}

const filteredFlags = computed(() => {
  const query = localSearch.value.trim().toLowerCase();
  if (!query) {
    return cachedFlags.value;
  }
  return cachedFlags.value.filter((flag) =>
    flag.key.toLowerCase().includes(query),
  );
});

const maxWindowStart = computed(() =>
  Math.max(0, filteredFlags.value.length - WINDOW_SIZE),
);

const visibleFlags = computed(() =>
  filteredFlags.value.slice(
    windowStart.value,
    windowStart.value + WINDOW_SIZE,
  ),
);

const spacerHeight = computed(() => {
  const count = filteredFlags.value.length;
  const base = Math.max(count, WINDOW_SIZE) * ROW_HEIGHT;
  const canLoadMore =
    nextCursor.value != null && !localSearch.value.trim();

  if (canLoadMore) {
    return base + WINDOW_SIZE * ROW_HEIGHT;
  }

  if (count > WINDOW_SIZE) {
    return base;
  }

  return WINDOW_SIZE * ROW_HEIGHT + 1;
});

const hasUnsavedChanges = computed(() =>
  cachedFlags.value.some((flag) => draftEnabled[flag.id] !== flag.enabled),
);

function formatUserIds(userIds) {
  if (userIds == null || userIds.length === 0) {
    return 'All';
  }
  return userIds.join(', ');
}

async function fetchPage({ cursor, search, replace }) {
  const params = { limit: WINDOW_SIZE };
  if (cursor != null) {
    params.cursor = cursor;
  }
  if (search?.trim()) {
    params.search = search.trim();
  }

  const { data } = await api.get('/ff', { params });
  if (replace) {
    cachedFlags.value = data.items;
    windowStart.value = 0;
  } else {
    cachedFlags.value = mergeFlags(cachedFlags.value, data.items);
  }
  nextCursor.value = data.nextCursor;
  syncDraftEnabled(data.items);
  persistCache();
}

async function resetScrollPosition() {
  await nextTick();
  const el = scrollContainer.value;
  if (el) {
    isSyncingScroll.value = true;
    el.scrollTop = windowStart.value * ROW_HEIGHT;
    isSyncingScroll.value = false;
  }
}

async function loadInitial() {
  loading.value = true;
  error.value = '';
  try {
    const cached = readAdminCache();
    if (cached?.flags?.length) {
      cachedFlags.value = cached.flags;
      nextCursor.value = cached.nextCursor ?? null;
      apiSearch.value = cached.apiSearch ?? '';
      windowStart.value = cached.windowStart ?? 0;
      syncDraftEnabled(cached.flags);
      await resetScrollPosition();
      return;
    }
    await fetchPage({ replace: true });
    await resetScrollPosition();
  } catch {
    error.value = 'Failed to load feature flags.';
  } finally {
    loading.value = false;
  }
}

async function loadMoreFromApi() {
  if (nextCursor.value == null || loadingMore.value || localSearch.value.trim()) {
    return;
  }
  loadingMore.value = true;
  try {
    await fetchPage({
      cursor: nextCursor.value,
      search: apiSearch.value,
      replace: false,
    });
  } catch {
    error.value = 'Failed to load more feature flags.';
  } finally {
    loadingMore.value = false;
  }
}

async function runApiSearch() {
  loading.value = true;
  error.value = '';
  try {
    apiSearch.value = localSearch.value.trim();
    await fetchPage({ search: apiSearch.value, replace: true });
    await resetScrollPosition();
  } catch {
    error.value = 'Failed to search feature flags.';
  } finally {
    loading.value = false;
  }
}

function applyWindowFromScrollTop(scrollTop) {
  const nextStart = Math.min(
    Math.floor(scrollTop / ROW_HEIGHT),
    maxWindowStart.value,
  );

  if (nextStart !== windowStart.value) {
    windowStart.value = nextStart;
    persistCache();
  }
}

function onListScroll() {
  const el = scrollContainer.value;
  if (!el || isSyncingScroll.value) {
    return;
  }

  applyWindowFromScrollTop(el.scrollTop);

  if (!localSearch.value.trim()) {
    const nearBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - ROW_HEIGHT;
    if (nearBottom) {
      loadMoreFromApi();
    }
  }
}

function onWheel(event) {
  const el = scrollContainer.value;
  if (!el || isSyncingScroll.value) {
    return;
  }

  if (el.scrollHeight > el.clientHeight + 1) {
    return;
  }

  if (event.deltaY > 0) {
    if (windowStart.value < maxWindowStart.value) {
      windowStart.value += 1;
      persistCache();
      event.preventDefault();
      return;
    }
    if (nextCursor.value != null && !localSearch.value.trim()) {
      loadMoreFromApi();
      event.preventDefault();
    }
    return;
  }

  if (event.deltaY < 0 && windowStart.value > 0) {
    windowStart.value -= 1;
    persistCache();
    event.preventDefault();
  }
}

watch(localSearch, async () => {
  windowStart.value = 0;
  await resetScrollPosition();
});

async function saveAllFlags(event) {
  event.preventDefault();
  const changed = cachedFlags.value.filter(
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
    persistCache();
    await refreshFlags();
  } catch {
    error.value = 'Failed to update feature flags.';
  }
}

onMounted(loadInitial);
</script>

<template>
  <main class="content">
    <h1>Feature flags</h1>

    <div class="search-row">
      <input
        v-model="localSearch"
        type="search"
        placeholder="Filter loaded flags (local)"
      />
      <button type="button" @click="runApiSearch">Search API</button>
    </div>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <div class="table-shell">
        <table class="flags-table flags-table-head">
          <thead>
            <tr>
              <th>Key</th>
              <th>User IDs</th>
              <th>Enabled</th>
            </tr>
          </thead>
        </table>

        <div
          ref="scrollContainer"
          class="scroll-window"
          @scroll="onListScroll"
          @wheel="onWheel"
        >
          <div class="scroll-spacer" :style="{ height: `${spacerHeight}px` }">
            <table
              class="flags-table flags-table-body"
              :style="{ top: `${windowStart * ROW_HEIGHT}px` }"
            >
              <tbody>
                <tr v-if="visibleFlags.length === 0">
                  <td colspan="3">No feature flags in this view.</td>
                </tr>
                <tr v-for="flag in visibleFlags" :key="flag.id">
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
          </div>
        </div>
      </div>

      <p class="scroll-hint">
        Showing {{ visibleFlags.length }} of {{ filteredFlags.length }} loaded
        (rows {{ windowStart + 1 }}–{{
          windowStart + visibleFlags.length
        }}).
        <span v-if="loadingMore"> Loading more…</span>
      </p>

      <form @submit="saveAllFlags">
        <button type="submit" class="save-button" :disabled="!hasUnsavedChanges">
          Save
        </button>
      </form>
    </template>
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

.search-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-width: 720px;
}

.search-row input {
  flex: 1;
  padding: 0.35rem 0.5rem;
}

.table-shell {
  max-width: 720px;
  border: 1px solid #ddd;
}

.flags-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.flags-table-head th {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
  background: #f5f5f5;
}

.scroll-window {
  height: 205px;
  overflow-y: auto;
  overflow-x: hidden;
}

.scroll-spacer {
  position: relative;
}

.flags-table-body {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.flags-table-body td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
  height: 40px;
  box-sizing: border-box;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.scroll-hint {
  font-size: 0.85rem;
  color: #555;
  margin: 0.5rem 0;
}

.save-button {
  margin-top: 0.25rem;
}
</style>
