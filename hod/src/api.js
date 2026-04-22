import axios from "axios";

const BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true
});

let csrfToken = null;

export const fetchCsrfToken = async () => {
  try {
    const { data } = await axios.get(`${BASE}/api/csrf-token`, { withCredentials: true });
    csrfToken = data.csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token", error);
  }
};

// Store JWT token for Authorization header fallback (needed for mobile browsers
// that block cross-origin cookies)
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

api.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toLowerCase();

    // Always attach Authorization header if we have a stored token
    // This is the fallback for when cookies are blocked (mobile browsers)
    const authToken = getAuthToken();
    if (authToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Attach CSRF token on modifying requests
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (!csrfToken) {
        return Promise.reject(new Error('Unable to fetch CSRF token.'));
      }
      config.headers = config.headers || {};
      config.headers['CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
