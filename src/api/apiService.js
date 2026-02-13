import axios from "axios";

// ---------------------
// Axios Instance
// ---------------------
const apiService = axios.create({
  baseURL: "http://dikshiserver/REACTTEST/api/",
  headers: { "Content-Type": "application/json" },
});

// Suppress 404 spam (still rejects)
apiService.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);

// ---------------------
// API BASE
// ---------------------
export const API_BASE = "http://dikshiserver/REACTTEST/api/";

// ---------------------
// Request Wrapper (NO ALERTS)
// ---------------------
const requestWithAlert = async ({ method, url, data = null, params = {} }) => {
  try {
    const res = await apiService.request({
      method,
      url,
      data,
      params,
    });

    return res.data;
  } catch (err) {
    // Just throw error → component will handle UI
    throw err;
  }
};

// ---------------------
// Public API Methods
// ---------------------
const get = (url, params = {}) =>
  requestWithAlert({ method: "get", url, params });

const post = (url, data) =>
  requestWithAlert({ method: "post", url, data });

const put = (url, data) =>
  requestWithAlert({ method: "put", url, data });

const del = (url) =>
  requestWithAlert({ method: "delete", url });

// ---------------------
// Silent Fetch (unchanged)
// ---------------------
const getSilent = async (url, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const fullUrl = `${API_BASE}/${url}${query ? "?" + query : ""}`;

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
};

// ---------------------
// EXPORTS
// ---------------------
export default {
  get,
  post,
  put,
  del,
  getSilent,
  requestWithAlert,
};

// Named export
export const axiosInstance = apiService;
export { get, post };
