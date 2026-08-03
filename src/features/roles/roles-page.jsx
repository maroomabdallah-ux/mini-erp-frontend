import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, KeyRound, Plus, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/auth-provider'
import { rolesApi } from './api'
import { RoleDialog } from './role-dialog'

export function RolesPage() {
  const { refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const [editor, setEditor] = useState({ open: false, roleId: null })
  const { data: roles = [], isLoading, isError, refetch } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })
  const { data: permissions = [] } = useQuery({ queryKey: ['permissions'], queryFn: rolesApi.permissions })
  const { data: roleDetail } = useQuery({ queryKey: ['role', editor.roleId], queryFn: () => rolesApi.detail(editor.roleId), enabled: Boolean(editor.roleId && editor.open) })
  const close = () => setEditor({ open: false, roleId: null })
  const refreshAdminData = (role) => {
    queryClient.setQueryData(['role', role.id], role)
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['roles'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] }),
      refreshUser(),
    ])
  }
  const save = useMutation({
    mutationFn: async (values) => {
      if (editor.roleId) {
        await rolesApi.update(editor.roleId, { name: values.name, description: values.description })
        return rolesApi.assignPermissions(editor.roleId, values.permission_ids)
      }
      const role = await rolesApi.create({ name: values.name, description: values.description })
      return rolesApi.assignPermissions(role.id, values.permission_ids)
    },
    onSuccess: async (role) => { await refreshAdminData(role); toast.success(editor.roleId ? 'Role updated' : 'Role created'); close() },
    onError: (error) => toast.error(error.message),
  })
  const deactivate = useMutation({
    mutationFn: rolesApi.deactivate,
    onSuccess: async (role) => { await refreshAdminData(role); toast.success('Role deactivated') },
    onError: (error) => toast.error(error.message),
  })

  return <div className="page-stack">
    <div className="page-heading"><div><p className="eyebrow-text">Access control</p><h1>Roles & permissions</h1><p>Define what each role can view and do across the system.</p></div><Button size="lg" onClick={() => setEditor({ open: true, roleId: null })}><Plus />Create role</Button></div>
    {isLoading ? <div className="table-state"><div className="loader" /><p>Loading roles...</p></div> : isError ? <div className="table-state"><AlertTriangle /><h3>Unable to load roles</h3><Button variant="outline" onClick={() => refetch()}>Try again</Button></div> : <section className="roles-grid">{roles.map((role) => <article className="role-card" key={role.id}>
      <div className="role-card-head"><span className="role-icon"><Shield /></span><Badge className={role.is_active ? '' : 'opacity-60'}>{role.is_active ? 'Active' : 'Inactive'}</Badge></div>
      <div><h2>{role.name.replaceAll('_', ' ')}</h2><p>{role.description || 'No description provided.'}</p></div>
      <div className="role-card-foot"><span><KeyRound />Manage role access</span><div className="role-actions"><Button variant="outline" size="sm" disabled={!role.is_active} onClick={() => setEditor({ open: true, roleId: role.id })}>Manage</Button>{role.name !== 'admin' && role.is_active && <Button variant="ghost" size="icon" className="text-destructive" disabled={deactivate.isPending} onClick={() => { if (window.confirm(`Deactivate the ${role.name} role? Users assigned to it will lose its permissions.`)) deactivate.mutate(role.id) }} aria-label="Deactivate role"><Trash2 /></Button>}</div></div>
    </article>)}</section>}
    <RoleDialog open={editor.open} onOpenChange={(open) => !open ? close() : setEditor({ ...editor, open })} role={editor.roleId ? roleDetail : null} editing={Boolean(editor.roleId)} permissions={permissions} onSave={(values) => save.mutate(values)} loading={save.isPending} />
  </div>
}
