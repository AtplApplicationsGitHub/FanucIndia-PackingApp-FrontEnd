let isAuthFetchRedirecting = false;

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    if (!isAuthFetchRedirecting) {
      isAuthFetchRedirecting = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setTimeout(() => {
          window.location.href = '/login?reason=session-expired';
      }, 500);
    }
    return new Promise<Response>(() => {}); 
  }

  return response;
}