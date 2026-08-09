import {
  BarChart3,
  Boxes,
  ContactRound,
  FileClock,
  FileText,
  Landmark,
  LayoutDashboard,
  Package,
  ReceiptText,
  Scale,
  Settings,
  Shield,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { PERMISSIONS } from "@/shared/permissions/permissions";

// Navigation follows the ERP document lifecycle from master data to reporting.
// System administration is intentionally kept at the end of the sidebar.
export const NAVIGATION_ITEMS = [
  { id: "overview", label: "Overview", labelKey: "nav.overview", icon: LayoutDashboard },

  // Master data and procurement
  { id: "products", label: "Products", labelKey: "nav.products", icon: Package, permission: PERMISSIONS.PRODUCTS_READ },
  { id: "suppliers", label: "Suppliers", labelKey: "nav.suppliers", icon: Truck, permission: PERMISSIONS.SUPPLIERS_READ },
  { id: "purchases", label: "Purchase orders", labelKey: "nav.purchases", icon: ShoppingCart, permission: PERMISSIONS.PURCHASE_ORDERS_READ },
  { id: "warehouses", label: "Warehouses", labelKey: "nav.warehouses", icon: Warehouse, permission: PERMISSIONS.WAREHOUSES_READ },
  { id: "inventory", label: "Inventory", labelKey: "nav.inventory", icon: Boxes, permission: PERMISSIONS.INVENTORY_READ },

  // Quote-to-cash
  { id: "customers", label: "Customers", labelKey: "nav.customers", icon: ContactRound, permission: PERMISSIONS.CUSTOMERS_READ },
  { id: "quotations", label: "Quotations", labelKey: "nav.quotations", icon: FileText, permission: PERMISSIONS.QUOTATIONS_READ },
  { id: "sales", label: "Sales orders", labelKey: "nav.sales", icon: ReceiptText, permission: PERMISSIONS.SALES_ORDERS_READ },
  { id: "billing", label: "Invoices & payments", labelKey: "nav.billing", icon: Landmark, permission: PERMISSIONS.INVOICES_READ },

  // Financial close and insight
  { id: "accounting", label: "Accounting", labelKey: "nav.accounting", icon: Scale, permission: PERMISSIONS.ACCOUNTS_READ },
  { id: "reports", label: "Reports", labelKey: "nav.reports", icon: BarChart3, permission: PERMISSIONS.REPORTS_PROFIT_READ },

  // System administration
  { id: "users", label: "Users", labelKey: "nav.users", icon: Users, permission: PERMISSIONS.USERS_MANAGE },
  { id: "roles", label: "Roles & permissions", labelKey: "nav.roles", icon: Shield, permission: PERMISSIONS.ROLES_MANAGE },
  { id: "audit", label: "Audit logs", labelKey: "nav.audit", icon: FileClock, permission: PERMISSIONS.AUDIT_READ },
  { id: "settings", label: "Settings", labelKey: "nav.settings", icon: Settings },
];
