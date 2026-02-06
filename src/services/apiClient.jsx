import axios from 'axios';

const API_BASE_URL = 'https://dikshi.ddns.net/spstores/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: Show error alerts based on HTTP status
const showAlertForStatus = (status, responseData, fallbackMessage) => {
  let message = fallbackMessage || '';

  switch (status) {
    case 400:
      message = (responseData && responseData.message) || 'Bad request.';
      break;
    case 401:
      message = 'Unauthorized. Please login again.';
      break;
    case 403:
      message = 'Forbidden. You don\'t have permission to perform this action.';
      break;
    case 404:
      message = 'Resource not found.';
      break;
    case 409:
      message = (responseData && responseData.message) || 'Conflict. Resource already exists.';
      break;
    case 422:
      message = (responseData && responseData.message) || 'Validation error.';
      break;
    case 429:
      message = 'Too many requests. Please try again later.';
      break;
    case 500:
      message = 'Server error. Please try again later.';
      break;
    case 502:
      message = 'Bad Gateway. Server is temporarily unavailable.';
      break;
    case 503:
      message = 'Service Unavailable. Please try again later.';
      break;
    case 504:
      message = 'Gateway Timeout. Request took too long.';
      break;
    default:
      if (status >= 200 && status < 300) {
        return;
      }
      message = message || `Unexpected status code: ${status}`;
  }

  // Show notifications
  if (typeof window !== 'undefined') {
    if (status >= 400 && status <= 499) {
      console.warn('Client Error:', message);
      // Use alert as fallback if Notiflix not available
      window.alert(message);
      return;
    }

    if (status >= 500 && status <= 599) {
      console.error('Server Error:', message);
      window.alert(message);
      return;
    }

    console.error('Error:', message);
    window.alert(message);
    return;
  }

  // Fallback for non-browser environments
  console.warn('ALERT:', message);
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      showAlertForStatus(status, data, error.message);
    } else if (error.request) {
      // Request made but no response
      const message = 'No response from server. Please check your connection.';
      console.error('Network Error:', message);
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    } else {
      // Error in request setup
      const message = error.message || 'An error occurred';
      console.error('Error:', message);
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config),
};

export default axiosInstance;
