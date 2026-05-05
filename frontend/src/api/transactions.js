// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_BASE = `${API_BASE_URL}/transactions`;
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
      credentials: 'include',
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
        // Clear token on auth error
        localStorage.removeItem("token");
        throw new APIError('Unauthorized - please log in again', 401, 'auth');
      } else if (response.status === 400) {
        throw new APIError(data.message || 'Bad request', 400, 'validation');
      } else if (response.status === 404) {
        throw new APIError('Resource not found', 404, 'not_found');
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

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchTransactions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await fetchWithTimeout(`${API_BASE}?${query}`, {
    headers: buildHeaders(),
  });
}

export async function fetchTransaction(id) {
  if (!id) {
    throw new APIError('Transaction ID is required', 400, 'validation');
  }
  return await fetchWithTimeout(`${API_BASE}/${id}`, {
    headers: buildHeaders(),
  });
}

export async function addTransaction(data) {
  if (!data || !data.amount || !data.type) {
    throw new APIError('Missing required transaction fields', 400, 'validation');
  }
  return await fetchWithTimeout(`${API_BASE}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(id, data) {
  if (!id) {
    throw new APIError('Transaction ID is required', 400, 'validation');
  }
  if (!data || Object.keys(data).length === 0) {
    throw new APIError('No update data provided', 400, 'validation');
  }
  return await fetchWithTimeout(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id) {
  if (!id) {
    throw new APIError('Transaction ID is required', 400, 'validation');
  }
  return await fetchWithTimeout(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
}

export async function fetchStatistics(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await fetchWithTimeout(`${API_BASE}/stats?${query}`, {
    headers: buildHeaders(),
  });
}

export async function fetchInsights() {
  return await fetchWithTimeout(`${API_BASE}/insights`, {
    headers: buildHeaders(),
  });
}
