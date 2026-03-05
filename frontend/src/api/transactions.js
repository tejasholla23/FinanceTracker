const API_BASE = "http://localhost:5000/api/transactions";

export async function fetchTransactions(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}?${query}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchTransactions error:", err);
    return { success: false, message: err.message, data: [] };
  }
}

export async function fetchTransaction(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`${API_BASE}/stats?${query}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchStatistics error:", err);
    return { success: false, message: err.message, data: {} };
  }
}
