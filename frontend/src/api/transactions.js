const API_BASE = "http://localhost:5000/api/transactions";

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchTransactions(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}?${query}`, {
      headers: buildHeaders(),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchTransactions error:", err);
    return { success: false, message: err.message, data: [] };
  }
}

export async function fetchTransaction(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { headers: buildHeaders() });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchTransaction error:", err);
    return { success: false, message: err.message };
  }
}

export async function addTransaction(data) {
  try {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("addTransaction error:", err);
    return { success: false, message: err.message };
  }
}

export async function updateTransaction(id, data) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateTransaction error:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteTransaction(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: buildHeaders(),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteTransaction error:", err);
    return { success: false, message: err.message };
  }
}

export async function fetchStatistics(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/stats?${query}`, { headers: buildHeaders() });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchStatistics error:", err);
    return { success: false, message: err.message, data: {} };
  }
}

export async function fetchInsights() {
  try {
    const res = await fetch(`${API_BASE}/insights`, { headers: buildHeaders() });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchInsights error:", err);
    return { success: false, message: err.message, insights: [] };
  }
}
