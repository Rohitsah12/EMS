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

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

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

    // Don't retry for auth endpoints
    const isAuthEndpoint = 
      originalRequest.url?.includes('/auth/login') || 
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/logout') ||
      originalRequest.url?.includes('/auth/refresh');

    // If error is 401 and NOT from auth endpoint and we haven't retried yet
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        // Success - process queued requests
        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - process queue with error
        processQueue(refreshError as Error);
        isRefreshing = false;

        // Logout user
        store.dispatch(logoutUser());
        
        // Redirect to login (only on client side)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For all other errors, just reject
    return Promise.reject(error);
  }
);

export default api;