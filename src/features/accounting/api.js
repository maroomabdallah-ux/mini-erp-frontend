import { apiRequest } from "@/shared/api/api-client";

export const accountingApi = {
  accounts: () => apiRequest("/accounts"),
  createAccount: (input) =>
    apiRequest("/accounts", { method: "POST", body: JSON.stringify(input) }),
  updateAccount: (id, input) =>
    apiRequest(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  dashboard: () => apiRequest("/accounting/dashboard"),
  entries: ({
    page = 1,
    size = 50,
    search = "",
    dateFrom = "",
    dateTo = "",
    accountId = "",
    sourceType = "",
  } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.set("search", search);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (accountId) params.set("account_id", accountId);
    if (sourceType) params.set("source_type", sourceType);
    return apiRequest(`/journal-entries?${params}`);
  },
  entry: (id) => apiRequest(`/journal-entries/${id}`),
  createEntry: (input) =>
    apiRequest("/journal-entries", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  supplierPayments: () => apiRequest("/supplier-payments"),
  supplierOutstanding: () => apiRequest("/supplier-outstanding"),
  recordSupplierPayment: (input) =>
    apiRequest("/supplier-payments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  statement: (type, id, from, to) =>
    apiRequest(`/accounting/${type}-statement/${id}?from=${from}&to=${to}`),
  salesSettings: () => apiRequest("/system-settings/sales"),
  updateSalesSettings: (input) =>
    apiRequest("/system-settings/sales", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
