/**
 * Tiny fetch wrapper for the Nexora local API.
 * In dev, Vite proxies /api -> http://localhost:3000.
 */

// Se VITE_API_URL estiver definido no ambiente (Netlify), usa ele.
// Caso contrário, usa '/api' (útil para o proxy local do Vite).
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Exportamos para uso em outros arquivos que chamam fetch diretamente
export { API_BASE };

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
  return request(`/machines?${qs.toString()}`);
}

export function fetchSoftware(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return request(`/software?${qs.toString()}`);
}
