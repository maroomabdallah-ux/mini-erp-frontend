import { useEffect, useState } from "react";
import { LoaderCircle, PackageCheck } from "lucide-react";
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

export function ReasonDialog({
  open,
  onOpenChange,
  mode,
  order,
  onConfirm,
  loading,
}) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open, mode]);
  const reject = mode === "reject";
  const submit = (event) => {
    event.preventDefault();
    onConfirm(reason.trim());
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {reject ? "Reject purchase order" : "Cancel purchase order"}
          </DialogTitle>
          <DialogDescription>
            {reject
              ? `Return ${order?.number || "this order"} to purchasing with a clear decision reason.`
              : `Stop ${order?.number || "this order"}. This action cannot be reversed.`}
          </DialogDescription>
        </DialogHeader>
        <form className="dialog-form" onSubmit={submit}>
          <div className="form-field">
            <Label htmlFor="workflow-reason">Reason</Label>
            <Input
              id="workflow-reason"
              minLength={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                reject
                  ? "Example: Budget is not approved"
                  : "Example: Supplier changed the quotation"
              }
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              disabled={loading || reason.trim().length < 3}
            >
              {loading && <LoaderCircle className="size-4 animate-spin" />}
              {reject ? "Reject order" : "Cancel order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReceiveDialog({
  open,
  onOpenChange,
  order,
  warehouses,
  onConfirm,
  loading,
}) {
  const [form, setForm] = useState({ notes: "", items: [] });
  useEffect(() => {
    if (open)
      setForm({
        notes: "",
        items:
          order?.items
            ?.filter((item) => item.received_quantity < item.quantity)
            .map((item) => ({
              purchase_order_item_id: item.id,
              quantity: String(item.quantity - item.received_quantity),
            })) || [],
      });
  }, [open, order]);
  const submit = (event) => {
    event.preventDefault();
    onConfirm({
      notes: form.notes.trim() || null,
      items: form.items
        .filter((item) => Number(item.quantity) > 0)
        .map((item) => ({
          purchase_order_item_id: item.purchase_order_item_id,
          quantity: Number(item.quantity),
        })),
    });
  };
  const warehouse = warehouses.find((item) => item.id === order?.warehouse_id);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive purchase order</DialogTitle>
          <DialogDescription>
            Record the quantities delivered for {order?.number}. A partial
            delivery keeps the order open.
          </DialogDescription>
        </DialogHeader>
        <form className="dialog-form" onSubmit={submit}>
          <div className="form-field">
            <Label>Destination warehouse</Label>
            <Input
              value={
                warehouse
                  ? `${warehouse.code} — ${warehouse.name}`
                  : order?.warehouse?.name || ""
              }
              disabled
            />
          </div>
          {form.items.map((line, index) => {
            const item = order.items.find(
              (candidate) => candidate.id === line.purchase_order_item_id,
            );
            const remaining = item.quantity - item.received_quantity;
            return (
              <div className="form-field" key={line.purchase_order_item_id}>
                <Label>
                  {item.product.name} · remaining {remaining}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={remaining}
                  step="1"
                  value={line.quantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      items: form.items.map((current, itemIndex) =>
                        itemIndex === index
                          ? { ...current, quantity: event.target.value }
                          : current,
                      ),
                    })
                  }
                />
              </div>
            );
          })}
          <div className="form-field">
            <Label htmlFor="receipt-notes">Receipt notes</Label>
            <Input
              id="receipt-notes"
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
              maxLength={500}
              placeholder="Example: Partial delivery checked"
            />
          </div>
          <div className="receipt-impact">
            <PackageCheck />
            <div>
              <strong>Inventory updates immediately</strong>
              <span>
                Only the entered quantities will be added and posted to
                accounting.
              </span>
            </div>
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
                loading || !form.items.some((item) => Number(item.quantity) > 0)
              }
            >
              {loading && <LoaderCircle className="size-4 animate-spin" />}
              Confirm receipt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
