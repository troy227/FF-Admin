const STORAGE_KEY = 'ff-admin-cache';

export function readAdminCache() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeAdminCache(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAdminCache() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function mergeFlags(existing, incoming) {
  const byId = new Map(existing.map((flag) => [flag.id, flag]));
  for (const flag of incoming) {
    byId.set(flag.id, flag);
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}
