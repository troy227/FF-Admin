import { ref } from 'vue';
import api from './api.js';

const EVALUATE_STORAGE_KEY = 'ff-evaluate-cache';

export const flagsByKey = ref({});

/** Route path → feature-flag key (Tab 5 /flags is not gated). */
export const pathToFlagKey = {
  '/': 'home',
  '/tab-2': 'tab-2',
  '/tab-3': 'tab-3',
  '/tab-4': 'tab-4',
};

let loadPromise = null;

function readEvaluateCache() {
  try {
    const raw = sessionStorage.getItem(EVALUATE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeEvaluateCache(map) {
  sessionStorage.setItem(EVALUATE_STORAGE_KEY, JSON.stringify(map));
}

function mapFromEvaluateItems(items) {
  const map = {};
  for (const flag of items) {
    map[flag.key] = flag.enabled;
  }
  return map;
}

export function loadFlags() {
  const cached = readEvaluateCache();
  if (cached) {
    flagsByKey.value = cached;
    return Promise.resolve(cached);
  }

  if (!loadPromise) {
    loadPromise = api.get('/ff/evaluate').then(({ data }) => {
      const map = mapFromEvaluateItems(data);
      flagsByKey.value = map;
      writeEvaluateCache(map);
      return map;
    });
  }
  return loadPromise;
}

export function refreshFlags() {
  loadPromise = null;
  sessionStorage.removeItem(EVALUATE_STORAGE_KEY);
  flagsByKey.value = {};
  return loadFlags();
}

export function isFlagEnabled(key) {
  return flagsByKey.value[key] === true || flagsByKey.value[key] === undefined;
}
