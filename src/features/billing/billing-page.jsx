import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  Banknote,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Eye,
  FileCheck2,
  FilePlus2,
  Landmark,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
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
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import {
  consumeDocumentTarget,
  openDocument,
} from "@/shared/navigation/document-target";
import { billingApi } from "./api";

const PAGE_SIZE = 12;
const STATUS = {
  draft: "Draft",
  issued: "Issued",
  partially_paid: "Partially paid",
  paid: "Paid",
  cancelled: "Cancelled",
};
const money = (value) =>
  Number(value || 0).toLocaleString("en-JO", {
    style: "currency",
    currency: "JOD",
  });
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-JO", { dateStyle: "medium" }).format(
        new Date(`${value}T00:00:00`),
      )
    : "—";

export function BillingPage({ onNavigate }) {
  const { user } = useAuth();
  const client = useQueryClient();
  const canCreate = hasPermission(user, PERMISSIONS.INVOICES_CREATE);
  const canCancel = hasPermission(user, PERMISSIONS.INVOICES_CANCEL);
  const canPay = hasPermission(user, PERMISSIONS.PAYMENTS_CREATE);
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [status, setStatus] = useState("");
  const [overdue, setOverdue] = useState(false);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [creating, setCreating] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [paying, setPaying] = useState(null);
  const [reason, setReason] = useState(null);
  useEffect(() => {
    const target = consumeDocumentTarget("billing");
    if (!target?.id) return;
    billingApi
      .get(target.id)
      .then(setDetail)
      .catch((error) => toast.error(error.message));
  }, []);
  const filters = { page, size: PAGE_SIZE, search: deferred, status, overdue };
  const query = useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => billingApi.list(filters),
  });
  const unpaidQuery = useQuery({
    queryKey: ["invoices", "issued-summary"],
    queryFn: () => billingApi.list({ page: 1, size: 1, status: "issued" }),
  });
  const partialQuery = useQuery({
    queryKey: ["invoices", "partial-summary"],
    queryFn: () =>
      billingApi.list({ page: 1, size: 1, status: "partially_paid" }),
  });
  const overdueQuery = useQuery({
    queryKey: ["invoices", "overdue-summary"],
    queryFn: () => billingApi.list({ page: 1, size: 1, overdue: true }),
  });
  useEffect(() => setPage(1), [deferred, status, overdue]);
  const total = query.data?.total || 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const refresh = () => client.invalidateQueries({ queryKey: ["invoices"] });
  const action = useMutation({
    mutationFn: ({ type, invoice, value }) =>
      billingApi[type](invoice.id, value),
    onSuccess: (updated, input) => {
      toast.success(
        input.type === "issue" ? "Invoice issued" : "Invoice cancelled",
      );
      setReason(null);
      setDetail((current) => (current?.id === updated.id ? updated : current));
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="billing-page">
      <section className="billing-hero">
        <div>
          <p>Accounts receivable</p>
          <h1>Invoices & payments</h1>
          <span>
            Control every customer balance from delivered order to final
            settlement.
          </span>
        </div>
        <div className="billing-hero-total">
          <Landmark />
          <span>
            <small>Open documents</small>
            <strong>
              {(unpaidQuery.data?.total || 0) + (partialQuery.data?.total || 0)}
            </strong>
          </span>
        </div>
        <div className="billing-hero-actions">
          {canPay && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setReceiving(true)}
            >
              <Banknote />
              Record customer receipt
            </Button>
          )}
          {canCreate && (
            <Button size="lg" onClick={() => setCreating(true)}>
              <Plus />
              Generate invoice
            </Button>
          )}
        </div>
      </section>
      <section className="billing-metrics">
        <Metric
          icon={ReceiptText}
          label="Matching invoices"
          value={query.isLoading ? "—" : total}
          text="Current register results"
        />
        <Metric
          icon={FileCheck2}
          label="Awaiting payment"
          value={unpaidQuery.isLoading ? "—" : unpaidQuery.data?.total || 0}
          text="Issued with no payment"
        />
        <Metric
          icon={CircleDollarSign}
          label="Partially paid"
          value={partialQuery.isLoading ? "—" : partialQuery.data?.total || 0}
          text="Balance still outstanding"
        />
        <Metric
          icon={CalendarClock}
          label="Overdue"
          value={overdueQuery.isLoading ? "—" : overdueQuery.data?.total || 0}
          text="Past due and unpaid"
          danger
        />
      </section>
      <section className="billing-board">
        <header>
          <div>
            <p>Customer finance</p>
            <h2>Invoice register</h2>
          </div>
          <div className="billing-toolbar">
            <div className="search-box">
              <Search />
              <Input
                placeholder="Search invoice number or customer..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              variant={overdue ? "default" : "outline"}
              onClick={() => setOverdue(!overdue)}
            >
              <CalendarClock />
              Overdue only
            </Button>
          </div>
        </header>
        {query.isLoading ? (
          <State>
            <div className="loader" />
          </State>
        ) : query.isError ? (
          <State>
            <AlertTriangle />
            <h3>Unable to load invoices</h3>
          </State>
        ) : !query.data?.items.length ? (
          <State>
            <ReceiptText />
            <h3>No invoices found</h3>
            <p>Generate an invoice after a Sales Order has been delivered.</p>
          </State>
        ) : (
          <div className="billing-list">
            {query.data.items.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                canCreate={canCreate}
                canCancel={canCancel}
                canPay={canPay}
                busy={action.isPending}
                onView={() => setDetail(invoice)}
                onIssue={() => action.mutate({ type: "issue", invoice })}
                onPay={() => setPaying(invoice)}
                onCancel={() => setReason({ mode: "cancel", invoice })}
              />
            ))}
          </div>
        )}
        {pages > 1 && (
          <div className="billing-pagination">
            <span>
              Page {page} of {pages}
            </span>
            <div>
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </section>
      <CreateInvoiceDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={() => {
          setCreating(false);
          refresh();
        }}
      />
      <CustomerReceiptDialog
        open={receiving}
        onOpenChange={setReceiving}
        onDone={() => {
          setReceiving(false);
          refresh();
        }}
      />
      <InvoiceDetail
        invoice={detail}
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        canPay={canPay}
        onPay={() => setPaying(detail)}
        onReverse={(payment) =>
          setReason({ mode: "reverse", invoice: detail, payment })
        }
        onNavigate={onNavigate}
      />
      <PaymentDialog
        invoice={paying}
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(null)}
        onPaid={(updated) => {
          setPaying(null);
          setDetail((current) =>
            current?.id === updated.id ? updated : current,
          );
          refresh();
        }}
      />
      <ReasonDialog
        state={reason}
        open={Boolean(reason)}
        onOpenChange={(open) => !open && setReason(null)}
        loading={action.isPending}
        onDone={(updated) => {
          setReason(null);
          setDetail((current) =>
            current?.id === updated.id ? updated : current,
          );
          refresh();
        }}
        onCancel={(value) =>
          action.mutate({ type: "cancel", invoice: reason.invoice, value })
        }
      />
    </div>
  );
}

