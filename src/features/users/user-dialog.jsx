import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usersApi } from './api'

const blank = { username: '', first_name: '', last_name: '', email: '', password: '', role_ids: [] }
export function UserDialog({ open, onOpenChange, user, onSave, loading }) {
  const [form, setForm] = useState(blank)
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: usersApi.roles, enabled: open })
  const activeRoles = roles.filter((role) => role.is_active)
  useEffect(() => { setForm(user ? { username: user.username, first_name: user.first_name, last_name: user.last_name, email: user.email, password: '', role_ids: user.roles.map((role) => role.id) } : blank) }, [user, open])
  const field = (name) => ({ value: form[name], onChange: (event) => setForm({ ...form, [name]: event.target.value }) })
  const submit = (event) => { event.preventDefault(); const payload = { ...form, role_ids: form.role_ids.filter((id) => activeRoles.some((role) => role.id === id)) }; if (user) delete payload.password; onSave(payload) }
  const toggleRole = (id) => setForm({ ...form, role_ids: form.role_ids.includes(id) ? form.role_ids.filter((roleId) => roleId !== id) : [...form.role_ids, id] })
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{user ? 'Edit user' : 'Add user'}</DialogTitle><DialogDescription>{user ? 'Update this account’s details and assigned roles.' : 'Create a new account and assign its role in the system.'}</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="dialog-form"><div className="form-grid"><div className="form-field"><Label htmlFor="first_name">First name</Label><Input id="first_name" {...field('first_name')} minLength={2} required /></div><div className="form-field"><Label htmlFor="last_name">Last name</Label><Input id="last_name" {...field('last_name')} minLength={2} required /></div></div>
      <div className="form-field"><Label htmlFor="username">Username</Label><Input id="username" {...field('username')} pattern="[a-zA-Z0-9_.-]+" minLength={3} required /></div>
      <div className="form-field"><Label htmlFor="email">Email address</Label><Input id="email" type="email" {...field('email')} required /></div>
      {!user && <div className="form-field"><Label htmlFor="new-password">Password</Label><Input id="new-password" type="password" {...field('password')} minLength={8} required /><span className="field-hint">Use at least 8 characters with uppercase, lowercase, a number, and a symbol.</span></div>}
      <div className="form-field"><Label>Roles</Label><div className="role-picker">{activeRoles.length ? activeRoles.map((role) => <label key={role.id} className={form.role_ids.includes(role.id) ? 'selected' : ''}><input type="checkbox" checked={form.role_ids.includes(role.id)} onChange={() => toggleRole(role.id)} /><span>{role.name}</span></label>) : <span className="field-hint">No roles are available.</span>}</div></div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}{user ? 'Save changes' : 'Add user'}</Button></DialogFooter>
    </form></DialogContent></Dialog>
}
