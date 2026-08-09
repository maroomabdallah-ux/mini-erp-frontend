import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  FileClock,
  KeyRound,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auditApi } from "@/features/audit/api";
import { useAuth } from "@/features/auth/auth-provider";
import { rolesApi } from "@/features/roles/api";
import { usersApi } from "@/features/users/api";
import { PERMISSIONS, hasPermission } from "@/shared/permissions/permissions";

const ADMIN_AREAS = [
  { name: "Identity management", icon: UsersRound, purpose: "Create accounts, maintain access, and deactivate users safely.", meta: "Users", page: "users" },
  { name: "Roles & permissions", icon: KeyRound, purpose: "Control exactly what every business role can view and change.", meta: "RBAC", page: "roles" },
  { name: "Audit & accountability", icon: FileClock, purpose: "Trace sensitive actions, record changes, users, and source IPs.", meta: "Audit", page: "audit" },
  { name: "System preferences", icon: Settings, purpose: "Manage profile, security credentials, language, and appearance.", meta: "Settings", page: "settings" },
];

export function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  return hasPermission(user, PERMISSIONS.USERS_MANAGE) ? <AdminDashboard user={user} onNavigate={onNavigate} /> : <EmployeeDashboard user={user} />;
}

function AdminDashboard({ user, onNavigate }) {
  const usersQuery = useQuery({ queryKey: ["admin-dashboard-users"], queryFn: () => usersApi.list(1, 100) });
  const rolesQuery = useQuery({ queryKey: ["admin-dashboard-roles"], queryFn: rolesApi.list });
  const auditQuery = useQuery({ queryKey: ["admin-dashboard-audit"], queryFn: () => auditApi.list({ page: 1, size: 8 }) });
  const users = usersQuery.data?.items || [];
  const roles = rolesQuery.data || [];
  const auditEvents = auditQuery.data || [];
  const activeUsers = users.filter((item) => item.is_active).length;
  const inactiveUsers = users.filter((item) => !item.is_active).length;
  const activeRoles = roles.filter((item) => item.is_active).length;

  return <div className="admin-overview">
    <section className="admin-overview-hero">
      <div className="role-overview-image" aria-hidden="true" />
      <div className="admin-hero-copy">
        <div className="admin-command-label"><Sparkles />System administration</div>
        <h1>Good morning, {user.first_name}.</h1>
        <p>Manage identity, access, security, and accountability from one controlled workspace.</p>
        <div className="admin-system-status"><i /><span>All core services operational</span><small>{new Date().toLocaleDateString("en-JO", { weekday: "long", month: "long", day: "numeric" })}</small></div>
      </div>
      <div className="admin-hero-side">
        <div className="admin-hero-pulse admin-security-pulse">
          <span>Security posture</span><strong>Protected</strong><small>RBAC and audit logging are active</small>
          <div className="security-checks"><span><ShieldCheck />Access control</span><span><FileClock />Event tracking</span><span><Database />Database ready</span></div>
        </div>
        <div className="admin-hero-actions"><Button onClick={() => onNavigate("users")}><UsersRound />Manage team</Button><Button variant="outline" onClick={() => onNavigate("roles")}><KeyRound />Access control</Button></div>
      </div>
    </section>

    <section className="admin-overview-metrics">
      <AdminMetric icon={UserRoundCheck} label="Active accounts" value={usersQuery.isLoading ? "—" : activeUsers} detail="Users currently allowed to sign in" />
      <AdminMetric alert={inactiveUsers > 0} icon={UserRoundX} label="Inactive accounts" value={usersQuery.isLoading ? "—" : inactiveUsers} detail="Disabled access retained for history" />
      <AdminMetric icon={KeyRound} label="Active roles" value={rolesQuery.isLoading ? "—" : activeRoles} detail="Permission profiles in operation" />
      <AdminMetric icon={FileClock} label="Recent events" value={auditQuery.isLoading ? "—" : auditEvents.length} detail="Latest recorded system actions" />
    </section>

    <div className="admin-control-grid">
      <section className="admin-activity-panel">
        <header><div><p>Security activity</p><h2>Latest audit events</h2></div><Button variant="ghost" onClick={() => onNavigate("audit")}>View full log<ArrowRight /></Button></header>
        <div>{auditQuery.isLoading ? <div className="admin-panel-state"><div className="loader" /></div> : auditEvents.length === 0 ? <div className="admin-panel-state"><FileClock /><span>No audit events recorded yet.</span></div> : auditEvents.slice(0, 6).map((event) => <article key={event.id}><span><FileClock /></span><div><strong>{formatAction(event.action)}</strong><small>{event.table_name} · {event.user_id ? `User #${event.user_id}` : "System"}</small></div><time>{formatEventTime(event.created_at)}</time></article>)}</div>
      </section>
      <section className="admin-quick-panel">
        <header><p>Administration</p><h2>Quick actions</h2></header>
        <div><QuickAction icon={UserPlus} title="Create or manage users" detail="Maintain team access" onClick={() => onNavigate("users")} /><QuickAction icon={KeyRound} title="Review permissions" detail="Inspect role access" onClick={() => onNavigate("roles")} /><QuickAction icon={FileClock} title="Investigate activity" detail="Open audit history" onClick={() => onNavigate("audit")} /><QuickAction icon={Settings} title="System preferences" detail="Profile and security" onClick={() => onNavigate("settings")} /></div>
      </section>
    </div>

    <section className="admin-role-directory">
      <header><div><p>System administration</p><h2>Control center</h2></div><span>Administrative tools remain separated from operational and financial reporting.</span></header>
      <div>{ADMIN_AREAS.map((workspace) => <AdminArea key={workspace.name} workspace={workspace} onOpen={() => onNavigate(workspace.page)} />)}</div>
    </section>
  </div>;
}

