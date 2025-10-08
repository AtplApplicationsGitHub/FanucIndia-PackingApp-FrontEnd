import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
            window.location.href = '/login';
        }, 500);
    }

    const payload = err.response?.data as { code?: string; message?: string } | undefined;
    return Promise.reject({
      code: payload?.code ?? 'INTERNAL_ERROR',
      message: payload?.message ?? 'Something went wrong.',
    });
  }
);

export default apiClient;