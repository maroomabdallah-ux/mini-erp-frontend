import { Boxes, FileClock, LayoutDashboard, Package, Settings, Shield, Users, Warehouse } from 'lucide-react'
import { PERMISSIONS } from '@/shared/permissions/permissions'

export const NAVIGATION_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users, permission: PERMISSIONS.USERS_MANAGE },
  { id: 'roles', label: 'Roles & permissions', icon: Shield, permission: PERMISSIONS.ROLES_MANAGE },
  { id: 'audit', label: 'Audit logs', icon: FileClock, permission: PERMISSIONS.AUDIT_READ },
  { id: 'products', label: 'Products', icon: Package, permission: PERMISSIONS.PRODUCTS_READ },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse, permission: PERMISSIONS.WAREHOUSES_READ },
  { id: 'inventory', label: 'Inventory', icon: Boxes, disabled: true },
  { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
]
