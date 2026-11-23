// Centralized API Client for Superadmin Web
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiRequest<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  let url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) =>
    apiRequest<T>(endpoint, { method: "GET", params }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),

  // Specific superadmin service calls
  auth: {
    login: (email: string, password: string) =>
      api.post("/auth/login", { email, password }),
    getMe: () =>
      api.get("/auth/me"),
    updateProfile: (data: any) =>
      api.put("/auth/profile", data),
  },

  dashboard: {
    getStats: () => api.get("/superadmin/dashboard-stats"),
  },

  search: (q: string) =>
    api.get("/superadmin/search", { q }),

  propertyManagers: {
    getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
      api.get("/superadmin/property-managers", params),
    getById: (id: string) =>
      api.get(`/superadmin/property-managers/${id}`),
    create: (data: any) =>
      api.post("/superadmin/property-managers", data),
    toggleStatus: (id: string) =>
      api.patch(`/superadmin/property-managers/${id}/status`),
  },

  customers: {
    getAll: (params?: { search?: string; page?: number; limit?: number }) =>
      api.get("/superadmin/customers", params),
    getById: (id: string) =>
      api.get(`/superadmin/customers/${id}`),
    toggleStatus: (id: string) =>
      api.patch(`/superadmin/customers/${id}/status`),
  },

  subscriptions: {
    getAll: () => api.get("/superadmin/subscriptions"),
    createPlan: (data: any) => api.post("/superadmin/subscriptions/plans", data),
    updatePlan: (id: string, data: any) => api.put(`/superadmin/subscriptions/plans/${id}`, data),
    togglePlanStatus: (id: string) => api.patch(`/superadmin/subscriptions/plans/${id}/status`),
    deletePlan: (id: string) => api.delete(`/superadmin/subscriptions/plans/${id}`),
  },

  analytics: {
    getOverview: () => api.get("/superadmin/analytics"),
  },

  notifications: {
    getAll: (params?: { unreadOnly?: boolean; all?: boolean; limit?: number; page?: number }) =>
      api.get("/notifications", params),
    getUnreadCount: () =>
      api.get("/notifications/unread-count"),
    markAsRead: (id: string) =>
      api.put(`/notifications/${id}/read`),
    markAllAsRead: () =>
      api.put("/notifications/read-all"),
    delete: (id: string) =>
      api.delete(`/notifications/${id}`),
    clearAll: () =>
      api.delete("/notifications"),
  },

  settings: {
    get: () => api.get("/settings"),
    update: (data: any) => api.put("/settings", data),
  },
};
