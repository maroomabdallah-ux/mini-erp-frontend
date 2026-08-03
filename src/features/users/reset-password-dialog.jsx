import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function ResetPasswordDialog({ user, onClose, onReset, loading }) {
  const [password, setPassword] = useState('')
  const submit = (event) => { event.preventDefault(); onReset(password) }
  return <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Reset password</DialogTitle><DialogDescription>The password for {user?.first_name} {user?.last_name} will be changed immediately.</DialogDescription></DialogHeader><form onSubmit={submit} className="dialog-form"><div className="form-field"><Label htmlFor="reset-password">New password</Label><Input id="reset-password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /><span className="field-hint">Use a strong password with at least 8 characters.</span></div><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}Reset password</Button></DialogFooter></form></DialogContent></Dialog>
}
