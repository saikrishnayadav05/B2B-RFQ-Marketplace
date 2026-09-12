const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiBaseUrl = API_URL;

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
