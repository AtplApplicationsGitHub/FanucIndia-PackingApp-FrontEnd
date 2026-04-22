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

  if (!response.ok && typeof window !== 'undefined') {
    let errorMessage = "An unexpected error occurred.";
    try {
      const errorData = await response.clone().json();
      errorMessage = errorData?.message || errorMessage;
    } catch (e) {}

    const isSessionError = 
      response.status === 401 || 
      errorMessage.toLowerCase().includes('logged out') ||
      errorMessage.toLowerCase().includes('session');

    if (isSessionError) {
      if (!isAuthFetchRedirecting) {
        isAuthFetchRedirecting = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        window.dispatchEvent(new CustomEvent('show-global-message', { 
          detail: { message: errorMessage, severity: 'error' } 
        }));

        setTimeout(() => {
            window.location.href = '/login?reason=session-expired';
        }, 3000);
      }
      return new Promise<Response>(() => {}); 
    } else {
      // Fire the clean Snackbar
      window.dispatchEvent(new CustomEvent('show-global-message', { 
        detail: { message: errorMessage, severity: 'error' } 
      }));

      // Return a cloned response with the message scrubbed out!
      // This stops components that call res.json() from rendering the text at the bottom.
      return new Response(JSON.stringify({ message: '' }), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
      });
    }
  }

  return response;
}