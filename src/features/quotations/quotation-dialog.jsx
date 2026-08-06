import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { customersApi } from "@/features/customers/api";
import { productsApi } from "@/features/products/api";

const futureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
};
const blankLine = () => ({
  product_id: "",
  quantity: "1",
  unit_price: "0",
  discount_percent: "0",
});
const blank = () => ({
  customer_id: "",
  valid_until: futureDate(),
  notes: "",
  discount_percent: "0",
  tax_percent: "16",
  items: [blankLine()],
});
const money = (value) =>
  new Intl.NumberFormat("en-JO", { style: "currency", currency: "JOD" }).format(
    Number(value || 0),
  );

export function QuotationDialog({
  open,
  onOpenChange,
  quotation,
  onSave,
  loading,
  mode = "quotation",
}) {
  const [form, setForm] = useState(blank);
  const customers = useQuery({
    queryKey: ["quotation-customers"],
    queryFn: () => customersApi.list({ page: 1, size: 100, status: "true" }),
    enabled: open,
  });
  const products = useQuery({
    queryKey: ["quotation-products"],
    queryFn: () => productsApi.list({ page: 1, size: 100, status: "true" }),
    enabled: open,
  });
  useEffect(
    () =>
      setForm(
        quotation
          ? {
              customer_id: String(quotation.customer_id),
              valid_until: quotation.valid_until,
              notes: quotation.notes || "",
              discount_percent: String(quotation.discount_percent),
              tax_percent: String(quotation.tax_percent),
              items: quotation.items.map((item) => ({
                product_id: String(item.product_id),
                quantity: String(item.quantity),
                unit_price: String(item.unit_price),
                discount_percent: String(item.discount_percent),
              })),
            }
          : blank(),
      ),
    [quotation, open],
  );
  const totals = useMemo(() => {
    const subtotal = form.items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
      0,
    );
    const afterLineDiscounts = form.items.reduce((sum, item) => {
      const gross = Number(item.quantity || 0) * Number(item.unit_price || 0);
      return sum + gross * (1 - Number(item.discount_percent || 0) / 100);
    }, 0);
    const discount =
      subtotal -
      afterLineDiscounts +
      (afterLineDiscounts * Number(form.discount_percent || 0)) / 100;
    const tax = ((subtotal - discount) * Number(form.tax_percent || 0)) / 100;
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }, [form]);
  const updateItem = (index, changes) =>
    setForm({
      ...form,
      items: form.items.map((item, position) =>
        position === index ? { ...item, ...changes } : item,
      ),
    });
  const selectProduct = (index, id) => {
    const product = products.data?.items.find((item) => String(item.id) === id);
    updateItem(index, {
      product_id: id,
      unit_price: product ? String(product.sale_price) : "0",
    });
  };
  const submit = (event) => {
    event.preventDefault();
    const input = {
      customer_id: Number(form.customer_id),
      valid_until: form.valid_until,
      notes: form.notes.trim() || null,
      discount_percent: form.discount_percent || "0",
      tax_percent: form.tax_percent || "0",
      items: form.items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || "0",
      })),
    };
    if (mode === "sales-order") delete input.valid_until;
    onSave(input);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "sales-order"
              ? "Create sales order"
              : quotation
                ? "Edit quotation"
                : "Create quotation"}
          </DialogTitle>
          <DialogDescription>
            {mode === "sales-order"
              ? "Create a direct draft order without a quotation."
              : "Prepare a commercial offer using active customers and catalog products."}
          </DialogDescription>
        </DialogHeader>
        <form className="dialog-form quotation-form" onSubmit={submit}>
          <div className="form-grid">
            {mode === "quotation" && (
              <div className="form-field">
                <Label htmlFor="quote-customer">Customer</Label>
                <select
                  id="quote-customer"
                  className="form-select"
                  value={form.customer_id}
                  onChange={(event) =>
                    setForm({ ...form, customer_id: event.target.value })
                  }
                  required
                >
                  <option value="">Select customer</option>
                  {customers.data?.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} — {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-field">
              <Label htmlFor="quote-valid">Valid until</Label>
              <Input
                id="quote-valid"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.valid_until}
                onChange={(event) =>
                  setForm({ ...form, valid_until: event.target.value })
                }
                required
              />
            </div>
          </div>
          <section className="quote-lines">
            <header>
              <div>
                <strong>Quoted products</strong>
                <span>
                  Whole units, customer-facing prices, and line discounts
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({ ...form, items: [...form.items, blankLine()] })
                }
              >
                <Plus />
                Add line
              </Button>
            </header>
            {form.items.map((item, index) => {
              const gross = Number(item.quantity) * Number(item.unit_price);
              const lineTotal =
                gross * (1 - Number(item.discount_percent || 0) / 100);
              return (
                <div className="quote-line" key={index}>
                  <div className="form-field">
                    <Label>Product</Label>
                    <select
                      className="form-select"
                      value={item.product_id}
                      onChange={(event) =>
                        selectProduct(index, event.target.value)
                      }
                      required
                    >
                      <option value="">Select product</option>
                      {products.data?.items
                        .filter(
                          (product) =>
                            !form.items.some(
                              (line, position) =>
                                position !== index &&
                                String(line.product_id) === String(product.id),
                            ),
                        )
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.sku} — {product.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, { quantity: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-field">
                    <Label>Unit price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(event) =>
                        updateItem(index, { unit_price: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-field">
                    <Label>Line discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount_percent}
                      onChange={(event) =>
                        updateItem(index, {
                          discount_percent: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="quote-line-total">
                    <small>Line total</small>
                    <strong>{money(lineTotal)}</strong>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={form.items.length === 1}
                    onClick={() =>
                      setForm({
                        ...form,
                        items: form.items.filter(
                          (_, position) => position !== index,
                        ),
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
          </section>
          <div className="quote-commercial">
            <div className="form-field">
              <Label htmlFor="quote-discount">
                Additional quotation discount %
              </Label>
              <Input
                id="quote-discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.discount_percent}
                onChange={(event) =>
                  setForm({ ...form, discount_percent: event.target.value })
                }
              />
            </div>
            <div className="form-field">
              <Label htmlFor="quote-tax">Tax %</Label>
              <Input
                id="quote-tax"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.tax_percent}
                onChange={(event) =>
                  setForm({ ...form, tax_percent: event.target.value })
                }
              />
            </div>
            <div className="form-field quote-notes">
              <Label htmlFor="quote-notes">Notes</Label>
              <Input
                id="quote-notes"
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                maxLength={2000}
                placeholder="Delivery, payment, or warranty terms"
              />
            </div>
            <div className="quote-total-card">
              <span>
                Subtotal <b>{money(totals.subtotal)}</b>
              </span>
              <span>
                All discounts <b>- {money(totals.discount)}</b>
              </span>
              <span>
                Tax <b>{money(totals.tax)}</b>
              </span>
              <strong>
                Total <b>{money(totals.total)}</b>
              </strong>
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
                loading ||
                !form.customer_id ||
                form.items.some((item) => !item.product_id)
              }
            >
              {loading && <LoaderCircle className="size-4 animate-spin" />}
              {quotation
                ? "Save changes"
                : mode === "sales-order"
                  ? "Create order"
                  : "Create draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
