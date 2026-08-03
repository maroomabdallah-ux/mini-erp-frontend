import { Activity, CheckCircle2, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-provider'
import { Badge } from '@/components/ui/badge'
import { PERMISSIONS, hasPermission } from '@/shared/permissions/permissions'

export function DashboardPage() {
  const { user } = useAuth()
  const isAdministrator = hasPermission(user, PERMISSIONS.USERS_MANAGE)

  return <div className="page-stack">
    <div className="dashboard-hero">
      <div><p className="eyebrow-text">Workspace overview</p><h1>Welcome, {user.first_name}</h1><p>Your account is ready. Use the navigation to access the areas available to you.</p></div>
      <span className="dashboard-hero-icon"><Activity /></span>
    </div>
    <section className="stats-grid">
      <div className="stat-card"><span><UserRound /></span><div><p>Account</p><strong className="stat-text">{user.username}</strong></div></div>
      <div className="stat-card"><span className="clay"><CheckCircle2 /></span><div><p>Status</p><strong className="stat-text">Active</strong></div></div>
      <div className="stat-card"><span className="amber"><ShieldCheck /></span><div><p>Access level</p><strong className="stat-text">{isAdministrator ? 'Administrator' : 'Standard user'}</strong></div></div>
    </section>
    <section className="account-card">
      <div><p className="eyebrow-text">Your access</p><h2>Roles and permissions</h2><p>Access to each area is controlled by the roles assigned to your account.</p></div>
      <div className="access-details"><div><span>Assigned roles</span><div className="role-list">{user.roles?.length ? user.roles.map((role) => <Badge key={role.id} className={role.is_active ? '' : 'opacity-60 line-through'}>{role.name}{!role.is_active && ' (inactive)'}</Badge>) : <span className="muted">No roles assigned</span>}</div></div><div><span>Available permissions</span><strong>{user.permissions?.length || 0}</strong></div></div>
    </section>
  </div>
}
