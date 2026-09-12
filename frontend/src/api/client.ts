const DEFAULT_LOCAL_API = 'http://localhost:8000';
const PRODUCTION_API = 'https://b2b-rfq-marketplace-production.up.railway.app';

function normalizeApiBaseUrl(url: string): string {
  let normalized = url.trim().replace(/\/+$/, '');
  if (normalized.endsWith('/api/v1')) {
    normalized = normalized.slice(0, -'/api/v1'.length);
  }
  return normalized;
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    return PRODUCTION_API;
  }

  return normalizeApiBaseUrl(import.meta.env.VITE_API_URL || DEFAULT_LOCAL_API);
}

// Keep for any existing imports; always resolve at call time in the API client.
export const apiBaseUrl = getApiBaseUrl();

export function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('access_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('access_token');
}

export function getStoredUser(): import('../types').User | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as import('../types').User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: import('../types').User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem('user');
}
