import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const blank = { name: '', email: '', phone: '', credit_terms: '' }

export function SupplierDialog({ open, onOpenChange, supplier, onSave, loading }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { setForm(supplier ? { name: supplier.name, email: supplier.email, phone: supplier.phone || '', credit_terms: supplier.credit_terms || '' } : blank) }, [supplier, open])
  const field = (name) => ({ value: form[name], onChange: (event) => setForm({ ...form, [name]: event.target.value }) })
  const submit = (event) => {
    event.preventDefault()
    onSave({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() || null, credit_terms: form.credit_terms.trim() || null })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{supplier ? 'Edit supplier' : 'Add supplier'}</DialogTitle><DialogDescription>{supplier ? 'Update supplier contact and commercial terms.' : 'Create an approved supplier record for future purchase orders.'}</DialogDescription></DialogHeader>
    <form className="dialog-form" onSubmit={submit}>
      <div className="form-field"><Label htmlFor="supplier-name">Supplier name</Label><Input id="supplier-name" {...field('name')} minLength={2} maxLength={150} placeholder="Jordan Office Solutions" required /></div>
      <div className="form-grid"><div className="form-field"><Label htmlFor="supplier-email">Email address</Label><Input id="supplier-email" type="email" {...field('email')} maxLength={255} placeholder="purchasing@example.com" required /></div><div className="form-field"><Label htmlFor="supplier-phone">Phone number</Label><Input id="supplier-phone" type="tel" {...field('phone')} maxLength={30} placeholder="Optional" /></div></div>
      <div className="form-field"><Label htmlFor="supplier-credit-terms">Credit terms</Label><Input id="supplier-credit-terms" {...field('credit_terms')} maxLength={100} placeholder="Example: Net 30" /><span className="field-hint">Optional payment agreement, such as Net 15, Net 30, or payment on delivery.</span></div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}{supplier ? 'Save changes' : 'Add supplier'}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>
}
