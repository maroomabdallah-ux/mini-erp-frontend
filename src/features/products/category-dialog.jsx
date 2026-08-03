import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function CategoryDialog({ open, onOpenChange, category, categories, onSave, loading }) {
  const [form, setForm] = useState({ name: '', parent_id: '' })
  useEffect(() => setForm(category ? { name: category.name, parent_id: category.parent_id || '' } : { name: '', parent_id: '' }), [category, open])
  const availableParents = categories.filter((item) => item.id !== category?.id && item.is_active)
  const submit = (event) => { event.preventDefault(); onSave({ name: form.name.trim(), parent_id: form.parent_id ? Number(form.parent_id) : null }) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{category ? 'Edit category' : 'Add category'}</DialogTitle><DialogDescription>Use categories to keep the product catalog easy to browse and filter.</DialogDescription></DialogHeader>
    <form className="dialog-form" onSubmit={submit}><div className="form-field"><Label htmlFor="category-name">Category name</Label><Input id="category-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} maxLength={100} required /></div><div className="form-field"><Label htmlFor="parent-category">Parent category</Label><select id="parent-category" className="form-select" value={form.parent_id} onChange={(event) => setForm({ ...form, parent_id: event.target.value })}><option value="">No parent category</option>{availableParents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="field-hint">Optional. Select a parent only when this is a subcategory.</span></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}{category ? 'Save changes' : 'Add category'}</Button></DialogFooter></form>
  </DialogContent></Dialog>
}
