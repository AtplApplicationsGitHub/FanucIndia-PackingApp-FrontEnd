// lib/authFetch.ts
export async function authFetch(url: string, options: RequestInit = {}) {
  // Always get the latest token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
