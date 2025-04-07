const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://oplayeni.onrender.com';

export const config = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment,
}; 