import { apiRequest } from "@/shared/api/api-client";

export const salesOrdersApi = {
  list: ({ page = 1, size = 20, search = "", status = "" }) => {
    const params = new URLSearchParams({ page, size });
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    return apiRequest(`/sales-orders?${params}`);
  },
  convert: (quotationId) =>
    apiRequest(`/quotations/${quotationId}/convert`, { method: "POST" }),
  create: (input) =>
    apiRequest("/sales-orders", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  confirm: (id, input) =>
    apiRequest(`/sales-orders/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  cancel: (id, reason) =>
    apiRequest(`/sales-orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  availability: (id) => apiRequest(`/sales-orders/${id}/availability`),
  deliver: (id, input) =>
    apiRequest(`/sales-orders/${id}/deliver`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
