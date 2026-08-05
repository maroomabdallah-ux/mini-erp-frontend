import { useEffect, useState } from 'react'
import { LoaderCircle, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ReasonDialog({ open, onOpenChange, mode, order, onConfirm, loading }) {
  const [reason, setReason] = useState('')
  useEffect(() => { if (open) setReason('') }, [open, mode])
  const reject = mode === 'reject'
  const submit = (event) => { event.preventDefault(); onConfirm(reason.trim()) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{reject ? 'Reject purchase order' : 'Cancel purchase order'}</DialogTitle><DialogDescription>{reject ? `Return ${order?.number || 'this order'} to purchasing with a clear decision reason.` : `Stop ${order?.number || 'this order'}. This action cannot be reversed.`}</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={submit}><div className="form-field"><Label htmlFor="workflow-reason">Reason</Label><Input id="workflow-reason" minLength={3} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={reject ? 'Example: Budget is not approved' : 'Example: Supplier changed the quotation'} required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button><Button variant="destructive" disabled={loading || reason.trim().length < 3}>{loading && <LoaderCircle className="size-4 animate-spin" />}{reject ? 'Reject order' : 'Cancel order'}</Button></DialogFooter></form></DialogContent></Dialog>
}

export function ReceiveDialog({ open, onOpenChange, order, warehouses, onConfirm, loading }) {
  const [form, setForm] = useState({ warehouse_id: '', notes: '' })
  useEffect(() => { if (open) setForm({ warehouse_id: '', notes: '' }) }, [open])
  const submit = (event) => { event.preventDefault(); onConfirm({ warehouse_id: Number(form.warehouse_id), notes: form.notes.trim() || null }) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Receive purchase order</DialogTitle><DialogDescription>Confirm the delivery location for {order?.number}. All ordered quantities will be added to this warehouse.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={submit}><div className="form-field"><Label htmlFor="receipt-warehouse">Receiving warehouse</Label><select id="receipt-warehouse" className="form-select" value={form.warehouse_id} onChange={(event) => setForm({ ...form, warehouse_id: event.target.value })} required><option value="">Select warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} — {warehouse.name}</option>)}</select></div><div className="form-field"><Label htmlFor="receipt-notes">Receipt notes</Label><Input id="receipt-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} maxLength={500} placeholder="Example: Delivery checked and received" /></div><div className="receipt-impact"><PackageCheck /><div><strong>Inventory will update immediately</strong><span>{order?.items?.length || 0} product lines will be received in full and recorded in movement history.</span></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading || !form.warehouse_id}>{loading && <LoaderCircle className="size-4 animate-spin" />}Confirm receipt</Button></DialogFooter></form></DialogContent></Dialog>
}
