import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  BookOpen,
  Building2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Landmark,
  Package,
  Plus,
  Receipt,
  Scale,
  Search,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { customersApi } from "@/features/customers/api";
import { purchasesApi } from "@/features/purchases/api";
import { suppliersApi } from "@/features/suppliers/api";
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import {
  consumeDocumentTarget,
  openDocument,
} from "@/shared/navigation/document-target";
import { accountingApi } from "./api";

const today = () => new Date().toISOString().slice(0, 10);
const yearStart = () => `${new Date().getFullYear()}-01-01`;
const money = (value) =>
  new Intl.NumberFormat("en-JO", { style: "currency", currency: "JOD" }).format(
    Number(value || 0),
  );
const TYPE_LABELS = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  revenue: "Revenue",
  expense: "Expenses",
};
const SOURCE_LABELS = {
  sales_invoice: "Invoice",
  credit_note: "Credit note",
  customer_payment: "Payment",
  customer_payment_reversal: "Payment reversal",
  goods_receipt: "Goods receipt",
  supplier_payment: "Supplier payment",
  supplier_payment_reversal: "Supplier payment reversal",
};

export function AccountingPage({ onNavigate }) {
  const { user } = useAuth();
  const [documentTarget] = useState(() => consumeDocumentTarget("accounting"));
  const [tab, setTab] = useState(() =>
    documentTarget?.kind === "journal"
      ? "journals"
      : documentTarget
        ? "payments"
        : "overview",
  );
  const canManage = hasPermission(user, PERMISSIONS.ACCOUNTS_MANAGE);
  const tabs = [
    ["overview", "Dashboard"],
    ["journals", "Journal entries"],
    ["accounts", "Chart of accounts"],
    ["payments", "Supplier payments"],
    ["statements", "Statements"],
  ];
  return (
    <div className="accounting-page">
      <section className="accounting-hero">
        <div>
          <p>Financial control</p>
          <h1>Accounting</h1>
          <span>
            Live balances with a traceable path back to every source document.
          </span>
        </div>
        <Scale />
      </section>
      <div className="accounting-tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "overview" && <AccountingDashboard onOpen={setTab} />}
      {tab === "journals" && (
        <Journals
          canManage={canManage}
          onNavigate={onNavigate}
          initialEntryId={
            documentTarget?.kind === "journal" ? documentTarget.id : null
          }
        />
      )}
      {tab === "accounts" && <Accounts canManage={canManage} />}
      {tab === "payments" && <SupplierPayments />}
      {tab === "statements" && <Statements />}
    </div>
  );
}

function AccountingDashboard({ onOpen }) {
  const query = useQuery({
    queryKey: ["accounting-dashboard"],
    queryFn: accountingApi.dashboard,
  });
  const cards = [
    ["Cash", "cash", Banknote, "cash"],
    ["Bank", "bank", Landmark, "bank"],
    ["Accounts Receivable", "accounts_receivable", WalletCards, "receivable"],
    ["Accounts Payable", "accounts_payable", Receipt, "payable"],
    ["Inventory Value", "inventory_value", Package, "inventory"],
    ["Profit This Month", "profit_this_month", TrendingUp, "profit"],
  ];
  return (
    <section className="accounting-dashboard">
      {cards.map(([label, key, Icon, tone]) => (
        <article key={key} className={`tone-${tone}`}>
          <span>
            <Icon />
          </span>
          <div>
            <small>{label}</small>
            <strong>{query.isLoading ? "—" : money(query.data?.[key])}</strong>
          </div>
        </article>
      ))}
      <button
        className="accounting-dashboard-link"
        onClick={() => onOpen("journals")}
      >
        Review journal activity <ChevronRight />
      </button>
    </section>
  );
}

