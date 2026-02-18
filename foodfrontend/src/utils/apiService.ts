const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(path, options = {}) {
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
