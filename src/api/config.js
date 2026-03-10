const rawBase = (import.meta.env.VITE_API_BASE_URL || "").trim();

const normalizedBase =
  rawBase && !rawBase.startsWith("http://") && !rawBase.startsWith("https://")
    ? `https://${rawBase}`
    : rawBase;

export const API_BASE_URL = normalizedBase.replace(/\/$/, "");

console.log("API_BASE_URL:", API_BASE_URL);

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/api/products`,
  collections: `${API_BASE_URL}/api/collections/`,
  locations: `${API_BASE_URL}/api/inventory/locations`,
  inventoryLevels: `${API_BASE_URL}/api/inventory/levels`,
  inventoryUpdate: `${API_BASE_URL}/api/inventory/update`,
  inventoryAdjust: `${API_BASE_URL}/api/inventory/adjust`,
  inventoryBulkUpdate: `${API_BASE_URL}/api/inventory/bulk-update`,
  uploadPreview: `${API_BASE_URL}/api/upload/preview`,
  uploadParse: `${API_BASE_URL}/api/upload/parse`,
  uploadValidate: `${API_BASE_URL}/api/upload/validate`,
  uploadPushToShopify: `${API_BASE_URL}/api/upload/push-to-shopify`,
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