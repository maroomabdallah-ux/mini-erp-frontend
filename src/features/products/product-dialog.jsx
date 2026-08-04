import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const blank = { sku: '', name: '', barcode: '', category_id: '', cost_price: '0.00', sale_price: '0.00', min_stock_level: '0' }

export function ProductDialog({ open, onOpenChange, product, categories, onSave, loading }) {
  const [form, setForm] = useState(blank)
  useEffect(() => {
    setForm(product ? {
      sku: product.sku,
      name: product.name,
      barcode: product.barcode || '',
      category_id: product.category_id || '',
      cost_price: product.cost_price,
      sale_price: product.sale_price,
      min_stock_level: product.min_stock_level,
    } : blank)
  }, [product, open])
  const field = (name) => ({ value: form[name], onChange: (event) => setForm({ ...form, [name]: event.target.value }) })
  const submit = (event) => {
    event.preventDefault()
    onSave({
      ...form,
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      barcode: form.barcode.trim() || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      cost_price: Number(form.cost_price),
      sale_price: Number(form.sale_price),
      min_stock_level: Number(form.min_stock_level),
    })
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{product ? 'Edit product' : 'Add product'}</DialogTitle><DialogDescription>{product ? 'Update product identity, pricing, and stock settings.' : 'Create the catalog record only. Stock is added later to a selected warehouse through inventory receiving or adjustment.'}</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="dialog-form">
      <div className="form-grid"><div className="form-field"><Label htmlFor="product-name">Product name</Label><Input id="product-name" {...field('name')} minLength={2} maxLength={255} required /></div><div className="form-field"><Label htmlFor="product-sku">SKU</Label><Input id="product-sku" {...field('sku')} maxLength={100} required /></div></div>
      <div className="form-grid"><div className="form-field"><Label htmlFor="product-barcode">Barcode</Label><Input id="product-barcode" {...field('barcode')} maxLength={100} placeholder="Optional" /></div><div className="form-field"><Label htmlFor="product-category">Category</Label><select id="product-category" className="form-select" {...field('category_id')}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div></div>
      <div className="product-price-grid"><div className="form-field"><Label htmlFor="cost-price">Cost price</Label><Input id="cost-price" type="number" min="0" step="0.01" {...field('cost_price')} required /></div><div className="form-field"><Label htmlFor="sale-price">Sale price</Label><Input id="sale-price" type="number" min="0" step="0.01" {...field('sale_price')} required /></div><div className="form-field"><Label htmlFor="min-stock">Low-stock alert threshold</Label><Input id="min-stock" type="number" min="0" step="1" {...field('min_stock_level')} required /><span className="field-hint">This is an alert threshold, not the current quantity. Whole units only.</span></div></div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}{product ? 'Save changes' : 'Add product'}</Button></DialogFooter>
    </form></DialogContent></Dialog>
}
