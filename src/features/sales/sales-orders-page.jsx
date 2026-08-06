import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  PackageCheck,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  Truck,
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
import { QuotationDialog } from "@/features/quotations/quotation-dialog";
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import { salesOrdersApi } from "./api";

const PAGE_SIZE = 12;
const statuses = {
  draft: "Draft",
  confirmed: "Ready to deliver",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const money = (value) =>
  new Intl.NumberFormat("en-JO", { style: "currency", currency: "JOD" }).format(
    Number(value || 0),
  );
const dateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-JO", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not completed";

export function SalesOrdersPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [delivering, setDelivering] = useState(null);
  const [creating, setCreating] = useState(false);
  const canCreate = hasPermission(user, PERMISSIONS.SALES_ORDERS_CREATE);
  const canConfirm = hasPermission(user, PERMISSIONS.SALES_ORDERS_CONFIRM);
  const canUpdate = hasPermission(user, PERMISSIONS.SALES_ORDERS_UPDATE);
  const canDeliver = hasPermission(user, PERMISSIONS.SALES_ORDERS_DELIVER);
  const filters = { page, size: PAGE_SIZE, search: deferred, status };
  const query = useQuery({
    queryKey: ["sales-orders", filters],
    queryFn: () => salesOrdersApi.list(filters),
  });
  const confirmed = useQuery({
    queryKey: ["sales-orders-ready"],
    queryFn: () =>
      salesOrdersApi.list({ page: 1, size: 1, status: "confirmed" }),
  });
  const delivered = useQuery({
    queryKey: ["sales-orders-delivered"],
    queryFn: () =>
      salesOrdersApi.list({ page: 1, size: 1, status: "delivered" }),
  });
  useEffect(() => setPage(1), [deferred, status]);
  const total = query.data?.total || 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["sales-orders"] });
    client.invalidateQueries({ queryKey: ["sales-orders-ready"] });
    client.invalidateQueries({ queryKey: ["sales-orders-delivered"] });
  };
  const action = useMutation({
    mutationFn: ({ type, order, input }) =>
      salesOrdersApi[type](order.id, input),
    onSuccess: (_, input) => {
      toast.success(
        input.type === "confirm"
          ? "Sales order confirmed"
          : "Sales order cancelled",
      );
      setCancelling(null);
      setConfirming(null);
      setDetail(null);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const create = useMutation({
    mutationFn: salesOrdersApi.create,
    onSuccess: () => {
      toast.success("Sales order created");
      setCreating(false);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="sales-page">
      <section className="sales-hero">
        <div>
          <p>Order fulfillment</p>
          <h1>Sales orders</h1>
          <span>
            Turn accepted offers into controlled warehouse deliveries with a
            complete inventory trail.
          </span>
        </div>
        <div className="sales-flow">
          <span>
            <ShoppingBag />
          </span>
          <i />
          <span>
            <Check />
          </span>
          <i />
          <span>
            <Truck />
          </span>
        </div>
        {canCreate && (
          <Button size="lg" onClick={() => setCreating(true)}>
            <Plus />
            Create sales order
          </Button>
        )}
      </section>
      <section className="sales-metrics">
        <Metric
          icon={ShoppingBag}
          label="Matching orders"
          value={query.isLoading ? "—" : total}
          text="Current register results"
        />
        <Metric
          icon={PackageCheck}
          label="Ready to deliver"
          value={confirmed.isLoading ? "—" : confirmed.data?.total || 0}
          text="Confirmed, stock unchanged"
        />
        <Metric
          icon={CircleDollarSign}
          label="Completed deliveries"
          value={delivered.isLoading ? "—" : delivered.data?.total || 0}
          text="Inventory already deducted"
        />
      </section>
      <section className="sales-board">
        <header>
          <div>
            <p>Fulfillment register</p>
            <h2>Customer orders</h2>
          </div>
          <div className="sales-toolbar">
            <div className="search-box">
              <Search />
              <Input
                placeholder="Search order number or customer..."
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
              {Object.entries(statuses).map(([value, label]) => (
                <option key={value} value={value}>
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
            <h3>Unable to load sales orders</h3>
          </State>
        ) : !query.data?.items.length ? (
          <State>
            <ShoppingBag />
            <h3>No sales orders yet</h3>
            <p>Accept a quotation, then convert it to a sales order.</p>
          </State>
        ) : (
          <div className="sales-list">
            {query.data.items.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                canConfirm={canConfirm}
                canUpdate={canUpdate}
                canDeliver={canDeliver}
                busy={action.isPending}
                onView={() => setDetail(order)}
                onConfirm={() => setConfirming(order)}
                onCancel={() => setCancelling(order)}
                onDeliver={() => setDelivering(order)}
              />
            ))}
          </div>
        )}
        {pages > 1 && (
          <div className="sales-pagination">
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
      <OrderDetail
        order={detail}
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
      />
      <QuotationDialog
        open={creating}
        onOpenChange={setCreating}
        quotation={null}
        mode="sales-order"
        onSave={(input) => create.mutate(input)}
        loading={create.isPending}
      />
      <CancelDialog
        order={cancelling}
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && setCancelling(null)}
        loading={action.isPending}
        onSubmit={(reason) =>
          action.mutate({ type: "cancel", order: cancelling, input: reason })
        }
      />
      <ConfirmDialog
        order={confirming}
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        loading={action.isPending}
        onConfirm={(warehouseId) =>
          action.mutate({
            type: "confirm",
            order: confirming,
            input: { warehouse_id: Number(warehouseId) },
          })
        }
      />
      <DeliveryDialog
        order={delivering}
        open={Boolean(delivering)}
        onOpenChange={(open) => !open && setDelivering(null)}
        onDelivered={() => {
          setDelivering(null);
          refresh();
        }}
      />
    </div>
  );
}

function Metric({ icon: Icon, label, value, text }) {
  return (
    <article className="sales-metric">
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
function OrderRow({
  order,
  canConfirm,
  canUpdate,
  canDeliver,
  busy,
  onView,
  onConfirm,
  onCancel,
  onDeliver,
}) {
  return (
    <article className={`sales-row status-${order.status}`}>
      <span className="sales-row-icon">
        <Box />
      </span>
      <div className="sales-main">
        <div>
          <strong>{order.number}</strong>
          <span className={`sales-status ${order.status}`}>
            {statuses[order.status]}
          </span>
        </div>
        <p>
          {order.customer.code} · {order.customer.name}
        </p>
        <small>
          {order.quotation_id
            ? `From quotation #${order.quotation_id}`
            : "Direct sales order"}{" "}
          · {order.items.length} lines
          {order.warehouse ? ` · ${order.warehouse.name}` : ""}
        </small>
      </div>
      <div className="sales-value">
        <small>Order total</small>
        <strong>{money(order.total_amount)}</strong>
        <span>Created {dateTime(order.created_at)}</span>
      </div>
      <div className="sales-actions">
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye />
          Details
        </Button>
        {order.status === "draft" && canUpdate && (
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
        {order.status === "draft" && canConfirm && (
          <Button size="sm" disabled={busy} onClick={onConfirm}>
            <Check />
            Confirm order
          </Button>
        )}
        {order.status === "confirmed" && canDeliver && (
          <Button size="sm" onClick={onDeliver}>
            <Truck />
            Deliver order
          </Button>
        )}
      </div>
    </article>
  );
}
function OrderDetail({ order, open, onOpenChange }) {
  if (!order) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl printable-document">
        <DialogHeader>
          <DialogTitle>{order.number}</DialogTitle>
          <DialogDescription>
            Sales order for {order.customer.name}
          </DialogDescription>
        </DialogHeader>
        <div className="sales-timeline">
          <Step done label="Order created" text={dateTime(order.created_at)} />
          <Step
            done={["confirmed", "delivered"].includes(order.status)}
            label="Confirmed"
            text={dateTime(order.confirmed_at)}
          />
          <Step
            done={order.status === "delivered"}
            label="Warehouse delivery"
            text={dateTime(order.delivery?.delivered_at)}
          />
        </div>
        <div className="quote-detail-lines">
          <header>
            <span>Product</span>
            <span>Quantity</span>
            <span>Unit price</span>
            <span>Discount</span>
            <span>Total</span>
          </header>
          {order.items.map((item) => (
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
            Subtotal <b>{money(order.subtotal)}</b>
          </span>
          <span>
            Discount <b>- {money(order.discount_amount)}</b>
          </span>
          <span>
            Tax <b>{money(order.tax_amount)}</b>
          </span>
          <strong>
            Total <b>{money(order.total_amount)}</b>
          </strong>
        </div>
        {order.delivery && (
          <div className="sales-delivery-result">
            <Truck />
            <div>
              <strong>
                {order.delivery.number} · {order.delivery.warehouse.name}
              </strong>
              <span>
                Inventory deducted on {dateTime(order.delivery.delivered_at)}
              </span>
            </div>
          </div>
        )}
        {order.credit_warning && (
          <div className="purchase-detail-note danger">
            <strong>Credit warning</strong>
            <p>{order.credit_warning}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Print sales order
          </Button>
        </DialogFooter>
        {order.cancellation_reason && (
          <div className="purchase-detail-note danger">
            <strong>Cancellation reason</strong>
            <p>{order.cancellation_reason}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
function Step({ done, label, text }) {
  return (
    <div className={done ? "done" : ""}>
      <span>{done ? <Check /> : <Box />}</span>
      <div>
        <strong>{label}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}
function CancelDialog({ order, open, onOpenChange, loading, onSubmit }) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel sales order</DialogTitle>
          <DialogDescription>
            Record why {order?.number} will not be fulfilled.
          </DialogDescription>
        </DialogHeader>
        <form
          className="dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(reason.trim());
          }}
        >
          <div className="form-field">
            <Label htmlFor="sales-cancel-reason">Reason</Label>
            <Input
              id="sales-cancel-reason"
              minLength={3}
              maxLength={500}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Keep order
            </Button>
            <Button
              variant="destructive"
              disabled={loading || reason.trim().length < 3}
            >
              Cancel order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function ConfirmDialog({ order, open, onOpenChange, loading, onConfirm }) {
  const [warehouseId, setWarehouseId] = useState("");
  const availability = useQuery({
    queryKey: ["sales-availability", order?.id],
    queryFn: () => salesOrdersApi.availability(order.id),
    enabled: open && Boolean(order),
  });
  useEffect(() => {
    if (open) setWarehouseId("");
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirm {order?.number}</DialogTitle>
          <DialogDescription>
            Select the fulfillment warehouse. Confirmation checks every stock
            line and the customer credit limit without deducting inventory.
          </DialogDescription>
        </DialogHeader>
        {availability.isLoading ? (
          <State>
            <div className="loader" />
          </State>
        ) : availability.isError ? (
          <State>
            <AlertTriangle />
            <h3>Unable to check inventory</h3>
          </State>
        ) : (
          <WarehouseOptions
            entries={availability.data}
            warehouseId={warehouseId}
            onSelect={setWarehouseId}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!warehouseId || loading}
            onClick={() => onConfirm(warehouseId)}
          >
            <Check />
            Confirm order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function DeliveryDialog({ order, open, onOpenChange, onDelivered }) {
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (open) {
      setNotes("");
    }
  }, [open]);
  const delivery = useMutation({
    mutationFn: () =>
      salesOrdersApi.deliver(order.id, {
        notes: notes.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Order delivered and inventory deducted");
      onDelivered();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Deliver {order?.number}</DialogTitle>
          <DialogDescription>
            Stock will be deducted from{" "}
            {order?.warehouse?.name || "the warehouse selected at confirmation"}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="form-field">
          <Label htmlFor="delivery-notes">Delivery notes (optional)</Label>
          <Input
            id="delivery-notes"
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={delivery.isPending}
            onClick={() => delivery.mutate()}
          >
            <Truck />
            Deliver and deduct stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function WarehouseOptions({ entries, warehouseId, onSelect }) {
  return (
    <div className="warehouse-options">
      {entries?.map((entry) => (
        <button
          type="button"
          key={entry.warehouse.id}
          className={`${entry.ready ? "ready" : "blocked"} ${Number(warehouseId) === entry.warehouse.id ? "selected" : ""}`}
          disabled={!entry.ready}
          onClick={() => onSelect(String(entry.warehouse.id))}
        >
          <header>
            <span>
              <strong>{entry.warehouse.name}</strong>
              <small>{entry.warehouse.code}</small>
            </span>
            <b>{entry.ready ? "Ready" : "Insufficient stock"}</b>
          </header>
          <div>
            {entry.items.map((item) => (
              <span
                key={item.product_id}
                className={item.sufficient ? "" : "short"}
              >
                <small>{item.sku}</small>
                <strong>
                  {item.available} / {item.required}
                </strong>
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
function State({ children }) {
  return <div className="sales-state">{children}</div>;
}
