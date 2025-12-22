// Centralized API configuration
// This ensures all API calls use the environment variable from .env
const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  console.error('REACT_APP_API_URL is not set in environment variables!');
  console.error('Please make sure .env file exists in the front directory with REACT_APP_API_URL=https://xchatback123.xyz');
}

// Export the API base URL - this will be used by all API calls
export const API_BASE = API_BASE_URL || '';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not configured');
    return endpoint;
  }
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

