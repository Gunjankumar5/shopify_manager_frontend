const DEFAULT_PROD_API_BASE_URL =
  "https://shopifymanagerbackend-production-b50f.up.railway.app/api";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredApiBaseUrl ||
  (import.meta.env.DEV ? "/api" : DEFAULT_PROD_API_BASE_URL)
).replace(/\/$/, "");

export const API_HEALTH_URL = (configuredApiBaseUrl ||
  (import.meta.env.DEV ? "/api/health" : "https://shopifymanagerbackend-production-b50f.up.railway.app/health")
).replace(/\/$/, "");
