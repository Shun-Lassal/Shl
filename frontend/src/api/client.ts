const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  skipErrorHandling?: boolean;
}

export class ApiError extends Error {
  status: number;
  payload: any;

  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

let handlingUnauthorized = false;
const handleUnauthorized = async () => {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;
  try {
    const [{ useAuthStore }, { default: router }] = await Promise.all([
      import('../stores/auth'),
      import('../router'),
    ]);
    const authStore = useAuthStore();
    authStore.setUser(null);
    const redirectTo = router.currentRoute.value?.fullPath || '/home';
    if (router.currentRoute.value?.path !== '/login') {
      await router.push({ path: '/login', query: { redirect: redirectTo } });
    }
  } finally {
    // allow future handling in case user navigates back without logging in
    setTimeout(() => {
      handlingUnauthorized = false;
    }, 500);
  }
};

const formatErrorDetails = (details: any): string | null => {
  if (!details) return null;
  if (Array.isArray(details)) {
    const parts = details
      .map((e) => {
        if (e && typeof e === 'object') {
          const field = typeof e.field === 'string' ? e.field : 'unknown';
          const message = typeof e.message === 'string' ? e.message : JSON.stringify(e);
          return `${field}: ${message}`;
        }
        return String(e);
      })
      .filter(Boolean);
    return parts.length ? parts.join(' | ') : null;
  }
  if (typeof details === 'string') return details;
  if (typeof details === 'object') return JSON.stringify(details);
  return String(details);
};

export const apiCall = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { skipErrorHandling = false, ...fetchOptions } = options;
  
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Send cookies with requests
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Session expired / invalid cookie: force a global logout + redirect to login.
        // Dynamic imports avoid circular deps (router <-> authStore <-> api).
        void handleUnauthorized();
      }
      if (!skipErrorHandling) {
        const message = (data && typeof data.message === 'string' && data.message) || response.statusText || 'API Error';
        const details = data?.data;
        const detailsText = formatErrorDetails(details);
        const errorId = typeof data?.errorId === 'string' ? data.errorId : null;
        const fullMessage =
          [message, detailsText ? `(${detailsText})` : null, errorId ? `[${errorId}]` : null]
            .filter(Boolean)
            .join(' ');
        throw new ApiError(fullMessage || `API Error: ${response.status}`, response.status, data);
      }
    }

    return data;
  } catch (error) {
    if (!skipErrorHandling) {
      throw error;
    }
    return {} as T;
  }
};

// GET request
export const apiGet = async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'GET',
  });
};

// POST request
export const apiPost = async <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// PATCH request
export const apiPatch = async <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// PUT request
export const apiPut = async <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

// DELETE request
export const apiDelete = async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
};
