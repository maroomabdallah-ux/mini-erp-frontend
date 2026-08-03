import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const blank = { code: '', name: '', address: '' }

export function WarehouseDialog({ open, onOpenChange, warehouse, onSave, loading }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { setForm(warehouse ? { code: warehouse.code, name: warehouse.name, address: warehouse.address || '' } : blank) }, [warehouse, open])
  const field = (name) => ({ value: form[name], onChange: (event) => setForm({ ...form, [name]: event.target.value }) })
  const submit = (event) => { event.preventDefault(); onSave({ code: form.code.trim().toUpperCase(), name: form.name.trim(), address: form.address.trim() || null }) }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{warehouse ? 'Edit warehouse' : 'Add warehouse'}</DialogTitle><DialogDescription>{warehouse ? 'Update the warehouse identity and location.' : 'Create a warehouse for inventory and business operations.'}</DialogDescription></DialogHeader>
    <form className="dialog-form" onSubmit={submit}><div className="form-grid"><div className="form-field"><Label htmlFor="warehouse-code">Warehouse code</Label><Input id="warehouse-code" {...field('code')} minLength={2} maxLength={50} placeholder="WH-AMM-MAIN" required /><span className="field-hint">Use a short unique code. It will be saved in uppercase.</span></div><div className="form-field"><Label htmlFor="warehouse-name">Warehouse name</Label><Input id="warehouse-name" {...field('name')} minLength={2} maxLength={150} placeholder="Amman Main Warehouse" required /></div></div><div className="form-field"><Label htmlFor="warehouse-address">Address</Label><Input id="warehouse-address" {...field('address')} maxLength={500} placeholder="Optional warehouse location" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}{warehouse ? 'Save changes' : 'Add warehouse'}</Button></DialogFooter></form>
  </DialogContent></Dialog>
}
