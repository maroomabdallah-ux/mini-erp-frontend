import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FilePenLine,
  FileText,
  Plus,
  Printer,
  Search,
  Send,
  ShoppingBag,
  ThumbsDown,
  TimerOff,
  XCircle,
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
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import { QuotationDialog } from "./quotation-dialog";
import { quotationsApi } from "./api";
import { salesOrdersApi } from "@/features/sales/api";

const PAGE_SIZE = 12;
const statuses = {
  draft: ["Draft", FilePenLine],
  sent: ["Sent", Send],
  accepted: ["Accepted", Check],
  converted: ["Converted", ShoppingBag],
  rejected: ["Rejected", XCircle],
  expired: ["Expired", TimerOff],
};
const money = (value) =>
  new Intl.NumberFormat("en-JO", { style: "currency", currency: "JOD" }).format(
    Number(value || 0),
  );
const date = (value) =>
  new Intl.DateTimeFormat("en-JO", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );

export function QuotationsPage({ onNavigate }) {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.QUOTATIONS_MANAGE);
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState({ open: false, quotation: null });
  const [detail, setDetail] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const filters = { page, size: PAGE_SIZE, search: deferred, status };
  const query = useQuery({
    queryKey: ["quotations", filters],
    queryFn: () => quotationsApi.list(filters),
  });
  const sent = useQuery({
    queryKey: ["quotation-summary-sent"],
    queryFn: () => quotationsApi.list({ page: 1, size: 1, status: "sent" }),
  });
  const accepted = useQuery({
    queryKey: ["quotation-summary-accepted"],
    queryFn: () => quotationsApi.list({ page: 1, size: 1, status: "accepted" }),
  });
  const total = query.data?.total || 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  useEffect(() => setPage(1), [deferred, status]);
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["quotations"] });
    client.invalidateQueries({ queryKey: ["quotation-summary-sent"] });
    client.invalidateQueries({ queryKey: ["quotation-summary-accepted"] });
  };
  const save = useMutation({
    mutationFn: (input) =>
      editor.quotation
        ? quotationsApi.update(editor.quotation.id, input)
        : quotationsApi.create(input),
    onSuccess: () => {
      toast.success(
        editor.quotation ? "Quotation updated" : "Quotation created",
      );
      setEditor({ open: false, quotation: null });
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const action = useMutation({
    mutationFn: ({ type, quotation, reason }) =>
      quotationsApi[type](quotation.id, reason),
    onSuccess: (_, input) => {
      toast.success(
        `Quotation ${{ send: "sent", accept: "accepted", reject: "rejected", expire: "expired" }[input.type]}`,
      );
      setRejecting(null);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const convert = useMutation({
    mutationFn: (quotation) => salesOrdersApi.convert(quotation.id),
    onSuccess: () => {
      toast.success("Sales order created");
      refresh();
      client.invalidateQueries({ queryKey: ["sales-orders"] });
      onNavigate("sales");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="quotation-page">
      <section className="quotation-hero">
        <div>
          <p>Sales pipeline</p>
          <h1>Quotations</h1>
          <span>
            Build clear offers, capture customer decisions, and prepare accepted
            demand for sales orders.
          </span>
        </div>
        <div className="quotation-flow">
          <span>
            <FileText />
          </span>
          <i />
          <span>
            <Send />
          </span>
          <i />
          <span>
            <Check />
          </span>
        </div>
        {canManage && (
          <Button
            size="lg"
            onClick={() => setEditor({ open: true, quotation: null })}
          >
            <Plus />
            Create quotation
          </Button>
        )}
      </section>
      <section className="quotation-metrics">
        <Metric
          icon={FileText}
          label="Matching quotations"
          value={query.isLoading ? "—" : total}
          detail="Current workspace results"
        />
        <Metric
          icon={Clock3}
          label="Awaiting customer"
          value={sent.isLoading ? "—" : sent.data?.total || 0}
          detail="Sent and awaiting decision"
        />
        <Metric
          icon={Check}
          label="Accepted offers"
          value={accepted.isLoading ? "—" : accepted.data?.total || 0}
          detail="Ready for sales order"
        />
      </section>
      <section className="quotation-board">
        <header>
          <div>
            <p>Commercial offers</p>
            <h2>Quotation register</h2>
          </div>
          <div className="quotation-toolbar">
            <div className="search-box">
              <Search />
              <Input
                placeholder="Search quotation number or customer..."
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
              {Object.entries(statuses).map(([value, [label]]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </header>
        {query.isLoading ? (
          <State>
            <div className="loader" />
          </State>
        ) : query.isError ? (
          <State>
            <AlertTriangle />
            <h3>Unable to load quotations</h3>
          </State>
        ) : !query.data?.items.length ? (
          <State>
            <FileText />
            <h3>No quotations yet</h3>
            <p>Create a draft offer for one of your active customers.</p>
          </State>
        ) : (
          <div className="quotation-list">
            {query.data.items.map((quotation) => (
              <QuoteRow
                key={quotation.id}
                quotation={quotation}
                canManage={canManage}
                busy={action.isPending || convert.isPending}
                onView={() => setDetail(quotation)}
                onEdit={() => setEditor({ open: true, quotation })}
                onConvert={() => convert.mutate(quotation)}
                onAction={(type) =>
                  type === "reject"
                    ? setRejecting(quotation)
                    : action.mutate({ type, quotation })
                }
              />
            ))}
          </div>
        )}
        {pages > 1 && (
          <div className="supplier-pagination">
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
      <QuotationDialog
        open={editor.open}
        onOpenChange={(open) =>
          setEditor({ open, quotation: open ? editor.quotation : null })
        }
        quotation={editor.quotation}
        onSave={(input) => save.mutate(input)}
        loading={save.isPending}
      />
      <QuoteDetail
        quotation={detail}
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
      />
      <RejectDialog
        quotation={rejecting}
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
        loading={action.isPending}
        onReject={(reason) =>
          action.mutate({ type: "reject", quotation: rejecting, reason })
        }
      />
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <article className="quotation-metric">
      <span>
        <Icon />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}
function QuoteRow({
  quotation,
  canManage,
  busy,
  onView,
  onEdit,
  onAction,
  onConvert,
}) {
  const [label, Icon] = statuses[quotation.status];
  return (
    <article className={`quotation-row status-${quotation.status}`}>
      <span className="quotation-status-icon">
        <Icon />
      </span>
      <div className="quotation-main">
        <div>
          <strong>{quotation.number}</strong>
          <span className={`status ${quotation.status}`}>
            <i />
            {label}
          </span>
        </div>
        <p>
          {quotation.customer.code} · {quotation.customer.name}
        </p>
        <small>
          <CalendarDays />
          Valid until {date(quotation.valid_until)} · {quotation.items.length}{" "}
          lines
        </small>
      </div>
      <div className="quotation-value">
        <small>Total offer</small>
        <strong>{money(quotation.total_amount)}</strong>
        <span>
          {quotation.discount_percent}% discount · {quotation.tax_percent}% tax
        </span>
      </div>
      <div className="quotation-actions">
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye />
          Details
        </Button>
        {canManage && quotation.status === "draft" && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <FilePenLine />
              Edit
            </Button>
            <Button size="sm" disabled={busy} onClick={() => onAction("send")}>
              <Send />
              Send to customer
            </Button>
          </>
        )}
        {canManage && quotation.status === "sent" && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onAction("expire")}
            >
              <TimerOff />
              Mark expired
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onAction("reject")}
            >
              <ThumbsDown />
              Record rejection
            </Button>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => onAction("accept")}
            >
              <Check />
              Record acceptance
            </Button>
          </>
        )}
        {canManage && quotation.status === "accepted" && (
          <Button size="sm" disabled={busy} onClick={onConvert}>
            <ShoppingBag />
            Convert to sales order
          </Button>
        )}
      </div>
    </article>
  );
}
function QuoteDetail({ quotation, open, onOpenChange }) {
  if (!quotation) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl printable-document">
        <DialogHeader>
          <DialogTitle>{quotation.number}</DialogTitle>
          <DialogDescription>
            Commercial offer for {quotation.customer.name}
          </DialogDescription>
        </DialogHeader>
        <div className="quote-detail-summary">
          <div>
            <small>Customer</small>
            <strong>{quotation.customer.name}</strong>
            <span>
              {quotation.customer.email ||
                quotation.customer.phone ||
                quotation.customer.code}
            </span>
          </div>
          <div>
            <small>Valid until</small>
            <strong>{date(quotation.valid_until)}</strong>
            <span>{statuses[quotation.status][0]}</span>
          </div>
          <div>
            <small>Total</small>
            <strong>{money(quotation.total_amount)}</strong>
            <span>{quotation.items.length} product lines</span>
          </div>
        </div>
        <div className="quote-detail-lines">
          <header>
            <span>Product</span>
            <span>Quantity</span>
            <span>Unit price</span>
            <span>Discount</span>
            <span>Total</span>
          </header>
          {quotation.items.map((item) => (
            <div key={item.id}>
              <span>
                <strong>{item.product.name}</strong>
                <small>{item.product.sku}</small>
              </span>
              <b>{item.quantity}</b>
              <b>{money(item.unit_price)}</b>
              <b>{item.discount_percent}%</b>
              <b>{money(item.line_total)}</b>
            </div>
          ))}
        </div>
        <div className="quote-detail-totals">
          <span>
            Subtotal <b>{money(quotation.subtotal)}</b>
          </span>
          <span>
            Discount ({quotation.discount_percent}%){" "}
            <b>- {money(quotation.discount_amount)}</b>
          </span>
          <span>
            Tax ({quotation.tax_percent}%) <b>{money(quotation.tax_amount)}</b>
          </span>
          <strong>
            Total <b>{money(quotation.total_amount)}</b>
          </strong>
        </div>
        {quotation.notes && (
          <div className="purchase-detail-note">
            <strong>Notes</strong>
            <p>{quotation.notes}</p>
          </div>
        )}
        {quotation.rejection_reason && (
          <div className="purchase-detail-note danger">
            <strong>Rejection reason</strong>
            <p>{quotation.rejection_reason}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Print quotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function RejectDialog({ quotation, open, onOpenChange, onReject, loading }) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject quotation</DialogTitle>
          <DialogDescription>
            Record why the customer rejected {quotation?.number}.
          </DialogDescription>
        </DialogHeader>
        <form
          className="dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            onReject(reason.trim());
          }}
        >
          <div className="form-field">
            <Label htmlFor="quote-reason">Reason</Label>
            <Input
              id="quote-reason"
              minLength={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
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
              variant="destructive"
              disabled={loading || reason.trim().length < 3}
            >
              Reject quotation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function State({ children }) {
  return <div className="quotation-state">{children}</div>;
}
