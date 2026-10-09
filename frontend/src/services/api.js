import axios from 'axios';

// Backend base URL from environment variable
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aegis_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    const statusCode = error.response ? error.response.status : null;
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'API Communication failed';

    if (isNetworkError) {
      console.warn('[AegisGuard API] Live backend unreachable, falling back to cached/demo state:', error.message);
    } else {
      console.warn(`[AegisGuard API] Error [${statusCode}]:`, errorMessage);
    }

    return Promise.reject({
      isNetworkError,
      status: statusCode,
      message: errorMessage,
      raw: error
    });
  }
);

export default apiClient;