function Metric({ icon: Icon, label, value, text, danger }) {
  return (
    <article className={`billing-metric ${danger ? "danger" : ""}`}>
      <span>
        <Icon />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{text}</small>
      </div>
    </article>
  );
}
function InvoiceRow({
  invoice,
  canCreate,
  canCancel,
  canPay,
  busy,
  onView,
  onIssue,
  onPay,
  onCancel,
}) {
  const balance = Number(invoice.balance_due);
  const isOverdue =
    ["issued", "partially_paid"].includes(invoice.status) &&
    new Date(`${invoice.due_date}T23:59:59`) < new Date();
  return (
    <article className={`billing-row status-${invoice.status}`}>
      <span className="billing-row-icon">
        <ReceiptText />
      </span>
      <div className="billing-main">
        <div>
          <strong>{invoice.number}</strong>
          {invoice.document_type === "credit_note" && <em>Credit note</em>}
          <span className={`billing-status ${invoice.status}`}>
            {STATUS[invoice.status]}
          </span>
          {isOverdue && <span className="billing-overdue">Overdue</span>}
        </div>
        <p>
          {invoice.customer.code} · {invoice.customer.name}
        </p>
        <small>
          {invoice.sales_order?.number ||
            `Reversal of invoice #${invoice.reversed_invoice_id}`}{" "}
          · Due {date(invoice.due_date)}
        </small>
      </div>
      <div className="billing-balance">
        <small>Invoice total</small>
        <strong>{money(invoice.total_amount)}</strong>
        <span>Paid {money(invoice.paid_amount)}</span>
      </div>
      <div className="billing-balance due">
        <small>Balance due</small>
        <strong>{money(balance)}</strong>
        <span>
          {invoice.payments.filter((item) => item.status === "posted").length}{" "}
          posted payments
        </span>
      </div>
      <div className="billing-actions">
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye />
          Details
        </Button>
        {canCreate && invoice.status === "draft" && (
          <Button size="sm" disabled={busy} onClick={onIssue}>
            <Send />
            Issue
          </Button>
        )}
        {canPay &&
          invoice.document_type === "invoice" &&
          ["issued", "partially_paid"].includes(invoice.status) && (
            <Button size="sm" disabled={busy} onClick={onPay}>
              <Banknote />
              Record payment
            </Button>
          )}
        {canCancel &&
          invoice.document_type === "invoice" &&
          ["draft", "issued"].includes(invoice.status) &&
          Number(invoice.paid_amount) === 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onCancel}
            >
              <Ban />
              Cancel
            </Button>
          )}
      </div>
    </article>
  );
}

