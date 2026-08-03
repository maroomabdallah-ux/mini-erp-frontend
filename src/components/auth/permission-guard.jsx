import { useAuth } from '@/features/auth/auth-provider'
import { hasPermission } from '@/shared/permissions/permissions'

export function PermissionGuard({ permission, children, fallback = null }) {
  const { user } = useAuth()
  return hasPermission(user, permission) ? children : fallback
}