function Journals({ canManage, onNavigate, initialEntryId }) {
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    accountId: "",
    sourceType: "",
  });
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(initialEntryId);
  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: accountingApi.accounts,
  });
  const entries = useQuery({
    queryKey: ["journal-entries", filters],
    queryFn: () => accountingApi.entries(filters),
  });
  const detail = useQuery({
    queryKey: ["journal-entry", selectedId],
    queryFn: () => accountingApi.entry(selectedId),
    enabled: Boolean(selectedId),
  });
  return (
    <section className="accounting-panel journal-register">
      <header>
        <div>
          <Landmark />
          <div>
            <h2>Journal Entries</h2>
            <p>
              System-generated entries are shown first. Manual posting is an
              exception.
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setManualOpen(true)}
          >
            <Plus />
            Manual Journal Entry
          </Button>
        )}
      </header>
      <div className="journal-filters">
        <div className="search-box">
          <Search />
          <Input
            placeholder="Search reference or description..."
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
          />
        </div>
        <Input
          type="date"
          aria-label="Date from"
          value={filters.dateFrom}
          onChange={(event) =>
            setFilters({ ...filters, dateFrom: event.target.value })
          }
        />
        <Input
          type="date"
          aria-label="Date to"
          value={filters.dateTo}
          onChange={(event) =>
            setFilters({ ...filters, dateTo: event.target.value })
          }
        />
        <select
          className="form-select"
          value={filters.accountId}
          onChange={(event) =>
            setFilters({ ...filters, accountId: event.target.value })
          }
        >
          <option value="">All accounts</option>
          {accounts.data?.map((account) => (
            <option key={account.id} value={account.id}>
              {account.code} — {account.name}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={filters.sourceType}
          onChange={(event) =>
            setFilters({ ...filters, sourceType: event.target.value })
          }
        >
          <option value="">All sources</option>
          {Object.entries(SOURCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="journal-register-table">
        <div className="head">
          <span>Reference</span>
          <span>Date</span>
          <span>Source document</span>
          <span>Amount</span>
          <span />
        </div>
        {entries.data?.items.map((entry) => (
          <button key={entry.id} onClick={() => setSelectedId(entry.id)}>
            <strong>{entry.number}</strong>
            <span>{entry.entry_date}</span>
            <span>
              <small>{SOURCE_LABELS[entry.source_type] || "Manual"}</small>
              <b>{entry.source_reference}</b>
            </span>
            <strong>{money(entry.total_amount)}</strong>
            <ChevronRight />
          </button>
        ))}
      </div>
      <ManualEntryDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        accounts={accounts.data}
      />
      <JournalDetail
        entry={detail.data}
        open={Boolean(selectedId)}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onNavigate={onNavigate}
      />
    </section>
  );
}

function ManualEntryDialog({ open, onOpenChange, accounts }) {
  const client = useQueryClient();
  const [form, setForm] = useState({
    entry_date: today(),
    description: "",
    debit_account: "",
    credit_account: "",
    amount: "",
  });
  const create = useMutation({
    mutationFn: accountingApi.createEntry,
    onSuccess: () => {
      toast.success("Balanced journal entry posted");
      client.invalidateQueries({ queryKey: ["journal-entries"] });
      client.invalidateQueries({ queryKey: ["accounting-dashboard"] });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const submit = (event) => {
    event.preventDefault();
    create.mutate({
      entry_date: form.entry_date,
      description: form.description,
      lines: [
        {
          account_id: Number(form.debit_account),
          debit: form.amount,
          credit: "0",
        },
        {
          account_id: Number(form.credit_account),
          debit: "0",
          credit: form.amount,
        },
      ],
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Journal Entry</DialogTitle>
          <DialogDescription>
            Use only for adjustments that do not originate from an ERP document.
          </DialogDescription>
        </DialogHeader>
        <form className="dialog-form" onSubmit={submit}>
          <Field label="Date">
            <Input
              type="date"
              value={form.entry_date}
              onChange={(event) =>
                setForm({ ...form, entry_date: event.target.value })
              }
              required
            />
          </Field>
          <Field label="Description">
            <Input
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              required
            />
          </Field>
          <div className="form-grid">
            <Field label="Debit account">
              <AccountSelect
                accounts={accounts}
                value={form.debit_account}
                onChange={(value) => setForm({ ...form, debit_account: value })}
              />
            </Field>
            <Field label="Credit account">
              <AccountSelect
                accounts={accounts}
                value={form.credit_account}
                onChange={(value) =>
                  setForm({ ...form, credit_account: value })
                }
              />
            </Field>
          </div>
          <Field label="Amount">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: event.target.value })
              }
              required
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={create.isPending}>Post balanced entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function JournalDetail({ entry, open, onOpenChange, onNavigate }) {
  if (!entry) return null;
  const debits = entry.lines.filter((line) => Number(line.debit) > 0);
  const credits = entry.lines.filter((line) => Number(line.credit) > 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry.number}</DialogTitle>
          <DialogDescription>
            {entry.entry_date} · {entry.description}
          </DialogDescription>
        </DialogHeader>
        <div className="journal-detail-side debit">
          <header>
            <span>Debit</span>
            <strong>{money(entry.total_amount)}</strong>
          </header>
          {debits.map((line) => (
            <div key={line.id}>
              <span>
                <b>{line.account.name}</b>
                <small>{line.account.code}</small>
              </span>
              <strong>{money(line.debit)}</strong>
            </div>
          ))}
        </div>
        <div className="journal-detail-side credit">
          <header>
            <span>Credit</span>
            <strong>{money(entry.total_amount)}</strong>
          </header>
          {credits.map((line) => (
            <div key={line.id}>
              <span>
                <b>{line.account.name}</b>
                <small>{line.account.code}</small>
              </span>
              <strong>{money(line.credit)}</strong>
            </div>
          ))}
        </div>
        <div className="journal-source">
          <span>
            <small>Generated from</small>
            <strong>{entry.source_reference}</strong>
          </span>
          {entry.source_route && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openDocument(onNavigate, {
                  route: entry.source_route,
                  id: entry.source_document_id,
                  kind:
                    entry.source_route === "accounting"
                      ? "supplier-payment"
                      : entry.source_route === "purchases"
                        ? "purchase-order"
                        : "invoice",
                })
              }
            >
              Open source document <ChevronRight />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Accounts({ canManage }) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: accountingApi.accounts,
  });
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "asset",
    parent_id: "",
  });
  const create = useMutation({
    mutationFn: accountingApi.createAccount,
    onSuccess: () => {
      toast.success("Account created");
      setForm({ code: "", name: "", type: "asset", parent_id: "" });
      client.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const grouped = useMemo(
    () =>
      Object.keys(TYPE_LABELS).map((type) => [
        type,
        query.data?.filter((account) => account.type === type) || [],
      ]),
    [query.data],
  );
  return (
    <section className="accounting-panel">
      <header>
        <div>
          <BookOpen />
          <div>
            <h2>Chart of Accounts</h2>
            <p>Protected system accounts and their user-defined children.</p>
          </div>
        </div>
        <span>{query.data?.length || 0} accounts</span>
      </header>
      {canManage && (
        <form
          className="accounting-inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate({
              ...form,
              parent_id: form.parent_id ? Number(form.parent_id) : null,
            });
          }}
        >
          <Field label="Code">
            <Input
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
              required
            />
          </Field>
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </Field>
          <Field label="Type">
            <select
              className="form-select"
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value, parent_id: "" })
              }
            >
              {Object.keys(TYPE_LABELS).map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Parent">
            <select
              className="form-select"
              value={form.parent_id}
              onChange={(event) =>
                setForm({ ...form, parent_id: event.target.value })
              }
            >
              <option value="">Type root</option>
              {query.data
                ?.filter((account) => account.type === form.type)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} — {account.name}
                  </option>
                ))}
            </select>
          </Field>
          <Button>
            <Plus />
            Add account
          </Button>
        </form>
      )}
      <div className="account-tree">
        {grouped.map(([type, accounts]) => (
          <section key={type}>
            <header>
              <span className={`account-type-icon ${type}`}>
                <Building2 />
              </span>
              <strong>{TYPE_LABELS[type]}</strong>
              <small>{accounts.length}</small>
            </header>
            <div>
              {accounts
                .filter((account) => !account.parent_id)
                .map((account) => (
                  <AccountNode
                    key={account.id}
                    account={account}
                    accounts={accounts}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function AccountNode({ account, accounts, depth = 0 }) {
  const children = accounts.filter(
    (candidate) => candidate.parent_id === account.id,
  );
  return (
    <div className="account-node">
      <div style={{ paddingInlineStart: `${depth * 24 + 12}px` }}>
        <FileText />
        <span>
          <strong>{account.name}</strong>
          <small>{account.code}</small>
        </span>
        {account.is_system && <em>System account</em>}
      </div>
      {children.map((child) => (
        <AccountNode
          key={child.id}
          account={child}
          accounts={accounts}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

function SupplierPayments() {
  const client = useQueryClient();
  const suppliers = useQuery({
    queryKey: ["accounting-suppliers"],
    queryFn: () => suppliersApi.list({ page: 1, size: 100, status: "true" }),
  });
  const orders = useQuery({
    queryKey: ["received-purchase-orders"],
    queryFn: () =>
      purchasesApi.list({ page: 1, size: 100, status: "received" }),
  });
  const payments = useQuery({
    queryKey: ["supplier-payments"],
    queryFn: accountingApi.supplierPayments,
  });
  const outstanding = useQuery({
    queryKey: ["supplier-outstanding"],
    queryFn: accountingApi.supplierOutstanding,
  });
  const [form, setForm] = useState({
    supplier_id: "",
    purchase_order_id: "",
    amount: "",
    payment_date: today(),
    method: "bank_transfer",
    reference: "",
  });
  const create = useMutation({
    mutationFn: accountingApi.recordSupplierPayment,
    onSuccess: () => {
      toast.success("Supplier payment posted");
      [
        "supplier-payments",
        "supplier-outstanding",
        "accounting-dashboard",
        "journal-entries",
      ].forEach((key) => client.invalidateQueries({ queryKey: [key] }));
    },
    onError: (error) => toast.error(error.message),
  });
  const filteredOutstanding =
    outstanding.data?.filter(
      (row) =>
        !form.supplier_id || String(row.supplier_id) === form.supplier_id,
    ) || [];
  return (
    <section className="accounting-panel">
      <header>
        <div>
          <Receipt />
          <div>
            <h2>Supplier Payments</h2>
            <p>
              Post disbursements and monitor the unpaid purchase-order balance.
            </p>
          </div>
        </div>
      </header>
      <form
        className="accounting-inline-form"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate({
            ...form,
            supplier_id: Number(form.supplier_id),
            purchase_order_id: form.purchase_order_id
              ? Number(form.purchase_order_id)
              : null,
          });
        }}
      >
        <Field label="Supplier">
          <select
            className="form-select"
            required
            value={form.supplier_id}
            onChange={(event) =>
              setForm({
                ...form,
                supplier_id: event.target.value,
                purchase_order_id: "",
              })
            }
          >
            <option value="">Select</option>
            {suppliers.data?.items.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Purchase order">
          <select
            className="form-select"
            value={form.purchase_order_id}
            onChange={(event) =>
              setForm({ ...form, purchase_order_id: event.target.value })
            }
          >
            <option value="">Unallocated</option>
            {orders.data?.items
              .filter((order) => String(order.supplier_id) === form.supplier_id)
              .map((order) => (
                <option key={order.id} value={order.id}>
                  {order.number} — {money(order.total_amount)}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Amount">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(event) =>
              setForm({ ...form, amount: event.target.value })
            }
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={form.payment_date}
            onChange={(event) =>
              setForm({ ...form, payment_date: event.target.value })
            }
          />
        </Field>
        <Field label="Method">
          <select
            className="form-select"
            value={form.method}
            onChange={(event) =>
              setForm({ ...form, method: event.target.value })
            }
          >
            {["cash", "bank_transfer", "card", "cheque"].map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
        </Field>
        <Button>Record payment</Button>
      </form>
      <div className="outstanding-summary">
        <header>
          <div>
            <CircleDollarSign />
            <strong>Outstanding Balance</strong>
          </div>
          <b>
            {money(
              filteredOutstanding.reduce(
                (sum, row) => sum + Number(row.remaining_amount),
                0,
              ),
            )}
          </b>
        </header>
        <div className="accounting-table">
          <div className="head">
            <span>Purchase order</span>
            <span>Supplier</span>
            <span>Paid</span>
            <span>Remaining</span>
          </div>
          {filteredOutstanding.map((row) => (
            <div key={row.purchase_order_id}>
              <b>{row.purchase_order_number}</b>
              <span>{row.supplier_name}</span>
              <span>{money(row.paid_amount)}</span>
              <strong>{money(row.remaining_amount)}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="accounting-table">
        <div className="head">
          <span>Payment</span>
          <span>Date</span>
          <span>Method</span>
          <span>Amount</span>
        </div>
        {payments.data?.map((payment) => (
          <div key={payment.id}>
            <b>{payment.number}</b>
            <span>{payment.payment_date}</span>
            <span>{payment.method}</span>
            <b>{money(payment.amount)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function Statements() {
  const [type, setType] = useState("customer");
  const [entityId, setEntityId] = useState("");
  const [range, setRange] = useState({ from: yearStart(), to: today() });
  const customers = useQuery({
    queryKey: ["statement-customers"],
    queryFn: () => customersApi.list({ page: 1, size: 100, status: "true" }),
  });
  const suppliers = useQuery({
    queryKey: ["statement-suppliers"],
    queryFn: () => suppliersApi.list({ page: 1, size: 100, status: "true" }),
  });
  const query = useQuery({
    queryKey: ["statement", type, entityId, range],
    queryFn: () =>
      accountingApi.statement(type, entityId, range.from, range.to),
    enabled: Boolean(entityId),
  });
  const entities =
    type === "customer" ? customers.data?.items : suppliers.data?.items;
  return (
    <section className="accounting-panel">
      <header>
        <div>
          <BookOpen />
          <div>
            <h2>Account Statements</h2>
            <p>A bank-style running balance for every customer and supplier.</p>
          </div>
        </div>
        {query.data && (
          <Button variant="outline" onClick={() => window.print()}>
            Print statement
          </Button>
        )}
      </header>
      <div className="accounting-inline-form statement-controls">
        <Field label="Type">
          <select
            className="form-select"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setEntityId("");
            }}
          >
            <option value="customer">Customer</option>
            <option value="supplier">Supplier</option>
          </select>
        </Field>
        <Field label="Account">
          <select
            className="form-select"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
          >
            <option value="">Select</option>
            {entities?.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <Input
            type="date"
            value={range.from}
            onChange={(event) =>
              setRange({ ...range, from: event.target.value })
            }
          />
        </Field>
        <Field label="To">
          <Input
            type="date"
            value={range.to}
            onChange={(event) => setRange({ ...range, to: event.target.value })}
          />
        </Field>
      </div>
      {query.data && (
        <div className="statement-print">
          <div className="statement-heading">
            <span>
              <small>Statement for</small>
              <h3>{query.data.entity_name}</h3>
            </span>
            <span>
              <small>Opening balance</small>
              <strong>{money(query.data.opening_balance)}</strong>
            </span>
          </div>
          <div className="statement-table">
            <div className="head">
              <span>Date</span>
              <span>Reference</span>
              <span>Description</span>
              <span>Debit</span>
              <span>Credit</span>
              <span>Balance</span>
            </div>
            {query.data.lines.map((line, index) => (
              <div key={`${line.reference}-${index}`}>
                <span>{line.date}</span>
                <b>{line.reference}</b>
                <span>{line.description}</span>
                <span>{Number(line.debit) ? money(line.debit) : "—"}</span>
                <span>{Number(line.credit) ? money(line.credit) : "—"}</span>
                <strong>{money(line.balance)}</strong>
              </div>
            ))}
          </div>
          <div className="statement-closing">
            <span>Closing balance</span>
            <strong>{money(query.data.closing_balance)}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

function AccountSelect({ accounts, value, onChange }) {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
    >
      <option value="">Select</option>
      {accounts
        ?.filter((account) => account.is_active)
        .map((account) => (
          <option key={account.id} value={account.id}>
            {account.code} — {account.name}
          </option>
        ))}
    </select>
  );
}
function Field({ label, children }) {
  return (
    <div className="form-field">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
