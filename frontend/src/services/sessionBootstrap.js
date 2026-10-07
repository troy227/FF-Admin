const MEMORY_SESSION_KEY = '__ffAppMemorySession';
const ADMIN_CACHE_KEY = 'ff-admin-cache';
const EVALUATE_CACHE_KEY = 'ff-evaluate-cache';

/** Clears FF sessionStorage on full page reload; keeps it during in-app navigation. */
export function bootstrapFfSession() {
  if (globalThis[MEMORY_SESSION_KEY]) {
    return;
  }

  globalThis[MEMORY_SESSION_KEY] = true;
  sessionStorage.removeItem(ADMIN_CACHE_KEY);
  sessionStorage.removeItem(EVALUATE_CACHE_KEY);
}
