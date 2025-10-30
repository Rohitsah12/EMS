import axios from 'axios';
import { store } from '@/store/store';
import { logoutUser } from '@/store/slices/authSlice';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry for auth endpoints (login, register, logout)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/logout');

    // If error is 401 and NOT from auth endpoint and we haven't retried yet
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        store.dispatch(logoutUser());
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // For all other errors (including auth endpoint failures), just reject
    return Promise.reject(error);
  }
);

export default api;