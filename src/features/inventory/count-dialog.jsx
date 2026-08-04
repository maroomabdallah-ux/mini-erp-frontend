import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inventoryApi } from './api'

const blank = { product_id: '', warehouse_id: '', counted_quantity: '', notes: '' }

export function CountDialog({ open, onOpenChange, products, warehouses, onSave, loading }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { if (!open) setForm(blank) }, [open])
  const stockQuery = useQuery({ queryKey: ['inventory-count-stock', form.product_id], queryFn: () => inventoryApi.stock({ page: 1, size: 100, productId: form.product_id }), enabled: open && Boolean(form.product_id) })
  const stockByWarehouse = useMemo(() => new Map((stockQuery.data?.items || []).map((item) => [String(item.warehouse_id), Number(item.quantity)])), [stockQuery.data])
  const expected = stockByWarehouse.get(form.warehouse_id) || 0
  const counted = Number(form.counted_quantity || 0)
  const variance = counted - expected
  const submit = (event) => { event.preventDefault(); onSave({ product_id: Number(form.product_id), warehouse_id: Number(form.warehouse_id), counted_quantity: form.counted_quantity, notes: form.notes.trim() || null }) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Record physical count</DialogTitle><DialogDescription>Enter what was physically counted. Stock changes only after an authorized manager approves the result.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={submit}>
    <div className="form-field"><Label htmlFor="count-product">Product</Label><select id="count-product" className="form-select" value={form.product_id} onChange={(event) => setForm({ ...form, product_id: event.target.value, warehouse_id: '' })} required><option value="">Select product</option>{products.map((item) => <option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</select></div>
    <div className="form-field"><Label htmlFor="count-warehouse">Warehouse</Label><select id="count-warehouse" className="form-select" value={form.warehouse_id} onChange={(event) => setForm({ ...form, warehouse_id: event.target.value })} disabled={!form.product_id || stockQuery.isLoading} required><option value="">Select warehouse</option>{warehouses.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></div>
    <div className="form-grid"><div className="form-field"><Label htmlFor="counted-quantity">Counted quantity (units)</Label><Input id="counted-quantity" type="number" min="0" step="1" value={form.counted_quantity} onChange={(event) => setForm({ ...form, counted_quantity: event.target.value })} placeholder="Enter whole units" required /></div><div className="count-variance-preview"><span>System quantity<strong>{formatQuantity(expected)}</strong></span><span>Variance<strong className={variance < 0 ? 'negative' : variance > 0 ? 'positive' : ''}>{variance > 0 ? '+' : ''}{formatQuantity(variance)}</strong></span></div></div>
    <div className="form-field"><Label htmlFor="count-notes">Count notes</Label><Input id="count-notes" maxLength={500} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Example: Damaged units found on shelf B" /></div>
    <div className="count-workflow-note"><ClipboardCheck /><span>This creates a pending count for manager review. It does not immediately overwrite stock.</span></div>
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading || !form.warehouse_id || form.counted_quantity === '' || !Number.isInteger(counted)}>{loading && <LoaderCircle className="size-4 animate-spin" />}Submit count</Button></DialogFooter>
  </form></DialogContent></Dialog>
}
function formatQuantity(value) { return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) }
