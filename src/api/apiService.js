import axios from "axios";
import Notiflix from "notiflix";

// Sound for error alerts
const ERROR_SOUND_URL =
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

// ---------------------
// Notiflix Initialization
// ---------------------
Notiflix.Notify.init({
  position: "right-top",
  timeout: 4000,
  cssAnimation: true,
  cssAnimationDuration: 400,
  cssAnimationStyle: "fade",
});
Notiflix.Report.init({
  cssAnimation: true,
  cssAnimationDuration: 400,
  cssAnimationStyle: "fade",
});

// ---------------------
// Helpers
// ---------------------
const playErrorSound = () => {
  if (typeof window === "undefined" || typeof window.Audio !== "function") return;
  try {
    const audio = new Audio(ERROR_SOUND_URL);
    audio.play().catch(() => {});
  } catch (e) {
    console.warn("Sound error:", e);
  }
};

// Center popup
const centerNotifyWrapper = () => {
  if (typeof document === "undefined") return;
  const wrap = document.querySelector(".notiflix-notify-wrapper");
  if (!wrap) return;
  wrap.style.position = "fixed";
  wrap.style.top = "50%";
  wrap.style.left = "50%";
  wrap.style.transform = "translate(-50%, -50%)";
  wrap.style.zIndex = "99999";
};

// Top-right popup
const positionNotifyTopRight = () => {
  if (typeof document === "undefined") return;
  const wrap = document.querySelector(".notiflix-notify-wrapper");
  if (!wrap) return;
  wrap.style.position = "fixed";
  wrap.style.top = "10px";
  wrap.style.right = "10px";
  wrap.style.left = "auto";
  wrap.style.transform = "none";
  wrap.style.zIndex = "99999";
};

// ---------------------
// Axios Instance
// ---------------------
const apiService = axios.create({
 baseURL: "http://dikshiserver/spstorewebapi/api/", 
  headers: { "Content-Type": "application/json" },
});

// Suppress 404 spam
apiService.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 404) {
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

// ---------------------
// API ENDPOINTS EXPORT
// ---------------------
export const API_BASE = "http://dikshiserver/spstorewebapi/api";


// ---------------------
// Alert handler
// ---------------------
const showAlertForStatus = (status, responseData, fallbackMessage) => {
  let msg = fallbackMessage || "";

  switch (status) {
    case 400:
      msg = responseData?.message || "Bad request";
      break;
    case 401:
      msg = "Unauthorized. Please login again.";
      break;
    case 403:
      msg = "Forbidden. You do not have permission.";
      break;
    case 404:
      msg = "Resource not found.";
      break;
    case 409:
      msg = responseData?.message || "Conflict. Data already exists.";
      break;
    case 422:
      msg = responseData?.message || "Validation error.";
      break;
    case 500:
      msg = "Server error.";
      break;
    default:
      msg = msg || `Error ${status}`;
  }

  if (typeof window !== "undefined") {
    if (status >= 400 && status <= 499) {
      Notiflix.Report.warning(msg, "");
      positionNotifyTopRight();
      playErrorSound();
      return;
    }

    if (status === 500) {
      Notiflix.Report.failure("Server Error", msg, "OK");
      centerNotifyWrapper();
      playErrorSound();
      return;
    }

    Notiflix.Notify.failure(msg);
    positionNotifyTopRight();
    playErrorSound();
    return;
  }

  console.warn("ALERT:", msg);
};

// ---------------------
// Request Wrapper
// ---------------------
const requestWithAlert = async ({ method, url, data = null, params = {} }) => {
  try {
    const res = await apiService.request({ method, url, data, params });

    if (!(res.status >= 200 && res.status < 300)) {
      showAlertForStatus(res.status, res.data);
    }

    return res.data;
  } catch (err) {
    if (err.response) {
      showAlertForStatus(err.response.status, err.response.data, err.message);
      throw err;
    }

    Notiflix.Notify.failure(err.message || "Network Error");
    playErrorSound();
    throw err;
  }
};

// ---------------------
// Public API Methods
// ---------------------
const get = (url, params = {}) => requestWithAlert({ method: "get", url, params });
const post = (url, data) => requestWithAlert({ method: "post", url, data });
const put = (url, data) => requestWithAlert({ method: "put", url, data });
const del = (url) => requestWithAlert({ method: "delete", url });

// Silent fetch
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

// Axios instance (named export)
export const axiosInstance = apiService;
