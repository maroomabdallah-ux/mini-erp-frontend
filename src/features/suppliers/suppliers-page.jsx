import { useDeferredValue, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Building2, CalendarClock, ChevronLeft, ChevronRight, Mail, MoreHorizontal, Pencil, Phone, Plus, Search, ShieldCheck, Trash2, Truck, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/auth-provider'
import { hasPermission, PERMISSIONS } from '@/shared/permissions/permissions'
import { SupplierDialog } from './supplier-dialog'
import { suppliersApi } from './api'

const PAGE_SIZE = 12

export function SuppliersPage() {
  const { user } = useAuth()
  const canManage = hasPermission(user, PERMISSIONS.SUPPLIERS_MANAGE)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState('true')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState({ open: false, supplier: null })
  const filters = { page, size: PAGE_SIZE, search: deferredSearch, status }
  const query = useQuery({ queryKey: ['suppliers', filters], queryFn: () => suppliersApi.list(filters) })
  const summaryQuery = useQuery({ queryKey: ['suppliers-summary'], queryFn: () => suppliersApi.list({ page: 1, size: 1, status: '' }) })
  const activeSummaryQuery = useQuery({ queryKey: ['suppliers-summary-active'], queryFn: () => suppliersApi.list({ page: 1, size: 1, status: 'true' }) })
  const inactiveSummaryQuery = useQuery({ queryKey: ['suppliers-summary-inactive'], queryFn: () => suppliersApi.list({ page: 1, size: 1, status: 'false' }) })
  const suppliers = query.data?.items || []
  const total = query.data?.total || 0
  const supplierCount = summaryQuery.data?.total || 0
  const activeCount = activeSummaryQuery.data?.total || 0
  const inactiveCount = inactiveSummaryQuery.data?.total || 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => setPage(1), [deferredSearch, status])
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    queryClient.invalidateQueries({ queryKey: ['suppliers-summary'] })
  }
  const save = useMutation({
    mutationFn: (payload) => editor.supplier ? suppliersApi.update(editor.supplier.id, payload) : suppliersApi.create(payload),
    onSuccess: () => { toast.success(editor.supplier ? 'Supplier updated successfully' : 'Supplier added successfully'); setEditor({ open: false, supplier: null }); refresh() },
    onError: (error) => toast.error(error.message),
  })
  const deactivate = useMutation({
    mutationFn: suppliersApi.deactivate,
    onSuccess: () => { toast.success('Supplier deactivated'); refresh() },
    onError: (error) => toast.error(error.message),
  })

  return <div className="supplier-page">
    <section className="supplier-hero">
      <div className="supplier-hero-copy"><div className="supplier-hero-icon"><Truck /></div><div><p>Procurement network</p><h1>Suppliers</h1><span>Maintain the approved companies your purchasing team can order from.</span></div></div>
      {canManage && <Button size="lg" onClick={() => setEditor({ open: true, supplier: null })}><Plus />Add supplier</Button>}
    </section>

    <section className="supplier-metrics">
      <Metric icon={UsersRound} label="Total suppliers" value={summaryQuery.isLoading ? '—' : supplierCount} detail="All supplier records" />
      <Metric icon={ShieldCheck} label="Active partners" value={activeSummaryQuery.isLoading ? '—' : activeCount} detail="Available for purchasing" tone="active" />
      <Metric icon={Search} label="Current results" value={query.isLoading ? '—' : total} detail="Match the selected filters" tone="terms" />
      <Metric icon={Building2} label="Inactive suppliers" value={inactiveSummaryQuery.isLoading ? '—' : inactiveCount} detail="Retained for history" tone="inactive" />
    </section>

    <section className="supplier-directory">
      <header><div><p>Supplier directory</p><h2>Approved business partners</h2></div><span>{total} matching {total === 1 ? 'supplier' : 'suppliers'}</span></header>
      <div className="supplier-toolbar"><div className="search-box"><Search /><Input placeholder="Search name, email, phone, or terms..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="true">Active suppliers</option><option value="false">Inactive suppliers</option></select></div>
      {query.isLoading ? <State><div className="loader" /><p>Loading suppliers...</p></State> : query.isError ? <State><AlertTriangle /><h3>Unable to load suppliers</h3><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></State> : suppliers.length === 0 ? <State><Truck /><h3>No matching suppliers</h3><p>Change the filters or create your first supplier.</p></State> : <div className="supplier-grid">{suppliers.map((supplier, index) => <SupplierCard key={supplier.id} supplier={supplier} tone={index % 4} canManage={canManage} onEdit={() => setEditor({ open: true, supplier })} onDeactivate={() => { if (window.confirm(`Deactivate ${supplier.name}? It will no longer be available for new purchase orders.`)) deactivate.mutate(supplier.id) }} />)}</div>}
      {pages > 1 && <div className="supplier-pagination"><span>Page {page} of {pages}</span><div><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<ChevronRight /></Button></div></div>}
    </section>

    <SupplierDialog open={editor.open} onOpenChange={(open) => setEditor({ open, supplier: open ? editor.supplier : null })} supplier={editor.supplier} onSave={(payload) => save.mutate(payload)} loading={save.isPending} />
  </div>
}

function Metric({ icon: Icon, label, value, detail, tone = '' }) { return <article className={`supplier-metric ${tone}`}><span><Icon /></span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article> }
function SupplierCard({ supplier, tone, canManage, onEdit, onDeactivate }) { return <article className={`supplier-card tone-${tone} ${supplier.is_active ? '' : 'inactive-card'}`}><header><div className="supplier-avatar">{initials(supplier.name)}</div><Status active={supplier.is_active} />{canManage && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={onEdit}><Pencil />Edit supplier</DropdownMenuItem>{supplier.is_active && <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={onDeactivate}><Trash2 />Deactivate supplier</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>}</header><div className="supplier-card-title"><p>Supplier #{supplier.id}</p><h3>{supplier.name}</h3></div><div className="supplier-contact"><a href={`mailto:${supplier.email}`}><Mail /><span>{supplier.email}</span></a><div><Phone /><span>{supplier.phone || 'No phone provided'}</span></div></div><footer><span><CalendarClock />Credit terms</span><strong>{supplier.credit_terms || 'Not specified'}</strong></footer></article> }
function Status({ active }) { return <span className={`status ${active ? 'active' : 'inactive'}`}><i />{active ? 'Active' : 'Inactive'}</span> }
function State({ children }) { return <div className="supplier-state">{children}</div> }
function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
