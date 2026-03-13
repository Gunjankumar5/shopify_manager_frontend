import { API_BASE_URL } from "./config";

// Helper: fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 120000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs / 1000}s`);
    }
    throw error;
  }
}

export const api = {
  get: async (p) => {
    const url = `${API_BASE_URL}${p}`;
    console.log(`GET ${url}`);
    const r = await fetchWithTimeout(url, {}, 120000);
    const data = await r.json();
    if (!r.ok) {
      const error = new Error(data.detail || data.message || `HTTP ${r.status}`);
      error.status = r.status;
      throw error;
    }
    return data;
  },
  
  post: async (p, b) => {
    const url = `${API_BASE_URL}${p}`;
    console.log(`POST ${url}`, b);
    const r = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    const data = await r.json();
    if (!r.ok) {
      const error = new Error(data.detail || data.message || `HTTP ${r.status}`);
      error.status = r.status;
      throw error;
    }
    return data;
  },
  
  put: async (p, b) => {
    const url = `${API_BASE_URL}${p}`;
    console.log(`PUT ${url}`, b);
    const r = await fetchWithTimeout(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    const data = await r.json();
    if (!r.ok) {
      const error = new Error(data.detail || data.message || `HTTP ${r.status}`);
      error.status = r.status;
      throw error;
    }
    return data;
  },
  
  delete: async (p) => {
    const url = `${API_BASE_URL}${p}`;
    console.log(`DELETE ${url}`);
    const r = await fetchWithTimeout(url, { method: "DELETE" });
    const data = await r.json();
    if (!r.ok) {
      const error = new Error(data.detail || data.message || `HTTP ${r.status}`);
      error.status = r.status;
      throw error;
    }
    return data;
  },
  
  upload: async (p, fd) => {
    const url = `${API_BASE_URL}${p}`;
    console.log(`UPLOAD ${url}`);
    const r = await fetchWithTimeout(url, { method: "POST", body: fd }, 300000);
    const data = await r.json();
    if (!r.ok) {
      const error = new Error(data.detail || data.message || `HTTP ${r.status}`);
      error.status = r.status;
      throw error;
    }
    return data;
  },
};
