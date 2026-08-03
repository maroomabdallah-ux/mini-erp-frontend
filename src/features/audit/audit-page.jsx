import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronLeft, ChevronRight, Eye, FileClock, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { auditApi } from './api'
import { AuditDetailsDialog } from './audit-details-dialog'

const PAGE_SIZE = 20
const actionLabel = (value) => value.replaceAll('_', ' ')
export function AuditPage() {
  const [filters, setFilters] = useState({ action: '', table_name: '', date_from: '', date_to: '' })
  const [applied, setApplied] = useState(filters); const [page, setPage] = useState(1); const [selected, setSelected] = useState(null)
  const query = { ...applied, date_from: applied.date_from ? new Date(`${applied.date_from}T00:00:00`).toISOString() : '', date_to: applied.date_to ? new Date(`${applied.date_to}T23:59:59`).toISOString() : '', page, size: PAGE_SIZE }
  const { data: logs = [], isLoading, isError, refetch } = useQuery({ queryKey: ['audit-logs', query], queryFn: () => auditApi.list(query) })
  const apply = (event) => { event.preventDefault(); setPage(1); setApplied(filters) }
  return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow-text">System activity</p><h1>Audit logs</h1><p>Review security-sensitive actions and record changes.</p></div></div>
    <section className="data-card"><form className="audit-filters" onSubmit={apply}><div className="filter-title"><Filter /><span>Filters</span></div><Input placeholder="Action, e.g. login" value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })} /><Input placeholder="Table, e.g. users" value={filters.table_name} onChange={(event) => setFilters({ ...filters, table_name: event.target.value })} /><Input type="date" value={filters.date_from} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} aria-label="From date" /><Input type="date" value={filters.date_to} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} aria-label="To date" /><Button><Search />Apply</Button></form>
      {isLoading ? <div className="table-state"><div className="loader" /><p>Loading audit events...</p></div> : isError ? <div className="table-state"><AlertTriangle /><h3>Unable to load audit logs</h3><Button variant="outline" onClick={() => refetch()}>Try again</Button></div> : logs.length === 0 ? <div className="table-state"><FileClock /><h3>No events found</h3><p>Try adjusting the current filters.</p></div> : <><div className="table-scroll"><table><thead><tr><th>Action</th><th>Resource</th><th>User</th><th>Record</th><th>IP address</th><th>Date</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td><Badge>{actionLabel(log.action)}</Badge></td><td><strong>{log.table_name}</strong></td><td className="muted">{log.user_id ? `User #${log.user_id}` : 'System'}</td><td className="muted">{log.record_id || '—'}</td><td className="muted username">{log.ip_address || '—'}</td><td className="muted">{new Date(log.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td><td><Button variant="ghost" size="icon" onClick={() => setSelected(log)} aria-label="View details"><Eye /></Button></td></tr>)}</tbody></table></div><div className="table-pagination"><span>Page {page}</span><div><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={logs.length < PAGE_SIZE} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight /></Button></div></div></>}
    </section><AuditDetailsDialog log={selected} onClose={() => setSelected(null)} /></div>
}
