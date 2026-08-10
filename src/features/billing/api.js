import { apiRequest } from "@/shared/api/api-client";

export const billingApi = {
  list: ({
    page = 1,
    size = 20,
    search = "",
    status = "",
    overdue = false,
    customerId = "",
  }) => {
    const params = new URLSearchParams({ page, size });
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (overdue) params.set("overdue", "true");
    if (customerId) params.set("customer_id", customerId);
    return apiRequest(`/invoices?${params}`);
  },
  eligibleOrders: () => apiRequest("/invoices/eligible-orders"),
  create: (input) =>
    apiRequest("/invoices", { method: "POST", body: JSON.stringify(input) }),
  issue: (id) => apiRequest(`/invoices/${id}/issue`, { method: "POST" }),
  cancel: (id, reason) =>
    apiRequest(`/invoices/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  pay: (id, input) =>
    apiRequest(`/invoices/${id}/payments`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  recordCustomerPayment: (input) =>
    apiRequest("/payments", { method: "POST", body: JSON.stringify(input) }),
  reversePayment: (id, reason) =>
    apiRequest(`/payments/${id}/reverse`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  timeline: (id) => apiRequest(`/invoices/${id}/accounting-timeline`),
};
