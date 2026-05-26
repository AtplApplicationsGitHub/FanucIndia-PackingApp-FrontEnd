import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const apiClient = axios.create({
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = config.headers instanceof AxiosHeaders
    ? config.headers
    : new AxiosHeaders(config.headers);

  headers.set('x-request-id', uuidv4());

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  config.headers = headers;
  return config;
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (err: AxiosError) => {
    const isLoginRequest = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/mobile-login');
    const payload = err.response?.data as { code?: string; message?: string } | undefined;
    const errorMessage = payload?.message ?? 'Something went wrong.';

    // Dynamically catch concurrent login errors regardless of the status code
    const isSessionError = 
      err.response?.status === 401 || 
      errorMessage.toLowerCase().includes('logged out') || 
      errorMessage.toLowerCase().includes('session');

    if (isSessionError && !isLoginRequest && typeof window !== 'undefined') {
        if (!isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            window.dispatchEvent(new CustomEvent('show-global-message', { 
                detail: { message: errorMessage, severity: 'error' } 
            }));

            setTimeout(() => {
                window.location.href = '/login?reason=session-expired';
            }, 3000); 
        }
        // Swallow the promise completely so it halts execution
        return new Promise(() => {});
    }

    if (typeof window !== 'undefined' && !isLoginRequest) {
        // Fire the global snackbar
        window.dispatchEvent(new CustomEvent('show-global-message', { 
            detail: { message: errorMessage, severity: 'error' } 
        }));

        // SCRUB the error message from the response data.
        // This prevents the local components from rendering the ugly text at the bottom.
        if (err.response && err.response.data && typeof err.response.data === 'object') {
            (err.response.data as any).message = '';
        }
    }

    // Reject with the actual Error instance to prevent Next.js router crashes
    err.message = ''; 
    (err as any).code = payload?.code ?? 'INTERNAL_ERROR';
    
    return Promise.reject(err);
  }
);

export default apiClient;