import { lazy, Suspense, useState } from "react";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import { LoginPage } from "@/features/auth/login-page";
import { AppShell } from "@/components/layout/app-shell";
import { PERMISSIONS, hasPermission } from "@/shared/permissions/permissions";
import { PreferencesProvider } from "@/shared/preferences/preferences-provider";
import { PublicSite } from "@/features/public/public-site";

const page = (loader, name) =>
  lazy(() => loader().then((module) => ({ default: module[name] })));
const DashboardPage = page(
  () => import("@/features/dashboard/dashboard-page"),
  "DashboardPage",
);
const UsersPage = page(
  () => import("@/features/users/users-page"),
  "UsersPage",
);
const RolesPage = page(
  () => import("@/features/roles/roles-page"),
  "RolesPage",
);
const AuditPage = page(
  () => import("@/features/audit/audit-page"),
  "AuditPage",
);
const ProductsPage = page(
  () => import("@/features/products/products-page"),
  "ProductsPage",
);
const SuppliersPage = page(
  () => import("@/features/suppliers/suppliers-page"),
  "SuppliersPage",
);
const PurchaseOrdersPage = page(
  () => import("@/features/purchases/purchase-orders-page"),
  "PurchaseOrdersPage",
);
const CustomersPage = page(
  () => import("@/features/customers/customers-page"),
  "CustomersPage",
);
const QuotationsPage = page(
  () => import("@/features/quotations/quotations-page"),
  "QuotationsPage",
);
const SalesOrdersPage = page(
  () => import("@/features/sales/sales-orders-page"),
  "SalesOrdersPage",
);
const BillingPage = page(
  () => import("@/features/billing/billing-page"),
  "BillingPage",
);
const AccountingPage = page(
  () => import("@/features/accounting/accounting-page"),
  "AccountingPage",
);
const ReportsPage = page(
  () => import("@/features/reports/reports-page"),
  "ReportsPage",
);
const WarehousesPage = page(
  () => import("@/features/warehouses/warehouses-page"),
  "WarehousesPage",
);
const InventoryPage = page(
  () => import("@/features/inventory/inventory-page"),
  "InventoryPage",
);
const SettingsPage = page(
  () => import("@/features/settings/settings-page"),
  "SettingsPage",
);

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
  reports: {
    component: ReportsPage,
    permission: PERMISSIONS.REPORTS_PROFIT_READ,
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
  const [publicPage, setPublicPage] = useState("home");
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <div className="loader" />
      </div>
    );
  if (!user) {
    if (publicPage === "login") return <LoginPage onBack={() => setPublicPage("home")} />;
    return <PublicSite page={publicPage} onNavigate={setPublicPage} />;
  }
  const requestedPage = pages[page] || pages.overview;
  const safePage = hasPermission(user, requestedPage.permission)
    ? page
    : "overview";
  const PageComponent = pages[safePage].component;
  return (
    <AppShell currentPage={safePage} onNavigate={setPage}>
      <Suspense
        fallback={
          <div className="grid min-h-[50vh] place-items-center">
            <div className="loader" />
          </div>
        }
      >
        <PageComponent onNavigate={setPage} />
      </Suspense>
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
