const origin = (import.meta.env.VITE_API_ORIGIN || "")
  .trim()
  .replace(/\/$/, "");

export const API_ORIGIN = origin || "http://127.0.0.1:8000";
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const API_HEALTH_URL = `${API_ORIGIN}/health`;

// optional central endpoints for new code
export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  collections: `${API_BASE_URL}/collections/`,
  locations: `${API_BASE_URL}/inventory/locations`,
  inventoryLevels: `${API_BASE_URL}/inventory/levels`,
};

export async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url} ${text}`);
  }

  return res.json();
}
