// Single source of truth for the backend origin. Never hardcode
// "https://localhost:7014" anywhere else in the app — import from here
// instead, so switching environments is a one-line env var change.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawBaseUrl) {
  // Fail loudly in dev rather than silently hitting the wrong host.
  console.warn(
    "VITE_API_BASE_URL is not set. Falling back to https://localhost:7014. " +
      "Create a .env.local file (see .env.example) to configure this."
  );
}

export const API_BASE_URL = rawBaseUrl || "https://localhost:7014";
export const API_URL = `${API_BASE_URL}/api`;

/**
 * Builds a full URL for a file stored under wwwroot/uploads on the backend.
 * Returns null when there's no filename, so callers can fall back to an
 * initials avatar or placeholder without string-checking everywhere.
 */
export function getUploadUrl(fileName?: string | null): string | null {
  if (!fileName) return null;
  return `${API_BASE_URL}/uploads/${fileName}`;
}