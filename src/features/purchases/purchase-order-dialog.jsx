import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, PackagePlus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const blankLine = () => ({ product_id: '', quantity: '1', unit_cost: '' })

export function PurchaseOrderDialog({ open, onOpenChange, order, suppliers, products, onSave, loading }) {
  const [form, setForm] = useState({ supplier_id: '', notes: '', items: [blankLine()] })
  useEffect(() => {
    if (!open) return
    setForm(order ? {
      supplier_id: String(order.supplier_id),
      notes: order.notes || '',
      items: order.items.map((item) => ({ product_id: String(item.product_id), quantity: String(item.quantity), unit_cost: String(item.unit_cost) })),
    } : { supplier_id: '', notes: '', items: [blankLine()] })
  }, [open, order])
  const total = useMemo(() => form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0), [form.items])
  const selectedIds = new Set(form.items.map((item) => item.product_id).filter(Boolean))
  const changeLine = (index, patch) => setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }))
  const chooseProduct = (index, productId) => {
    const product = products.find((item) => String(item.id) === productId)
    changeLine(index, { product_id: productId, unit_cost: product ? String(product.cost_price) : '' })
  }
  const removeLine = (index) => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))
  const valid = form.supplier_id && form.items.length > 0 && form.items.every((item) => item.product_id && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 && item.unit_cost !== '' && Number(item.unit_cost) >= 0)
  const submit = (event) => {
    event.preventDefault()
    onSave({
      supplier_id: Number(form.supplier_id),
      notes: form.notes.trim() || null,
      items: form.items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity), unit_cost: Number(item.unit_cost).toFixed(2) })),
    })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>{order ? 'Edit purchase order' : 'Create purchase order'}</DialogTitle><DialogDescription>{order ? 'Update the supplier and ordered items while this order is still a draft.' : 'Build a draft order from active suppliers and catalog products. Stock is not changed until goods are received.'}</DialogDescription></DialogHeader>
    <form className="dialog-form purchase-order-form" onSubmit={submit}>
      <div className="purchase-order-head-fields"><div className="form-field"><Label htmlFor="po-supplier">Supplier</Label><select id="po-supplier" className="form-select" value={form.supplier_id} onChange={(event) => setForm({ ...form, supplier_id: event.target.value })} required><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name} · {supplier.credit_terms || 'Terms not specified'}</option>)}</select></div><div className="form-field"><Label htmlFor="po-notes">Internal notes</Label><Input id="po-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} maxLength={2000} placeholder="Example: Monthly replenishment" /></div></div>
      <section className="purchase-lines-editor"><header><div><PackagePlus /><span><strong>Order items</strong><small>Whole units and agreed supplier cost</small></span></div><Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, items: [...form.items, blankLine()] })}><Plus />Add line</Button></header>
        <div className="purchase-line-labels"><span>Product</span><span>Quantity</span><span>Unit cost</span><span>Line total</span><span /></div>
        {form.items.map((item, index) => <div className="purchase-line" key={index}><select className="form-select" aria-label="Product" value={item.product_id} onChange={(event) => chooseProduct(index, event.target.value)} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id} disabled={selectedIds.has(String(product.id)) && item.product_id !== String(product.id)}>{product.sku} — {product.name}</option>)}</select><Input aria-label="Quantity" type="number" min="1" step="1" value={item.quantity} onChange={(event) => changeLine(index, { quantity: event.target.value })} required /><Input aria-label="Unit cost" type="number" min="0" step="0.01" value={item.unit_cost} onChange={(event) => changeLine(index, { unit_cost: event.target.value })} required /><strong>{money(Number(item.quantity || 0) * Number(item.unit_cost || 0))}</strong><Button type="button" variant="ghost" size="icon" disabled={form.items.length === 1} onClick={() => removeLine(index)} aria-label="Remove line"><Trash2 /></Button></div>)}
        <footer><span>{form.items.length} {form.items.length === 1 ? 'line' : 'lines'}</span><div><small>Order total</small><strong>{money(total)}</strong></div></footer>
      </section>
      <div className="purchase-draft-note">This saves a draft only. Submit it when it is ready for manager approval.</div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading || !valid}>{loading && <LoaderCircle className="size-4 animate-spin" />}{order ? 'Save draft' : 'Create draft'}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>
}

function money(value) { return Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'JOD', minimumFractionDigits: 2 }) }
