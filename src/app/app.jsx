import { useState } from "react";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import { LoginPage } from "@/features/auth/login-page";
import { UsersPage } from "@/features/users/users-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { RolesPage } from "@/features/roles/roles-page";
import { AuditPage } from "@/features/audit/audit-page";
import { ProductsPage } from "@/features/products/products-page";
import { SuppliersPage } from "@/features/suppliers/suppliers-page";
import { PurchaseOrdersPage } from "@/features/purchases/purchase-orders-page";
import { CustomersPage } from "@/features/customers/customers-page";
import { QuotationsPage } from "@/features/quotations/quotations-page";
import { SalesOrdersPage } from "@/features/sales/sales-orders-page";
import { BillingPage } from "@/features/billing/billing-page";
import { AccountingPage } from "@/features/accounting/accounting-page";
import { WarehousesPage } from "@/features/warehouses/warehouses-page";
import { InventoryPage } from "@/features/inventory/inventory-page";
import { SettingsPage } from "@/features/settings/settings-page";
import { AppShell } from "@/components/layout/app-shell";
import { PERMISSIONS, hasPermission } from "@/shared/permissions/permissions";
import { PreferencesProvider } from "@/shared/preferences/preferences-provider";

const pages = {
  overview: { component: DashboardPage },
  users: { component: UsersPage, permission: PERMISSIONS.USERS_MANAGE },
  roles: { component: RolesPage, permission: PERMISSIONS.ROLES_MANAGE },
  audit: { component: AuditPage, permission: PERMISSIONS.AUDIT_READ },
  products: { component: ProductsPage, permission: PERMISSIONS.PRODUCTS_READ },
  suppliers: {
    component: SuppliersPage,
    permission: PERMISSIONS.SUPPLIERS_READ,
  },
  purchases: {
    component: PurchaseOrdersPage,
    permission: PERMISSIONS.PURCHASE_ORDERS_READ,
  },
  customers: {
    component: CustomersPage,
    permission: PERMISSIONS.CUSTOMERS_READ,
  },
  quotations: {
    component: QuotationsPage,
    permission: PERMISSIONS.QUOTATIONS_READ,
  },
  sales: {
    component: SalesOrdersPage,
    permission: PERMISSIONS.SALES_ORDERS_READ,
  },
  billing: {
    component: BillingPage,
    permission: PERMISSIONS.INVOICES_READ,
  },
  accounting: {
    component: AccountingPage,
    permission: PERMISSIONS.ACCOUNTS_READ,
  },
  warehouses: {
    component: WarehousesPage,
    permission: PERMISSIONS.WAREHOUSES_READ,
  },
  inventory: {
    component: InventoryPage,
    permission: PERMISSIONS.INVENTORY_READ,
  },
  settings: { component: SettingsPage },
};

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("overview");
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <div className="loader" />
      </div>
    );
  if (!user) return <LoginPage />;
  const requestedPage = pages[page] || pages.overview;
  const safePage = hasPermission(user, requestedPage.permission)
    ? page
    : "overview";
  const PageComponent = pages[safePage].component;
  return (
    <AppShell currentPage={safePage} onNavigate={setPage}>
      <PageComponent onNavigate={setPage} />
    </AppShell>
  );
}
export function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PreferencesProvider>
  );
}
