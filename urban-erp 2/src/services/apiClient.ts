import { auth } from '../lib/firebase';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const user = auth?.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If baseUrl already ends with /api and endpoint begins with /api/, avoid duplicate /api/api
  if (baseUrl.endsWith('/api') && path.startsWith('/api/')) {
    path = path.replace(/^\/api/, '');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${baseUrl}${path}`, config);

    if (!response.ok) {
      let errorMsg = `Request failed (${response.status} ${response.statusText})`;
      let errorData: any = null;
      try {
        errorData = await response.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch (e) {
        // Response was not JSON
      }

      if (response.status === 401) {
        console.warn('API returned 401 Unauthorized. User session or token may be invalid/expired.');
      } else if (response.status === 403) {
        console.warn('API returned 403 Forbidden. User does not have permission for this resource.');
      }

      throw new ApiError(errorMsg, response.status, errorData);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error: any) {
    // Handle network / CORS / connection errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError(
        `Unable to connect to Spring Boot backend at ${baseUrl}. Ensure the backend is running and CORS is enabled for http://localhost:3000.`,
        0
      );
    }
    throw error;
  }
};

