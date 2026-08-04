import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, LoaderCircle, Package, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inventoryApi } from './api'

const blank = { product_id: '', source_warehouse_id: '', destination_warehouse_id: '', quantity: '', reason: '' }

export function TransferDialog({ open, onOpenChange, products, warehouses, onSave, loading }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { if (!open) setForm(blank) }, [open])
  const stockQuery = useQuery({
    queryKey: ['inventory-transfer-stock', form.product_id],
    queryFn: () => inventoryApi.stock({ page: 1, size: 100, productId: form.product_id }),
    enabled: open && Boolean(form.product_id),
  })
  const stockByWarehouse = useMemo(() => new Map((stockQuery.data?.items || []).map((item) => [String(item.warehouse_id), Number(item.quantity)])), [stockQuery.data])
  const sourceQuantity = stockByWarehouse.get(form.source_warehouse_id) || 0
  const destinationQuantity = stockByWarehouse.get(form.destination_warehouse_id) || 0
  const quantity = Number(form.quantity || 0)
  const sourceWarehouses = warehouses.filter((warehouse) => (stockByWarehouse.get(String(warehouse.id)) || 0) > 0)
  const destinationWarehouses = warehouses.filter((warehouse) => String(warehouse.id) !== form.source_warehouse_id)
  const invalidQuantity = quantity <= 0 || quantity > sourceQuantity || !Number.isInteger(quantity)

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value, ...(field === 'product_id' ? { source_warehouse_id: '', destination_warehouse_id: '' } : {}), ...(field === 'source_warehouse_id' && current.destination_warehouse_id === value ? { destination_warehouse_id: '' } : {}) }))
  const submit = (event) => {
    event.preventDefault()
    onSave({ product_id: Number(form.product_id), source_warehouse_id: Number(form.source_warehouse_id), destination_warehouse_id: Number(form.destination_warehouse_id), quantity: form.quantity, reason: form.reason.trim() })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="transfer-dialog"><DialogHeader><DialogTitle>Transfer stock</DialogTitle><DialogDescription>Move units between warehouses. Both inventory movements will share one auditable transfer reference.</DialogDescription></DialogHeader>
    <form className="dialog-form" onSubmit={submit}>
      <div className="form-field"><Label htmlFor="transfer-product">Product</Label><select id="transfer-product" className="form-select" value={form.product_id} onChange={(event) => update('product_id', event.target.value)} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.sku} — {product.name}</option>)}</select></div>
      <div className="transfer-route">
        <div className="form-field"><Label htmlFor="source-warehouse">Source warehouse</Label><select id="source-warehouse" className="form-select" value={form.source_warehouse_id} onChange={(event) => update('source_warehouse_id', event.target.value)} disabled={!form.product_id || stockQuery.isLoading} required><option value="">{stockQuery.isLoading ? 'Loading stock...' : 'Select source'}</option>{sourceWarehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} — {formatQuantity(stockByWarehouse.get(String(warehouse.id)))} available</option>)}</select><span className="transfer-balance"><Warehouse />Available: <strong>{formatQuantity(sourceQuantity)}</strong></span></div>
        <span className="transfer-arrow"><ArrowRight /></span>
        <div className="form-field"><Label htmlFor="destination-warehouse">Destination warehouse</Label><select id="destination-warehouse" className="form-select" value={form.destination_warehouse_id} onChange={(event) => update('destination_warehouse_id', event.target.value)} disabled={!form.source_warehouse_id} required><option value="">Select destination</option>{destinationWarehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} — {warehouse.name}</option>)}</select><span className="transfer-balance"><Warehouse />Current stock: <strong>{formatQuantity(destinationQuantity)}</strong></span></div>
      </div>
      <div className="form-grid"><div className="form-field"><Label htmlFor="transfer-quantity">Quantity (units)</Label><Input id="transfer-quantity" type="number" min="1" max={sourceQuantity || undefined} step="1" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} placeholder="Enter whole units" required />{form.quantity && quantity > sourceQuantity && <span className="field-error">Quantity exceeds available stock.</span>}</div><div className="form-field"><Label htmlFor="transfer-reason">Reason</Label><Input id="transfer-reason" minLength={3} maxLength={500} value={form.reason} onChange={(event) => update('reason', event.target.value)} placeholder="Example: Replenish retail location" required /></div></div>
      {form.source_warehouse_id && form.destination_warehouse_id && quantity > 0 && <div className="transfer-preview"><Package /><div><strong>Transfer preview</strong><span>Source: {formatQuantity(sourceQuantity)} → {formatQuantity(sourceQuantity - quantity)}</span><span>Destination: {formatQuantity(destinationQuantity)} → {formatQuantity(destinationQuantity + quantity)}</span></div></div>}
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading || invalidQuantity || !form.source_warehouse_id || !form.destination_warehouse_id || form.reason.trim().length < 3}>{loading && <LoaderCircle className="size-4 animate-spin" />}Confirm transfer</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>
}

function formatQuantity(value) { return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) }
