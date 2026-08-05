import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const blank = { name: '', contact_person: '', email: '', phone: '', address: '', city: '', tax_number: '', credit_limit: '0' }

export function CustomerDialog({ open, onOpenChange, customer, onSave, loading }) {
  const [form, setForm] = useState(blank)
  useEffect(() => setForm(customer ? {
    name: customer.name, contact_person: customer.contact_person || '', email: customer.email || '',
    phone: customer.phone || '', address: customer.address || '', city: customer.city || '',
    tax_number: customer.tax_number || '', credit_limit: customer.credit_limit || '0',
  } : blank), [customer, open])
  const field = (name) => ({ value: form[name], onChange: (event) => setForm({ ...form, [name]: event.target.value }) })
  const submit = (event) => {
    event.preventDefault()
    const optional = (value) => value.trim() || null
    onSave({ name: form.name.trim(), contact_person: optional(form.contact_person), email: optional(form.email)?.toLowerCase() || null, phone: optional(form.phone), address: optional(form.address), city: optional(form.city), tax_number: optional(form.tax_number), credit_limit: form.credit_limit || '0' })
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{customer ? 'Edit customer' : 'Add customer'}</DialogTitle><DialogDescription>Keep commercial and contact information ready for quotations and sales orders.</DialogDescription></DialogHeader><form className="dialog-form customer-form" onSubmit={submit}>
    <div className="form-grid"><div className="form-field"><Label htmlFor="customer-name">Customer name</Label><Input id="customer-name" {...field('name')} minLength={2} maxLength={150} placeholder="Al Rawabi Trading Co." required /></div><div className="form-field"><Label htmlFor="customer-contact">Contact person</Label><Input id="customer-contact" {...field('contact_person')} maxLength={150} placeholder="Rana Khalil" /></div></div>
    <div className="form-grid"><div className="form-field"><Label htmlFor="customer-email">Email address</Label><Input id="customer-email" type="email" {...field('email')} maxLength={255} placeholder="sales@example.com" /></div><div className="form-field"><Label htmlFor="customer-phone">Phone number</Label><Input id="customer-phone" type="tel" {...field('phone')} maxLength={30} placeholder="+962 79 000 0000" /></div></div>
    <div className="form-field"><Label htmlFor="customer-address">Address</Label><Input id="customer-address" {...field('address')} maxLength={255} placeholder="Street and building" /></div>
    <div className="form-grid"><div className="form-field"><Label htmlFor="customer-city">City</Label><Input id="customer-city" {...field('city')} maxLength={100} placeholder="Amman" /></div><div className="form-field"><Label htmlFor="customer-tax">Tax number</Label><Input id="customer-tax" {...field('tax_number')} maxLength={100} placeholder="Optional" /></div></div>
    <div className="form-field"><Label htmlFor="customer-credit">Credit limit (JOD)</Label><Input id="customer-credit" type="number" min="0" step="0.01" {...field('credit_limit')} required /><span className="field-hint">Maximum approved credit for future sales. Use zero for cash-only customers.</span></div>
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}{customer ? 'Save changes' : 'Add customer'}</Button></DialogFooter>
  </form></DialogContent></Dialog>
}
