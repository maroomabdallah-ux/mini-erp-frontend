import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserRound,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { usersApi } from "@/features/users/api";
import { rolesApi } from "@/features/roles/api";
import { inventoryApi } from "@/features/inventory/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERMISSIONS, hasPermission } from "@/shared/permissions/permissions";

const ROLE_WORKSPACES = [
  {
    name: "Purchasing Officer",
    role: "purchasing_officer",
    icon: ShoppingCart,
    tone: "violet",
    purpose: "Build the catalog and procure goods from approved suppliers.",
    responsibilities: ["Products and categories", "Suppliers", "Purchase orders"],
    available: ["Product catalog", "Supplier directory"],
    page: "suppliers",
  },
  {
    name: "Sales Officer",
    role: "sales_officer",
    icon: Store,
    tone: "blue",
    purpose: "Manage customers and move demand from quotation to sale.",
    responsibilities: ["Customers", "Quotations", "Sales orders"],
    available: ["Customer directory", "Quotation workspace"],
    page: "quotations",
  },
  {
    name: "Warehouse Keeper",
    role: "warehouse_keeper",
    icon: Warehouse,
    tone: "amber",
    purpose: "Control physical stock and record every warehouse operation.",
    responsibilities: ["Goods receipts", "Transfers", "Physical counts"],
    available: ["Warehouses", "Inventory operations"],
    page: "inventory",
  },
  {
    name: "Accountant",
    role: "accountant",
    icon: ReceiptText,
    tone: "rose",
    purpose: "Control financial records, payments, invoices, and statements.",
    responsibilities: ["Chart of accounts", "Invoices", "Payments and reports"],
    available: ["Inventory valuation visibility"],
    page: "inventory",
  },
  {
    name: "Manager",
    role: "manager",
    icon: ClipboardCheck,
    tone: "emerald",
    purpose: "Approve controlled operations and monitor business performance.",
    responsibilities: ["Purchase approvals", "Count approvals", "Management reports"],
    available: ["Physical count approval", "Low-stock monitoring"],
    page: "inventory",
  },
];

export function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const isAdministrator = hasPermission(user, PERMISSIONS.USERS_MANAGE);
  return isAdministrator ? (
    <AdminDashboard user={user} onNavigate={onNavigate} />
  ) : (
    <EmployeeDashboard user={user} />
  );
}

function AdminDashboard({ user, onNavigate }) {
  const usersQuery = useQuery({
    queryKey: ["admin-dashboard-users"],
    queryFn: () => usersApi.list(1, 100),
  });
  const rolesQuery = useQuery({
    queryKey: ["admin-dashboard-roles"],
    queryFn: rolesApi.list,
  });
  const lowStockQuery = useQuery({
    queryKey: ["inventory-low-stock"],
    queryFn: inventoryApi.lowStock,
  });
  const users = usersQuery.data?.items || [];
  const roles = rolesQuery.data || [];
  const lowStock = lowStockQuery.data?.items || lowStockQuery.data || [];
  const activeUsers = users.filter((item) => item.is_active).length;
  const activeRoles = roles.filter((item) => item.is_active && item.name !== "admin");

  return (
    <div className="admin-overview">
      <section className="admin-overview-hero">
        <div>
          <div className="admin-command-label"><ShieldCheck />Administrator workspace</div>
          <h1>One clear view of the business</h1>
          <p>Monitor ownership and follow the operational journey without opening every module.</p>
        </div>
        <div className="admin-hero-actions">
          <Button onClick={() => onNavigate("users")}><UsersRound />Manage team</Button>
          <Button variant="outline" onClick={() => onNavigate("roles")}><KeyRound />Access control</Button>
        </div>
      </section>

      <section className="admin-overview-metrics">
        <AdminMetric icon={UsersRound} label="Active users" value={usersQuery.isLoading ? "—" : activeUsers} detail="People with system access" />
        <AdminMetric icon={ShieldCheck} label="Business roles" value={rolesQuery.isLoading ? "—" : activeRoles.length} detail="Defined operational ownership" />
        <AdminMetric alert={lowStock.length > 0} icon={PackageSearch} label="Needs attention" value={lowStockQuery.isLoading ? "—" : lowStock.length} detail="Products currently below threshold" />
      </section>

      <section className="admin-tracking-panel">
        <header>
          <div><p>Process tracking</p><h2>Product-to-stock journey</h2><span>The procurement workflow is live from supplier order through approval, receiving, and warehouse stock.</span></div>
          <Badge>Procurement flow</Badge>
        </header>
        <div className="admin-process-track">
          <ProcessStep done number="01" title="Product" detail="Catalog record created" action="Open products" onClick={() => onNavigate("products")} />
          <ProcessStep done number="02" title="Supplier" detail="Approved partner selected" action="Open suppliers" onClick={() => onNavigate("suppliers")} />
          <ProcessStep done number="03" title="Purchase order" detail="Procurement workflow ready" action="Open purchase orders" onClick={() => onNavigate("purchases")} />
          <ProcessStep done number="04" title="Manager approval" detail="Controlled approval ready" action="Open purchase orders" onClick={() => onNavigate("purchases")} />
          <ProcessStep done number="05" title="Goods receipt" detail="Warehouse receiving ready" action="Open purchase orders" onClick={() => onNavigate("purchases")} />
          <ProcessStep done number="06" title="Warehouse stock" detail="Inventory foundation ready" action="Open inventory" onClick={() => onNavigate("inventory")} />
        </div>
      </section>

      <section className="admin-role-directory">
        <header><div><p>Role ownership</p><h2>Who controls each operation?</h2></div><Button variant="ghost" onClick={() => onNavigate("roles")}>Manage permissions<ArrowRight /></Button></header>
        <div>{ROLE_WORKSPACES.map((workspace) => {
          const role = roles.find((item) => item.name === workspace.role);
          return <RoleRow key={workspace.role} workspace={workspace} role={role} onOpen={() => onNavigate(workspace.page)} />;
        })}</div>
      </section>
    </div>
  );
}

