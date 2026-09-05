import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMsg = 'Network Error';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || response.statusText;
    } catch (e) {
      errorMsg = response.statusText || 'Unknown Error';
    }
    throw new Error(errorMsg);
  }

  if (response.status !== 204) {
    return response.json();
  }
  return null;
};
