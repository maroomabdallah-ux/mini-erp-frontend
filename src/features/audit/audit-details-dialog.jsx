import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

function ValuesBlock({ title, values }) {
  return <div className="audit-values"><span>{title}</span><pre>{values ? JSON.stringify(values, null, 2) : 'No values recorded'}</pre></div>
}
export function AuditDetailsDialog({ log, onClose }) {
  return <Dialog open={Boolean(log)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Audit event details</DialogTitle><DialogDescription>Event #{log?.id} · {log?.action} on {log?.table_name}</DialogDescription></DialogHeader>{log && <div className="audit-detail-grid"><div><span>User ID</span><strong>{log.user_id || 'System'}</strong></div><div><span>Record ID</span><strong>{log.record_id || '—'}</strong></div><div><span>IP address</span><strong>{log.ip_address || '—'}</strong></div><div><span>Timestamp</span><strong>{new Date(log.created_at).toLocaleString('en-US')}</strong></div><ValuesBlock title="Previous values" values={log.old_values} /><ValuesBlock title="New values" values={log.new_values} /></div>}</DialogContent></Dialog>
}
