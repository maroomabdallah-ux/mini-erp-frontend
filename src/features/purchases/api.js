import { apiRequest } from "@/shared/api/api-client";

export const purchasesApi = {
  list: ({
    page = 1,
    size = 20,
    search = "",
    status = "",
    supplierId = "",
  }) => {
    const params = new URLSearchParams({ page, size });
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (supplierId) params.set("supplier_id", supplierId);
    return apiRequest(`/purchase-orders?${params.toString()}`);
  },
  create: (input) =>
    apiRequest("/purchase-orders", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id, input) =>
    apiRequest(`/purchase-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  submit: (id) =>
    apiRequest(`/purchase-orders/${id}/submit`, { method: "POST" }),
  approve: (id) =>
    apiRequest(`/purchase-orders/${id}/approve`, { method: "POST" }),
  send: (id) => apiRequest(`/purchase-orders/${id}/send`, { method: "POST" }),
  reject: (id, reason) =>
    apiRequest(`/purchase-orders/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  cancel: (id, reason) =>
    apiRequest(`/purchase-orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  receive: (id, input) =>
    apiRequest(`/purchase-orders/${id}/receive`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
