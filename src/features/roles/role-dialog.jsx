import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const groupPermissions = (permissions) => permissions.reduce((groups, permission) => {
  const group = permission.code.split('.')[0]
  return { ...groups, [group]: [...(groups[group] || []), permission] }
}, {})

export function RoleDialog({ open, onOpenChange, role, editing, permissions, onSave, loading }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState([])
  const groups = useMemo(() => groupPermissions(permissions), [permissions])
  useEffect(() => {
    setName(role?.name || '')
    setDescription(role?.description || '')
    setSelected(role?.permissions?.map((permission) => permission.id) || [])
  }, [role, open])
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const submit = (event) => { event.preventDefault(); onSave({ name, description: description || null, permission_ids: selected }) }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{editing ? `Manage ${role?.name || 'role'}` : 'Create role'}</DialogTitle><DialogDescription>{editing ? 'Update the role details and choose its permissions.' : 'Create a role and define its initial permissions.'}</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={submit}>
    <div className="form-grid"><div className="form-field"><Label htmlFor="role-name">Role name</Label><Input id="role-name" value={name} disabled={editing && role?.name === 'admin'} onChange={(event) => setName(event.target.value.toLowerCase().replace(/\s+/g, '_'))} pattern="[a-z0-9_.-]+" minLength={2} placeholder="operations_manager" required /></div><div className="form-field"><Label htmlFor="role-description">Description</Label><Input id="role-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={255} placeholder="Briefly describe this role" /></div></div>
    <div className="permission-groups">{Object.entries(groups).map(([group, items]) => <section key={group}><div><strong>{group.replaceAll('_', ' ')}</strong><span>{items.filter((item) => selected.includes(item.id)).length}/{items.length} selected</span></div><div>{items.map((permission) => <label key={permission.id} className={selected.includes(permission.id) ? 'selected' : ''}><input type="checkbox" checked={selected.includes(permission.id)} onChange={() => toggle(permission.id)} /><span><strong>{permission.code}</strong><small>{permission.description || 'No description'}</small></span></label>)}</div></section>)}</div>
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading || (editing && !role)}>{loading && <LoaderCircle className="size-4 animate-spin" />}{editing ? 'Save role' : 'Create role'}</Button></DialogFooter>
  </form></DialogContent></Dialog>
}
