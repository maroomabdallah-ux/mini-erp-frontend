import { useDeferredValue, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Building2, ChevronLeft, ChevronRight, MapPin, MoreHorizontal, Pencil, Plus, Search, Trash2, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/auth-provider'
import { hasPermission, PERMISSIONS } from '@/shared/permissions/permissions'
import { warehousesApi } from './api'
import { WarehouseDialog } from './warehouse-dialog'

const PAGE_SIZE = 12

export function WarehousesPage() {
  const { user } = useAuth()
  const canManage = hasPermission(user, PERMISSIONS.WAREHOUSES_MANAGE)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState('true')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState({ open: false, warehouse: null })
  const filters = { page, size: PAGE_SIZE, search: deferredSearch, status }
  const query = useQuery({ queryKey: ['warehouses', filters], queryFn: () => warehousesApi.list(filters) })
  const warehouses = query.data?.items || []
  const total = query.data?.total || 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => setPage(1), [deferredSearch, status])
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  const save = useMutation({
    mutationFn: (payload) => editor.warehouse ? warehousesApi.update(editor.warehouse.id, payload) : warehousesApi.create(payload),
    onSuccess: () => {
      toast.success(editor.warehouse ? 'Warehouse updated successfully' : 'Warehouse added successfully')
      setEditor({ open: false, warehouse: null })
      refresh()
    },
    onError: (error) => toast.error(error.message),
  })
  const deactivate = useMutation({
    mutationFn: warehousesApi.deactivate,
    onSuccess: () => { toast.success('Warehouse deactivated'); refresh() },
    onError: (error) => toast.error(error.message),
  })

  return <div className="page-stack warehouse-page">
    <section className="warehouse-hero">
      <div className="warehouse-hero-icon"><Warehouse /></div>
      <div><p className="eyebrow-text">Location management</p><h1>Warehouses</h1><p>Physical locations that connect purchasing, sales, and inventory operations.</p></div>
      <div className="warehouse-hero-total"><strong>{total}</strong><span>{total === 1 ? 'location' : 'locations'}</span></div>
      {canManage && <Button size="lg" onClick={() => setEditor({ open: true, warehouse: null })}><Plus />Add warehouse</Button>}
    </section>

    <section className="warehouse-toolbar">
      <div className="search-box"><Search /><Input placeholder="Search code, name, or address..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="true">Active locations</option><option value="false">Inactive locations</option></select>
      <p>{total} matching {total === 1 ? 'warehouse' : 'warehouses'}</p>
    </section>

    {query.isLoading ? <State><div className="loader" /><p>Loading warehouses...</p></State> : query.isError ? <State><AlertTriangle /><h3>Unable to load warehouses</h3><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></State> : warehouses.length === 0 ? <State><Warehouse /><h3>No matching warehouses</h3><p>Change your filters or add your first warehouse.</p></State> : <>
      <section className="warehouse-grid">{warehouses.map((warehouse, index) => <article className={`warehouse-location-card ${warehouse.is_active ? '' : 'inactive-card'}`} key={warehouse.id}>
        <div className={`warehouse-card-banner tone-${index % 3}`}><div><Warehouse /></div><span>{warehouse.code}</span>{canManage && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => setEditor({ open: true, warehouse })}><Pencil />Edit warehouse</DropdownMenuItem>{warehouse.is_active && <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={() => { if (window.confirm(`Deactivate ${warehouse.name}?`)) deactivate.mutate(warehouse.id) }}><Trash2 />Deactivate warehouse</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>}</div>
        <div className="warehouse-card-body"><div className="warehouse-card-title"><div><p>Warehouse</p><h2>{warehouse.name}</h2></div><Status active={warehouse.is_active} /></div><div className="warehouse-location"><MapPin /><div><span>Location</span><strong>{warehouse.address || 'No address provided'}</strong></div></div></div>
        <footer><Building2 /><span>Added {formatDate(warehouse.created_at)}</span></footer>
      </article>)}</section>
      {pages > 1 && <div className="warehouse-pagination"><span>Page {page} of {pages}</span><div><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<ChevronRight /></Button></div></div>}
    </>}

    <WarehouseDialog open={editor.open} onOpenChange={(open) => setEditor({ open, warehouse: open ? editor.warehouse : null })} warehouse={editor.warehouse} onSave={(payload) => save.mutate(payload)} loading={save.isPending} />
  </div>
}

function Status({ active }) { return <span className={`status ${active ? 'active' : 'inactive'}`}><i />{active ? 'Active' : 'Inactive'}</span> }
function State({ children }) { return <section className="warehouse-state">{children}</section> }
function formatDate(value) { return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) }
