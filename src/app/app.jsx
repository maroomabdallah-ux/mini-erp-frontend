import { useState } from 'react'
import { AuthProvider, useAuth } from '@/features/auth/auth-provider'
import { LoginPage } from '@/features/auth/login-page'
import { UsersPage } from '@/features/users/users-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { RolesPage } from '@/features/roles/roles-page'
import { AuditPage } from '@/features/audit/audit-page'
import { ProductsPage } from '@/features/products/products-page'
import { WarehousesPage } from '@/features/warehouses/warehouses-page'
import { AppShell } from '@/components/layout/app-shell'
import { PERMISSIONS, hasPermission } from '@/shared/permissions/permissions'

const pages = {
  overview: { component: DashboardPage },
  users: { component: UsersPage, permission: PERMISSIONS.USERS_MANAGE },
  roles: { component: RolesPage, permission: PERMISSIONS.ROLES_MANAGE },
  audit: { component: AuditPage, permission: PERMISSIONS.AUDIT_READ },
  products: { component: ProductsPage, permission: PERMISSIONS.PRODUCTS_READ },
  warehouses: { component: WarehousesPage, permission: PERMISSIONS.WAREHOUSES_READ },
}

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('overview')
  if (loading) return <div className="grid min-h-screen place-items-center bg-muted/40"><div className="loader" /></div>
  if (!user) return <LoginPage />
  const requestedPage = pages[page] || pages.overview
  const safePage = hasPermission(user, requestedPage.permission) ? page : 'overview'
  const PageComponent = pages[safePage].component
  return <AppShell currentPage={safePage} onNavigate={setPage}>
    <PageComponent />
  </AppShell>
}
export function App() { return <AuthProvider><AppContent /></AuthProvider> }