function AdminMetric({ icon: Icon, label, value, detail, alert }) {
  return <article className={`admin-metric ${alert ? "alert" : ""}`}><span><Icon /></span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>;
}

function RoleRow({ workspace, role, onOpen }) {
  const Icon = workspace.icon;
  return <article className={`admin-role-row ${workspace.tone}`}><span className="admin-role-row-icon"><Icon /></span><div className="admin-role-row-main"><p>{workspace.name}</p><span>{workspace.purpose}</span></div><div className="admin-role-row-tasks">{workspace.responsibilities.map((item) => <span key={item}>{item}</span>)}</div><Badge variant="outline">{role?.is_active === false ? "Inactive" : "Active"}</Badge><Button variant="ghost" size="sm" onClick={onOpen}>Open<ArrowRight /></Button></article>;
}

function ProcessStep({ done, current, number, title, detail, action, onClick }) {
  return <article className={`admin-process-step ${done ? "done" : ""} ${current ? "current" : ""}`}><div><span>{done ? <CheckCircle2 /> : number}</span><i /></div><strong>{title}</strong><small>{detail}</small>{action ? <button onClick={onClick}>{action}<ArrowRight /></button> : <em>{current ? "Next to build" : "Planned"}</em>}</article>;
}

function EmployeeDashboard({ user }) {
  return <div className="page-stack">
    <div className="dashboard-hero"><div><p className="eyebrow-text">My workspace</p><h1>Welcome, {user.first_name}</h1><p>Your workspace contains the daily operations assigned to your role.</p></div><span className="dashboard-hero-icon"><Activity /></span></div>
    <section className="stats-grid">
      <div className="stat-card"><span><UserRound /></span><div><p>Account</p><strong className="stat-text">{user.username}</strong></div></div>
      <div className="stat-card"><span className="clay"><CheckCircle2 /></span><div><p>Status</p><strong className="stat-text">Active</strong></div></div>
      <div className="stat-card"><span className="amber"><ShieldCheck /></span><div><p>Access level</p><strong className="stat-text">Standard user</strong></div></div>
    </section>
    <section className="account-card"><div><p className="eyebrow-text">Your access</p><h2>Roles and permissions</h2><p>Access to each area is controlled by the roles assigned to your account.</p></div><div className="access-details"><div><span>Assigned roles</span><div className="role-list">{user.roles?.length ? user.roles.map((role) => <Badge key={role.id} className={role.is_active ? "" : "opacity-60 line-through"}>{role.name}{!role.is_active && " (inactive)"}</Badge>) : <span className="muted">No roles assigned</span>}</div></div><div><span>Available permissions</span><strong>{user.permissions?.length || 0}</strong></div></div></section>
  </div>;
}
