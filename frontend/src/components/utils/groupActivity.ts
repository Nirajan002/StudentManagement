const STORAGE_KEY = "group-last-viewed";

function getUserKey(): string {
  // scopes the "viewed" state to whoever is currently logged in on this browser
  return localStorage.getItem("fullName") || "anon";
}

function readStore(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function scopedKey(groupId: string | number): string {
  return `${getUserKey()}:${groupId}`;
}

export function getLastViewed(groupId: string | number): string | null {
  return readStore()[scopedKey(groupId)] ?? null;
}

export function markGroupViewed(groupId: string | number) {
  const store = readStore();
  store[scopedKey(groupId)] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function hasUnreadActivity(
  groupId: string | number,
  lastPostAt?: string | null
): boolean {
  if (!lastPostAt) return false;
  const lastViewed = getLastViewed(groupId);
  if (!lastViewed) return true;
  return new Date(lastPostAt).getTime() > new Date(lastViewed).getTime();
}