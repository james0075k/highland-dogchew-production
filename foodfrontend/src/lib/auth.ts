import Cookies from 'js-cookie';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return Cookies.get('token') || null;
  return Cookies.get('token') || window.localStorage.getItem('adminToken') || null;
}

export function clearAuthToken(): void {
  Cookies.remove('token');
  if (typeof window !== 'undefined') window.localStorage.removeItem('adminToken');
}

export function authHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function jsonAuthHeader(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...authHeader() };
}
