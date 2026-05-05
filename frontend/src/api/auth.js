// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BASE = `${API_BASE_URL}/auth`;
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Custom error class
class APIError extends Error {
  constructor(message, status, type = 'unknown') {
    super(message);
    this.status = status;
    this.type = type;
  }
}

/**
 * Wrapper for fetch with timeout and error handling
 */
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include', // Include cookies for httpOnly auth
    });

    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { success: false, message: 'Invalid response format' };
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new APIError(data.message || 'Unauthorized', 401, 'auth');
      } else if (response.status === 400) {
        throw new APIError(data.message || 'Bad request', 400, 'validation');
      } else if (response.status === 429) {
        throw new APIError('Too many requests. Please try again later.', 429, 'rate_limit');
      } else {
        throw new APIError(data.message || 'Server error', response.status, 'server');
      }
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err.name === 'AbortError') {
      throw new APIError('Request timeout. Please check your connection.', 0, 'timeout');
    }
    
    if (err instanceof APIError) {
      throw err;
    }
    
    throw new APIError(err.message || 'Network error', 0, 'network');
  }
}

export async function register(user) {
  // Input validation
  if (!user || !user.email || !user.password || !user.name) {
    throw new APIError('Missing required fields', 400, 'validation');
  }

  try {
    return await fetchWithTimeout(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
  } catch (err) {
    throw err;
  }
}

export async function login(credentials) {
  // Input validation
  if (!credentials || !credentials.email || !credentials.password) {
    throw new APIError('Missing email or password', 400, 'validation');
  }

  try {
    return await fetchWithTimeout(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch (err) {
    throw err;
  }
}
