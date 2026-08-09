import { apiRequest } from "@/shared/api/api-client";

const query = (values) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(
    ([key, value]) => value && params.set(key, value),
  );
  return params.toString();
};

export const reportsApi = {
  dashboard: () => apiRequest("/reports/dashboard"),
  profit: (dateFrom, dateTo) =>
    apiRequest(
      `/reports/profit?${query({ date_from: dateFrom, date_to: dateTo })}`,
    ),
  topProducts: (dateFrom, dateTo) =>
    apiRequest(
      `/reports/top-products?${query({ date_from: dateFrom, date_to: dateTo })}`,
    ),
  valuation: () => apiRequest("/reports/inventory-valuation"),
  aging: (asOf) =>
    apiRequest(`/reports/receivables-aging?${query({ as_of: asOf })}`),
  monthlySales: (months = 12) =>
    apiRequest(`/reports/monthly-sales?months=${months}`),
  stockMovements: ({ productId, warehouseId, dateFrom, dateTo }) =>
    apiRequest(
      `/reports/stock-movements?${query({ product_id: productId, warehouse_id: warehouseId, date_from: dateFrom, date_to: dateTo })}`,
    ),
};
