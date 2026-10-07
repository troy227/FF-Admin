import { ref } from 'vue';
import api from './api.js';

export const flagsByKey = ref({});

/** Route path → feature-flag key (Tab 5 /flags is not gated). */
export const pathToFlagKey = {
  '/': 'home',
  '/tab-2': 'tab-2',
  '/tab-3': 'tab-3',
  '/tab-4': 'tab-4',
};

let loadPromise = null;

export function loadFlags() {
  if (!loadPromise) {
    loadPromise = api.get('/ff').then(({ data }) => {
      const map = {};
      for (const flag of data) {
        map[flag.key] = flag.enabled;
      }
      flagsByKey.value = map;
      return map;
    });
  }
  return loadPromise;
}

export function refreshFlags() {
  loadPromise = null;
  return loadFlags();
}

export function isFlagEnabled(key) {
  return flagsByKey.value[key] === true || flagsByKey.value[key] === undefined;
}
