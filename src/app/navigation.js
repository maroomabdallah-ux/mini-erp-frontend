import { Boxes, ContactRound, FileClock, FileText, LayoutDashboard, Package, Settings, Shield, ShoppingCart, Truck, Users, Warehouse } from 'lucide-react'
import { PERMISSIONS } from '@/shared/permissions/permissions'

export const NAVIGATION_ITEMS = [
  { id: 'overview', label: 'Overview', labelKey: 'nav.overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', labelKey: 'nav.users', icon: Users, permission: PERMISSIONS.USERS_MANAGE },
  { id: 'roles', label: 'Roles & permissions', labelKey: 'nav.roles', icon: Shield, permission: PERMISSIONS.ROLES_MANAGE },
  { id: 'audit', label: 'Audit logs', labelKey: 'nav.audit', icon: FileClock, permission: PERMISSIONS.AUDIT_READ },
  { id: 'products', label: 'Products', labelKey: 'nav.products', icon: Package, permission: PERMISSIONS.PRODUCTS_READ },
  { id: 'suppliers', label: 'Suppliers', labelKey: 'nav.suppliers', icon: Truck, permission: PERMISSIONS.SUPPLIERS_READ },
  { id: 'purchases', label: 'Purchase orders', labelKey: 'nav.purchases', icon: ShoppingCart, permission: PERMISSIONS.PURCHASE_ORDERS_READ },
  { id: 'customers', label: 'Customers', labelKey: 'nav.customers', icon: ContactRound, permission: PERMISSIONS.CUSTOMERS_READ },
  { id: 'quotations', label: 'Quotations', labelKey: 'nav.quotations', icon: FileText, permission: PERMISSIONS.QUOTATIONS_READ },
  { id: 'warehouses', label: 'Warehouses', labelKey: 'nav.warehouses', icon: Warehouse, permission: PERMISSIONS.WAREHOUSES_READ },
  { id: 'inventory', label: 'Inventory', labelKey: 'nav.inventory', icon: Boxes, permission: PERMISSIONS.INVENTORY_READ },
  { id: 'settings', label: 'Settings', labelKey: 'nav.settings', icon: Settings },
]
