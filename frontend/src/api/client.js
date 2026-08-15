const BASE_URL = import.meta.env.VITE_API_URL || "/api";

function getStoredToken() {
  return localStorage.getItem("cepa_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Try again.");
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),
  updateMe: (payload) => request("/auth/me", { method: "PATCH", body: payload, auth: true }),

  // Categories
  listCategories: () => request("/categories"),
  getCategory: (slug) => request(`/categories/${slug}`),

  // Threads
  listThreads: (slug, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/threads/category/${slug}${qs ? `?${qs}` : ""}`);
  },
  searchThreads: (q, params = {}) => {
    const qs = new URLSearchParams({ q, ...params }).toString();
    return request(`/threads/search?${qs}`);
  },
  getThread: (id) => request(`/threads/${id}`, { auth: true }),
  createThread: (payload) => request("/threads", { method: "POST", body: payload, auth: true }),
  updateThread: (id, payload) => request(`/threads/${id}`, { method: "PATCH", body: payload, auth: true }),
  deleteThread: (id) => request(`/threads/${id}`, { method: "DELETE", auth: true }),
  voteThread: (id) => request(`/threads/${id}/vote`, { method: "POST", auth: true }),

  // Replies
  createReply: (threadId, payload) =>
    request(`/threads/${threadId}/replies`, { method: "POST", body: payload, auth: true }),
  updateReply: (id, payload) => request(`/replies/${id}`, { method: "PATCH", body: payload, auth: true }),
  deleteReply: (id) => request(`/replies/${id}`, { method: "DELETE", auth: true }),
  voteReply: (id) => request(`/replies/${id}/vote`, { method: "POST", auth: true }),

  // Users
  getProfile: (username) => request(`/users/${username}`),

  // Admin
  listAllUsers: () => request("/admin/users", { auth: true }),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: "PATCH", body: { role }, auth: true }),
  createCategory: (payload) => request("/admin/categories", { method: "POST", body: payload, auth: true }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: "DELETE", auth: true }),
  setThreadFlags: (id, payload) => request(`/admin/threads/${id}/flags`, { method: "PATCH", body: payload, auth: true }),

  // Chatbot
  chat: (message, history) => request("/chatbot", { method: "POST", body: { message, history } }),
};

export { getStoredToken };
