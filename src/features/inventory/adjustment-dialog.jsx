import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const blank = { product_id: '', warehouse_id: '', quantity_change: '', reason: '' }

export function AdjustmentDialog({ open, onOpenChange, products, warehouses, initialStock, onSave, loading }) {
  const [form, setForm] = useState(blank)
  useEffect(() => {
    setForm(initialStock ? { ...blank, product_id: String(initialStock.product_id), warehouse_id: String(initialStock.warehouse_id) } : blank)
  }, [initialStock, open])
  const change = Number(form.quantity_change)
  const currentQuantity = Number(initialStock?.quantity || 0)

  const submit = (event) => {
    event.preventDefault()
    onSave({
      product_id: Number(form.product_id),
      warehouse_id: Number(form.warehouse_id),
      quantity_change: form.quantity_change,
      reason: form.reason.trim(),
    })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Manual stock adjustment</DialogTitle><DialogDescription>Correct the recorded quantity after a physical check, damage, or another exceptional event.</DialogDescription></DialogHeader>
    <form className="dialog-form" onSubmit={submit}>
      <div className="form-grid"><div className="form-field"><Label htmlFor="adjust-product">Product</Label><select id="adjust-product" className="form-select" value={form.product_id} onChange={(event) => setForm({ ...form, product_id: event.target.value })} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.sku} — {product.name}</option>)}</select></div><div className="form-field"><Label htmlFor="adjust-warehouse">Warehouse</Label><select id="adjust-warehouse" className="form-select" value={form.warehouse_id} onChange={(event) => setForm({ ...form, warehouse_id: event.target.value })} required><option value="">Select warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} — {warehouse.name}</option>)}</select></div></div>
      <div className="form-field"><Label htmlFor="quantity-change">Quantity change (units)</Label><Input id="quantity-change" type="number" step="1" value={form.quantity_change} onChange={(event) => setForm({ ...form, quantity_change: event.target.value })} placeholder="Enter 9 to add or -9 to remove" required /><span className="field-hint">Enter whole units. For example, 9 means nine items; 0.09 does not mean nine items.</span><div className={`adjustment-direction ${change < 0 ? 'out' : 'in'}`}>{change < 0 ? <ArrowUpFromLine /> : <ArrowDownToLine />}<span>{form.quantity_change ? `Quantity will change from ${currentQuantity.toLocaleString('en-US')} to ${(currentQuantity + change).toLocaleString('en-US')}.` : `Current quantity: ${currentQuantity.toLocaleString('en-US')} units.`}</span></div></div>
      <div className="form-field"><Label htmlFor="adjust-reason">Reason</Label><Input id="adjust-reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} minLength={3} maxLength={500} placeholder="Example: Physical count correction" required /><span className="field-hint">A clear reason is required and will appear in the movement history.</span></div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading || !form.quantity_change || Number(form.quantity_change) === 0 || !Number.isInteger(change)}>{loading && <LoaderCircle className="size-4 animate-spin" />}Save adjustment</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>
}