function CustomerReceiptDialog({ open, onOpenChange, onDone }) {
  const blank = () => ({
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    method: "bank_transfer",
    reference: "",
    allocations: {},
  });
  const [customerId, setCustomerId] = useState("");
  const [form, setForm] = useState(blank);
  const customers = useQuery({
    queryKey: ["receipt-customers"],
    queryFn: () => customersApi.list({ page: 1, size: 100, status: "true" }),
    enabled: open,
  });
  const invoices = useQuery({
    queryKey: ["receipt-invoices", customerId],
    queryFn: () => billingApi.list({ page: 1, size: 100, customerId }),
    enabled: open && Boolean(customerId),
  });
  useEffect(() => {
    if (open) {
      setCustomerId("");
      setForm(blank());
    }
  }, [open]);
  const mutation = useMutation({
    mutationFn: billingApi.recordCustomerPayment,
    onSuccess: () => {
      toast.success("Customer receipt posted and allocated");
      onDone();
    },
    onError: (error) => toast.error(error.message),
  });
  const openInvoices =
    invoices.data?.items.filter((invoice) =>
      ["issued", "partially_paid"].includes(invoice.status),
    ) || [];
  const allocated = Object.values(form.allocations).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );
  const submit = (event) => {
    event.preventDefault();
    mutation.mutate({
      customer_id: Number(customerId),
      amount: form.amount,
      payment_date: form.payment_date,
      method: form.method,
      reference: form.reference.trim() || null,
      allocations: Object.entries(form.allocations)
        .filter(([, amount]) => Number(amount) > 0)
        .map(([invoice_id, amount]) => ({
          invoice_id: Number(invoice_id),
          amount,
        })),
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record customer receipt</DialogTitle>
          <DialogDescription>
            Allocate one receipt across multiple open invoices, or leave part of
            it on account.
          </DialogDescription>
        </DialogHeader>
        <form className="dialog-form" onSubmit={submit}>
          <div className="billing-payment-grid">
            <div className="form-field">
              <Label>Customer</Label>
              <select
                className="form-select"
                value={customerId}
                onChange={(event) => {
                  setCustomerId(event.target.value);
                  setForm({ ...form, allocations: {} });
                }}
                required
              >
                <option value="">Select</option>
                {customers.data?.items.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.code} — {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <Label>Total receipt</Label>
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
            </div>
            <div className="form-field">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.payment_date}
                onChange={(event) =>
                  setForm({ ...form, payment_date: event.target.value })
                }
                required
              />
            </div>
            <div className="form-field">
              <Label>Method</Label>
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
            </div>
          </div>
          <section className="payment-history">
            <header>
              <strong>Invoice allocations</strong>
              <small>
                {money(allocated)} allocated ·{" "}
                {money(Number(form.amount || 0) - allocated)} unallocated
              </small>
            </header>
            {openInvoices.map((invoice) => (
              <article key={invoice.id}>
                <div>
                  <strong>{invoice.number}</strong>
                  <small>Balance {money(invoice.balance_due)}</small>
                </div>
                <Input
                  aria-label={`Allocate to ${invoice.number}`}
                  type="number"
                  min="0"
                  max={invoice.balance_due}
                  step="0.01"
                  value={form.allocations[invoice.id] || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      allocations: {
                        ...form.allocations,
                        [invoice.id]: event.target.value,
                      },
                    })
                  }
                />
              </article>
            ))}
          </section>
          <div className="form-field">
            <Label>Reference</Label>
            <Input
              value={form.reference}
              onChange={(event) =>
                setForm({ ...form, reference: event.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                mutation.isPending ||
                !customerId ||
                Number(form.amount) <= 0 ||
                allocated > Number(form.amount)
              }
            >
              {mutation.isPending ? "Posting..." : "Post receipt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateInvoiceDialog({ open, onOpenChange, onCreated }) {
  const [orderId, setOrderId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const orders = useQuery({
    queryKey: ["invoice-eligible-orders"],
    queryFn: billingApi.eligibleOrders,
    enabled: open,
  });
  useEffect(() => {
    if (open) {
      setOrderId("");
      setDueDate("");
      setNotes("");
    }
  }, [open]);
  const create = useMutation({
    mutationFn: () =>
      billingApi.create({
        sales_order_id: Number(orderId),
        due_date: dueDate || null,
        notes: notes.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Invoice generated as draft");
      onCreated();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate invoice</DialogTitle>
          <DialogDescription>
            Select a delivered Sales Order that has not been invoiced. Amounts
            are copied as an immutable snapshot.
          </DialogDescription>
        </DialogHeader>
        {orders.isLoading ? (
          <State>
            <div className="loader" />
          </State>
        ) : (
          <form
            className="dialog-form"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <div className="form-field">
              <Label htmlFor="invoice-order">Delivered Sales Order</Label>
              <select
                id="invoice-order"
                className="form-select"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                required
              >
                <option value="">Select an order...</option>
                {orders.data?.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.number} · {order.customer.name} ·{" "}
                    {money(order.total_amount)}
                  </option>
                ))}
              </select>
              {orders.data?.length === 0 && (
                <small className="billing-hint">
                  No delivered orders are waiting for an invoice.
                </small>
              )}
            </div>
            <div className="form-field">
              <Label htmlFor="invoice-due">Due date (optional)</Label>
              <Input
                id="invoice-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
              <small className="billing-hint">
                Leave empty to use 30 days after delivery.
              </small>
            </div>
            <div className="form-field">
              <Label htmlFor="invoice-notes">Notes (optional)</Label>
              <Input
                id="invoice-notes"
                maxLength={1000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button disabled={!orderId || create.isPending}>
                <FilePlus2 />
                Create draft invoice
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ invoice, open, onOpenChange, onPaid }) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (open && invoice) {
      setAmount(String(invoice.balance_due));
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setMethod("bank_transfer");
      setReference("");
      setNotes("");
    }
  }, [open, invoice]);
  const pay = useMutation({
    mutationFn: () =>
      billingApi.pay(invoice.id, {
        amount,
        payment_date: paymentDate,
        method,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      }),
    onSuccess: (updated) => {
      toast.success("Payment posted");
      onPaid(updated);
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record customer payment</DialogTitle>
          <DialogDescription>
            {invoice?.number} has {money(invoice?.balance_due)} remaining.
          </DialogDescription>
        </DialogHeader>
        <form
          className="dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            pay.mutate();
          }}
        >
          <div className="billing-payment-grid">
            <div className="form-field">
              <Label htmlFor="payment-amount">Amount (JOD)</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                max={invoice?.balance_due}
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="payment-date">Payment date</Label>
              <Input
                id="payment-date"
                type="date"
                required
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
              />
            </div>
          </div>
          <div className="form-field">
            <Label htmlFor="payment-method">Payment method</Label>
            <select
              id="payment-method"
              className="form-select"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="form-field">
            <Label htmlFor="payment-reference">Reference (optional)</Label>
            <Input
              id="payment-reference"
              maxLength={100}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </div>
          <div className="form-field">
            <Label htmlFor="payment-notes">Notes (optional)</Label>
            <Input
              id="payment-notes"
              maxLength={500}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                pay.isPending ||
                Number(amount) <= 0 ||
                Number(amount) > Number(invoice?.balance_due)
              }
            >
              <CreditCard />
              Post payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDetail({
  invoice,
  open,
  onOpenChange,
  canPay,
  onPay,
  onReverse,
  onNavigate,
}) {
  const timeline = useQuery({
    queryKey: ["invoice-accounting-timeline", invoice?.id],
    queryFn: () => billingApi.timeline(invoice.id),
    enabled: open && Boolean(invoice),
  });
  if (!invoice) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl billing-document">
        <DialogHeader>
          <div className="billing-document-title">
            <div>
              <p>Customer invoice</p>
              <DialogTitle>{invoice.number}</DialogTitle>
            </div>
            <span className={`billing-status ${invoice.status}`}>
              {STATUS[invoice.status]}
            </span>
          </div>
          <DialogDescription>
            {invoice.document_type === "credit_note"
              ? `Reversing invoice #${invoice.reversed_invoice_id}`
              : `Generated from ${invoice.sales_order?.number} after warehouse delivery.`}
          </DialogDescription>
        </DialogHeader>
        <div className="billing-document-summary">
          <div>
            <small>Bill to</small>
            <strong>{invoice.customer.name}</strong>
            <span>
              {invoice.customer.email ||
                invoice.customer.phone ||
                invoice.customer.code}
            </span>
          </div>
          <div>
            <small>Issue date</small>
            <strong>{date(invoice.issue_date)}</strong>
            <span>Due {date(invoice.due_date)}</span>
          </div>
          <div>
            <small>Balance due</small>
            <strong>{money(invoice.balance_due)}</strong>
            <span>of {money(invoice.total_amount)}</span>
          </div>
        </div>
        <div className="quote-detail-lines">
          <header>
            <span>Product</span>
            <span>Quantity</span>
            <span>Unit price</span>
            <span>Total</span>
          </header>
          {invoice.items.map((item) => (
            <div key={item.id}>
              <span>
                <strong>{item.product.name}</strong>
                <small>{item.product.sku}</small>
              </span>
              <b>{item.quantity}</b>
              <b>{money(item.unit_price)}</b>
              <b>{money(item.line_total)}</b>
            </div>
          ))}
        </div>
        <div className="quote-detail-totals">
          <span>
            Subtotal <b>{money(invoice.subtotal)}</b>
          </span>
          <span>
            Discount <b>- {money(invoice.discount_amount)}</b>
          </span>
          <span>
            Tax <b>{money(invoice.tax_amount)}</b>
          </span>
          <strong>
            Total <b>{money(invoice.total_amount)}</b>
          </strong>
        </div>
        <section className="payment-history">
          <header>
            <div>
              <Landmark />
              <span>
                <strong>Payment history</strong>
                <small>Posted receipts and reversals</small>
              </span>
            </div>
            {canPay &&
              invoice.document_type === "invoice" &&
              ["issued", "partially_paid"].includes(invoice.status) && (
                <Button size="sm" onClick={onPay}>
                  <Plus />
                  Record payment
                </Button>
              )}
          </header>
          {invoice.payments.length === 0 ? (
            <p>No payments recorded.</p>
          ) : (
            invoice.payments.map((payment) => (
              <article key={payment.id} className={payment.status}>
                <span>
                  <strong>{payment.number}</strong>
                  <small>
                    {date(payment.payment_date)} ·{" "}
                    {payment.method.replaceAll("_", " ")}
                  </small>
                </span>
                <b>{money(payment.amount)}</b>
                <em>{payment.status}</em>
                {canPay && payment.status === "posted" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReverse(payment)}
                  >
                    <RotateCcw />
                    Reverse
                  </Button>
                )}
              </article>
            ))
          )}
        </section>
        <section className="accounting-timeline">
          <header>
            <div>
              <Landmark />
              <span>
                <strong>Accounting timeline</strong>
                <small>Document and journal events</small>
              </span>
            </div>
          </header>
          <div>
            {timeline.data?.map((event, index) => (
              <button
                key={event.key}
                onClick={() =>
                  event.route &&
                  openDocument(onNavigate, {
                    route: event.route,
                    id: event.document_id,
                    kind: event.key?.includes("journal")
                      ? "journal"
                      : "invoice",
                  })
                }
              >
                <span className="timeline-dot">{index + 1}</span>
                <span>
                  <strong>{event.label}</strong>
                  <small>
                    {event.reference} ·{" "}
                    {new Date(event.occurred_at).toLocaleString("en-JO")}
                  </small>
                </span>
                {event.route && <ChevronRight />}
              </button>
            ))}
          </div>
        </section>
        {invoice.cancellation_reason && (
          <div className="purchase-detail-note danger">
            <strong>Cancellation reason</strong>
            <p>{invoice.cancellation_reason}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Print invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReasonDialog({
  state,
  open,
  onOpenChange,
  loading,
  onDone,
  onCancel,
}) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (open) setValue("");
  }, [open]);
  const reverse = useMutation({
    mutationFn: () => billingApi.reversePayment(state.payment.id, value.trim()),
    onSuccess: (updated) => {
      toast.success("Payment reversed");
      onDone(updated);
    },
    onError: (error) => toast.error(error.message),
  });
  const isReverse = state?.mode === "reverse";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReverse ? "Reverse payment" : "Cancel invoice"}
          </DialogTitle>
          <DialogDescription>
            {isReverse
              ? `Reverse ${state?.payment?.number} without deleting its audit trail.`
              : `Cancel ${state?.invoice?.number} before any payment is posted.`}
          </DialogDescription>
        </DialogHeader>
        <form
          className="dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            isReverse ? reverse.mutate() : onCancel(value.trim());
          }}
        >
          <div className="form-field">
            <Label htmlFor="billing-reason">Reason</Label>
            <Input
              id="billing-reason"
              minLength={3}
              maxLength={500}
              required
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Keep record
            </Button>
            <Button
              variant="destructive"
              disabled={loading || reverse.isPending || value.trim().length < 3}
            >
              {isReverse ? <RotateCcw /> : <Ban />}
              {isReverse ? "Reverse payment" : "Cancel invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function State({ children }) {
  return <div className="billing-state">{children}</div>;
}
