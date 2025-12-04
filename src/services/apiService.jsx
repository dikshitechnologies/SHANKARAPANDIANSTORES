import { apiClient } from "./apiClient";

// Helper function to handle API responses consistently
const handleResponse = async (promise) => {
  try {
    const response = await promise;
    return response.data || response; // Return data or the whole response based on your API structure
  } catch (error) {
    // Error is already handled by interceptor in apiClient
    throw error;
  }
};

export const apiService = {
  // GET request
  get: async (url, config = {}) => {
    return handleResponse(apiClient.get(url, config));
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    return handleResponse(apiClient.post(url, data, config));
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    return handleResponse(apiClient.put(url, data, config));
  },

  // DELETE request
  delete: async (url, config = {}) => {
    return handleResponse(apiClient.delete(url, config));
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    return handleResponse(apiClient.patch(url, data, config));
  }
};

export default apiService;