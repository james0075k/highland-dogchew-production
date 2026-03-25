const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface FetchAPIOptions {
  endpoint: string;
  method?: string;
  id?: string | number;
  params?: Record<string, unknown>;
  body?: unknown;
}

export async function fetchAPI<T = unknown>({ endpoint, method = 'GET', id, params, body }: FetchAPIOptions): Promise<T> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL is missing in .env.local');
  let url = `${API_BASE}/${endpoint}`;
  if (id !== undefined) url += `/${id}`;
  if (params && method === 'GET') {
    const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data as T;
}

export async function apiRequest(path: string, options: RequestInit & { headers?: Record<string, string> } = {}) {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env.local");

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || "Request failed";
    throw new Error(msg);
  }

  return data; // expecting your handleSuccess format
}