const formatAction = (value) => String(value || "system event").replaceAll("_", " ");
const formatEventTime = (value) => new Date(value).toLocaleString("en-JO", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

function AdminMetric({ icon: Icon, label, value, detail, alert }) {
  return <article className={`admin-metric ${alert ? "alert" : ""}`}><span><Icon /></span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>;
}

function AdminArea({ workspace, onOpen }) {
  const Icon = workspace.icon;
  return <article className="admin-role-row"><span className="admin-role-row-icon"><Icon /></span><div className="admin-role-row-main"><p>{workspace.name}</p><span>{workspace.purpose}</span></div><div className="admin-role-row-tasks"><span>{workspace.meta}</span></div><Badge variant="outline">Available</Badge><Button variant="ghost" size="sm" onClick={onOpen}>Open<ArrowRight /></Button></article>;
}

function QuickAction({ icon: Icon, title, detail, onClick }) {
  return <button className="admin-quick-action" onClick={onClick}><span><Icon /></span><div><strong>{title}</strong><small>{detail}</small></div><ArrowRight /></button>;
}

function EmployeeDashboard({ user }) {
  return <div className="page-stack">
    <div className="dashboard-hero role-dashboard-hero"><div className="role-overview-image" aria-hidden="true" /><div><p className="eyebrow-text">My workspace</p><h1>Welcome, {user.first_name}</h1><p>Your workspace contains the daily operations assigned to your role.</p></div><span className="dashboard-hero-icon"><Activity /></span></div>
    <section className="stats-grid"><div className="stat-card"><span><UserRound /></span><div><p>Account</p><strong className="stat-text">{user.username}</strong></div></div><div className="stat-card"><span className="clay"><CheckCircle2 /></span><div><p>Status</p><strong className="stat-text">Active</strong></div></div><div className="stat-card"><span className="amber"><ShieldCheck /></span><div><p>Access level</p><strong className="stat-text">Standard user</strong></div></div></section>
    <section className="account-card"><div><p className="eyebrow-text">Your access</p><h2>Roles and permissions</h2><p>Access to each area is controlled by the roles assigned to your account.</p></div><div className="access-details"><div><span>Assigned roles</span><div className="role-list">{user.roles?.length ? user.roles.map((role) => <Badge key={role.id} className={role.is_active ? "" : "opacity-60 line-through"}>{role.name}{!role.is_active && " (inactive)"}</Badge>) : <span className="muted">No roles assigned</span>}</div></div><div><span>Available permissions</span><strong>{user.permissions?.length || 0}</strong></div></div></section>
  </div>;
}
