export const PERMISSIONS = Object.freeze({
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  AUDIT_READ: 'audit.read',
  PRODUCTS_READ: 'products.read',
  PRODUCTS_MANAGE: 'products.manage',
  WAREHOUSES_READ: 'warehouses.read',
  WAREHOUSES_MANAGE: 'warehouses.manage',
  SUPPLIERS_READ: 'suppliers.read',
  SUPPLIERS_MANAGE: 'suppliers.manage',
  INVENTORY_READ: 'inventory.read',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_TRANSFER: 'inventory.transfer',
  INVENTORY_COUNT: 'inventory.count',
  INVENTORY_COUNT_APPROVE: 'inventory.count.approve',
  INVENTORY_LOW_STOCK_READ: 'inventory.low_stock.read',
})

export function hasPermission(user, permission) {
  if (!permission) return true
  return user?.permissions?.includes(permission) ?? false
}
