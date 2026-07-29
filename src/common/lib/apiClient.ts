import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

export const apiClient = axios.create({
  withCredentials: true,
  timeout: 60_000,
});

function isLoginRequest(url?: string): boolean {
  return Boolean(
    url?.includes("/auth/login") || url?.includes("/auth/mobile-login"),
  );
}

function isPublicRequest(url?: string): boolean {
  return Boolean(
    isLoginRequest(url) ||
      url?.includes("/auth/signup") ||
      url?.includes("/auth/check-email") ||
      url?.includes("/app-update/"),
  );
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  headers.set("x-request-id", uuidv4());

  if (!isPublicRequest(config.url) && typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  config.headers = headers;
  return config;
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (err: AxiosError) => {
    const requestIsPublic = isPublicRequest(err.config?.url);
    const payload = err.response?.data as
      | { code?: string; message?: string | string[] }
      | undefined;
    const responseMessage = payload?.message;
    const errorMessage = Array.isArray(responseMessage)
      ? responseMessage[0] || "Something went wrong."
      : responseMessage || "Something went wrong.";

    const normalizedMessage = errorMessage.toLowerCase();
    const isSessionError =
      err.response?.status === 401 ||
      normalizedMessage.includes("logged out") ||
      normalizedMessage.includes("session");

    if (
      isSessionError &&
      !requestIsPublic &&
      typeof window !== "undefined"
    ) {
      if (!isRedirecting) {
        isRedirecting = true;

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Cookies.remove("token");
        Cookies.remove("role");

        window.dispatchEvent(
          new CustomEvent("show-global-message", {
            detail: { message: errorMessage, severity: "error" },
          }),
        );

        window.setTimeout(() => {
          window.location.href = "/login?reason=session-expired";
        }, 3000);
      }

      return Promise.reject(err);
    }

    if (typeof window !== "undefined" && !requestIsPublic) {
      window.dispatchEvent(
        new CustomEvent("show-global-message", {
          detail: { message: errorMessage, severity: "error" },
        }),
      );

      if (
        err.response?.data &&
        typeof err.response.data === "object" &&
        !Array.isArray(err.response.data)
      ) {
        (err.response.data as { message?: string }).message = "";
      }
    }

    err.message = requestIsPublic ? errorMessage : "";
    err.code = payload?.code ?? "INTERNAL_ERROR";

    return Promise.reject(err);
  },
);

export default apiClient;
