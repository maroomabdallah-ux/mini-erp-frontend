export const PERMISSIONS = Object.freeze({
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  AUDIT_READ: 'audit.read',
  PRODUCTS_READ: 'products.read',
  PRODUCTS_MANAGE: 'products.manage',
})

export function hasPermission(user, permission) {
  if (!permission) return true
  return user?.permissions?.includes(permission) ?? false
}
