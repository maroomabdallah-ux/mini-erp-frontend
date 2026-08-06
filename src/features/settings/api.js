import { apiRequest } from "@/shared/api/api-client";

export const settingsApi = {
  updateProfile: (input) =>
    apiRequest("/auth/me", { method: "PUT", body: JSON.stringify(input) }),
  changePassword: (input) =>
    apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  sales: () => apiRequest("/system-settings/sales"),
  updateSales: (input) =>
    apiRequest("/system-settings/sales", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
