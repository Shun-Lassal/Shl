const resolveDefaultApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }
  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname || 'localhost';
  const port = window.location.port;
  if (port === '5173') {
    return `${protocol}//${hostname}:3000`;
  }
  return `${protocol}//${hostname}/api`;
};

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();

export const API_BASE_URL = envApiUrl || resolveDefaultApiUrl();
