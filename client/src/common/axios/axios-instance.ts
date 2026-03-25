import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';


// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// ─── Request Interceptor ─────────────────────────────────────────────────────
// Automatically attaches the JWT access token to every request.
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Handles token refresh on 401. Redirects to login on persistent 401.
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // If the response follows the standard Result<T> pattern, unwrap it.
    const result = response.data;
    if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
      if (result.success) {
        return result.data; // Return just the payload
      } else {
        // Handle explicit failure returned with 2xx status (unlikely but safe)
        const message = result.error?.message || 'Operation failed';
        return Promise.reject(new Error(message));
      }
    }
    return response.data;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      // No refresh token → redirect to login immediately
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests while a refresh is already in progress
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:9000/api'}/auth/refresh`,
          { refreshToken: refreshToken },
        );


        const newAccessToken: string = data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transform error response into a consistent shape
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
