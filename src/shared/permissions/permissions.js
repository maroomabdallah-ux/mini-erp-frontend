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
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_MANAGE: 'customers.manage',
  QUOTATIONS_READ: 'quotations.read',
  QUOTATIONS_MANAGE: 'quotations.manage',
  PURCHASE_ORDERS_READ: 'purchase_orders.read',
  PURCHASE_ORDERS_CREATE: 'purchase_orders.create',
  PURCHASE_ORDERS_UPDATE: 'purchase_orders.update',
  PURCHASE_ORDERS_APPROVE: 'purchase_orders.approve',
  PURCHASE_ORDERS_CANCEL: 'purchase_orders.cancel',
  GOODS_RECEIPTS_READ: 'goods_receipts.read',
  GOODS_RECEIPTS_CREATE: 'goods_receipts.create',
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
