import axios from 'axios';

// Dynamically select base URL depending on environment variables
const BASE_URL = import.meta.env.VITE_SERVER_URL
  ? `${import.meta.env.VITE_SERVER_URL}/api`
  : '/api';

/**
 * Custom Axios API Instance
 * Pre-configured with withCredentials: true to send & receive HTTP-Only cookies.
 */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for HTTP-Only JWT authentication cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
