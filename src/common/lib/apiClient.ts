import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
} from 'axios'
import { v4 as uuidv4 } from 'uuid'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use(config => {
  // Normalize headers to AxiosHeaders (works for undefined, plain object, or AxiosHeaders)
  const headers = config.headers instanceof AxiosHeaders
    ? config.headers
    : new AxiosHeaders(config.headers)

  headers.set('x-request-id', uuidv4())
  config.headers = headers
  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (err: AxiosError) => {
    const payload = err.response?.data as { code?: string; message?: string } | undefined
    return Promise.reject({
      code: payload?.code ?? 'INTERNAL_ERROR',
      message: payload?.message ?? 'Something went wrong.',
    })
  }
)

export default apiClient
