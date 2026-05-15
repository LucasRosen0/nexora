/**
 * Tiny fetch wrapper for the Nexora local API.
 * In dev, Vite proxies /api -> http://localhost:3000.
 */

const API_BASE = (() => {
  if (typeof window === 'undefined') return '/api';
  // If we're served by the Express backend itself (port 3000), use relative.
  // If we're on Vite dev (5173), proxy is configured to /api as well.
  return '/api';
})();

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      throw new Error(`API ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function fetchHealth() {
  return request('/health');
}

export function fetchMachines(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return Promise.resolve({
  data: []
});
}

export function fetchSoftware(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return request(`/software?${qs.toString()}`);
}
