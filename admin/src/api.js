import axios from "axios";

// This part is the same as yours
const BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${BASE}/api`, // add /api exactly once
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

api.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toLowerCase();

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
    // Handle request errors
    return Promise.reject(error);
  }
);
// ----------------------------------------

export default api;
