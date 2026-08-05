import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, Ban, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardCheck, Clock3, Eye, FilePenLine, LoaderCircle, PackageCheck, Plus, Search, Send, ShoppingCart, Truck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/auth-provider'
import { productsApi } from '@/features/products/api'
import { suppliersApi } from '@/features/suppliers/api'
import { warehousesApi } from '@/features/warehouses/api'
import { hasPermission, PERMISSIONS } from '@/shared/permissions/permissions'
import { purchasesApi } from './api'
import { PurchaseOrderDialog } from './purchase-order-dialog'
import { ReasonDialog, ReceiveDialog } from './purchase-workflow-dialogs'

const PAGE_SIZE = 10
const STATUS = {
  draft: { label: 'Draft', icon: FilePenLine },
  pending_approval: { label: 'Pending approval', icon: Clock3 },
  approved: { label: 'Approved', icon: ClipboardCheck },
  rejected: { label: 'Rejected', icon: XCircle },
  cancelled: { label: 'Cancelled', icon: Ban },
  received: { label: 'Received', icon: PackageCheck },
}

export function PurchaseOrdersPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canCreate = hasPermission(user, PERMISSIONS.PURCHASE_ORDERS_CREATE)
  const canUpdate = hasPermission(user, PERMISSIONS.PURCHASE_ORDERS_UPDATE)
  const canApprove = hasPermission(user, PERMISSIONS.PURCHASE_ORDERS_APPROVE)
  const canCancel = hasPermission(user, PERMISSIONS.PURCHASE_ORDERS_CANCEL)
  const canReceive = hasPermission(user, PERMISSIONS.GOODS_RECEIPTS_CREATE)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState({ open: false, order: null })
  const [selected, setSelected] = useState(null)
  const [reasonDialog, setReasonDialog] = useState({ open: false, mode: 'reject', order: null })
  const [receiveOrder, setReceiveOrder] = useState(null)
  const filters = { page, size: PAGE_SIZE, search: deferredSearch, status, supplierId }
  const query = useQuery({ queryKey: ['purchase-orders', filters], queryFn: () => purchasesApi.list(filters) })
  const summaryQuery = useQuery({ queryKey: ['purchase-orders-summary'], queryFn: () => purchasesApi.list({ page: 1, size: 1 }) })
  const pendingQuery = useQuery({ queryKey: ['purchase-orders-summary', 'pending_approval'], queryFn: () => purchasesApi.list({ page: 1, size: 1, status: 'pending_approval' }) })
  const approvedQuery = useQuery({ queryKey: ['purchase-orders-summary', 'approved'], queryFn: () => purchasesApi.list({ page: 1, size: 1, status: 'approved' }) })
  const receivedQuery = useQuery({ queryKey: ['purchase-orders-summary', 'received'], queryFn: () => purchasesApi.list({ page: 1, size: 1, status: 'received' }) })
  const suppliersQuery = useQuery({ queryKey: ['purchase-order-suppliers'], queryFn: () => suppliersApi.list({ page: 1, size: 100, status: 'true' }) })
  const productsQuery = useQuery({ queryKey: ['purchase-order-products'], queryFn: () => productsApi.list({ page: 1, size: 100, status: 'true' }) })
  const warehousesQuery = useQuery({ queryKey: ['purchase-order-warehouses'], queryFn: () => warehousesApi.list({ page: 1, size: 100, status: 'true' }) })
  const orders = query.data?.items || []
  const total = query.data?.total || 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const suppliers = suppliersQuery.data?.items || []
  const products = productsQuery.data?.items || []
  const warehouses = warehousesQuery.data?.items || []
  useEffect(() => setPage(1), [deferredSearch, status, supplierId])

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
  }
  const save = useMutation({
    mutationFn: (payload) => editor.order ? purchasesApi.update(editor.order.id, payload) : purchasesApi.create(payload),
    onSuccess: (order) => { toast.success(editor.order ? 'Purchase order updated' : 'Purchase order created'); setEditor({ open: false, order: null }); setSelected(order); refresh() },
    onError: (error) => toast.error(error.message),
  })
  const action = useMutation({
    mutationFn: ({ type, order, payload }) => {
      if (type === 'submit') return purchasesApi.submit(order.id)
      if (type === 'approve') return purchasesApi.approve(order.id)
      if (type === 'reject') return purchasesApi.reject(order.id, payload)
      if (type === 'cancel') return purchasesApi.cancel(order.id, payload)
      return purchasesApi.receive(order.id, payload)
    },
    onSuccess: (order, variables) => {
      const messages = { submit: 'Purchase order submitted for approval', approve: 'Purchase order approved', reject: 'Purchase order rejected', cancel: 'Purchase order cancelled', receive: 'Goods received and inventory updated' }
      toast.success(messages[variables.type])
      setSelected(order)
      setReasonDialog({ open: false, mode: 'reject', order: null })
      setReceiveOrder(null)
      refresh()
    },
    onError: (error) => toast.error(error.message),
  })
  const run = (type, order, payload) => action.mutate({ type, order, payload })

  return <div className="purchase-page">
    <section className="purchase-hero"><div><p>Procurement control</p><h1>Purchase orders</h1><span>Move approved supplier demand from draft to verified warehouse stock.</span></div><div className="purchase-hero-flow"><span><ShoppingCart /></span><i /><span><ClipboardCheck /></span><i /><span><PackageCheck /></span></div>{canCreate && <Button size="lg" onClick={() => setEditor({ open: true, order: null })}><Plus />Create order</Button>}</section>

    <section className="purchase-metrics"><PurchaseMetric icon={ShoppingCart} label="All orders" value={summaryQuery.isLoading ? '—' : summaryQuery.data?.total || 0} detail="Complete procurement record" /><PurchaseMetric icon={Clock3} label="Awaiting decision" value={pendingQuery.isLoading ? '—' : pendingQuery.data?.total || 0} detail="Pending manager approval" tone="pending" /><PurchaseMetric icon={PackageCheck} label="Ready to receive" value={approvedQuery.isLoading ? '—' : approvedQuery.data?.total || 0} detail="Approved supplier deliveries" tone="approved" /><PurchaseMetric icon={CheckCircle2} label="Received" value={receivedQuery.isLoading ? '—' : receivedQuery.data?.total || 0} detail="Posted to inventory" tone="received" /></section>

    <section className="purchase-workspace"><header><div><p>Order workspace</p><h2>Procurement pipeline</h2></div><span>{total} matching {total === 1 ? 'order' : 'orders'}</span></header><div className="purchase-toolbar"><div className="search-box"><Search /><Input placeholder="Search order number or supplier..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{Object.entries(STATUS).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</select><select className="form-select" value={supplierId} onChange={(event) => setSupplierId(event.target.value)}><option value="">All suppliers</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div>
      {query.isLoading ? <PurchaseState><div className="loader" /><p>Loading purchase orders...</p></PurchaseState> : query.isError ? <PurchaseState><AlertTriangle /><h3>Unable to load purchase orders</h3><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></PurchaseState> : orders.length === 0 ? <PurchaseState><ShoppingCart /><h3>No purchase orders yet</h3><p>Create the first draft without entering supplier or product IDs manually.</p>{canCreate && <Button onClick={() => setEditor({ open: true, order: null })}><Plus />Create first order</Button>}</PurchaseState> : <div className="purchase-list">{orders.map((order) => <PurchaseRow key={order.id} order={order} user={user} permissions={{ canUpdate, canApprove, canCancel, canReceive }} onView={() => setSelected(order)} onEdit={() => setEditor({ open: true, order })} onSubmit={() => run('submit', order)} onApprove={() => run('approve', order)} onReject={() => setReasonDialog({ open: true, mode: 'reject', order })} onCancel={() => setReasonDialog({ open: true, mode: 'cancel', order })} onReceive={() => setReceiveOrder(order)} loading={action.isPending} />)}</div>}
      {pages > 1 && <div className="purchase-pagination"><span>Page {page} of {pages}</span><div><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<ChevronRight /></Button></div></div>}
    </section>

    <PurchaseOrderDialog open={editor.open} onOpenChange={(open) => setEditor({ open, order: open ? editor.order : null })} order={editor.order} suppliers={suppliers} products={products} onSave={(payload) => save.mutate(payload)} loading={save.isPending} />
    <OrderDetails open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} order={selected} />
    <ReasonDialog open={reasonDialog.open} onOpenChange={(open) => setReasonDialog({ ...reasonDialog, open })} mode={reasonDialog.mode} order={reasonDialog.order} onConfirm={(reason) => run(reasonDialog.mode, reasonDialog.order, reason)} loading={action.isPending} />
    <ReceiveDialog open={Boolean(receiveOrder)} onOpenChange={(open) => !open && setReceiveOrder(null)} order={receiveOrder} warehouses={warehouses} onConfirm={(payload) => run('receive', receiveOrder, payload)} loading={action.isPending} />
  </div>
}

function PurchaseMetric({ icon: Icon, label, value, detail, tone = '' }) { return <article className={`purchase-metric ${tone}`}><span><Icon /></span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article> }

function PurchaseRow({ order, user, permissions, onView, onEdit, onSubmit, onApprove, onReject, onCancel, onReceive, loading }) {
  const config = STATUS[order.status] || STATUS.draft
  const Icon = config.icon
  const isAdmin = user.roles?.some((role) => role.is_active && role.name === 'admin')
  const creatorMayNotApprove = order.created_by === user.id && !isAdmin
  return <article className={`purchase-row status-${order.status}`}><div className="purchase-row-status"><span><Icon /></span><i /></div><div className="purchase-row-main"><div><strong>{order.number}</strong><StatusBadge status={order.status} /></div><p>{order.supplier.name}</p><small>Created {date(order.created_at)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</small></div><div className="purchase-row-total"><small>Order total</small><strong>{money(order.total_amount)}</strong></div><div className="purchase-row-actions"><Button variant="ghost" size="sm" onClick={onView}><Eye />Details</Button>{permissions.canUpdate && order.status === 'draft' && <Button variant="outline" size="sm" onClick={onEdit}><FilePenLine />Edit</Button>}{permissions.canUpdate && order.status === 'draft' && <Button size="sm" disabled={loading} onClick={onSubmit}><Send />Submit</Button>}{permissions.canApprove && order.status === 'pending_approval' && !creatorMayNotApprove && <><Button variant="outline" size="sm" disabled={loading} onClick={onReject}><XCircle />Reject</Button><Button size="sm" disabled={loading} onClick={onApprove}><Check />Approve</Button></>}{permissions.canReceive && order.status === 'approved' && <Button size="sm" disabled={loading} onClick={onReceive}><PackageCheck />Receive</Button>}{permissions.canCancel && ['draft', 'pending_approval', 'approved'].includes(order.status) && <Button variant="ghost" size="sm" disabled={loading} onClick={onCancel}><Ban />Cancel</Button>}</div></article>
}

function StatusBadge({ status }) { const config = STATUS[status] || STATUS.draft; return <Badge variant="outline" className={`purchase-status ${status}`}>{config.label}</Badge> }
function PurchaseState({ children }) { return <div className="purchase-state">{children}</div> }

function OrderDetails({ open, onOpenChange, order }) {
  const milestones = useMemo(() => order ? buildMilestones(order) : [], [order])
  if (!order) return null
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-4xl"><DialogHeader><div className="purchase-detail-title"><div><p>Purchase order</p><DialogTitle>{order.number}</DialogTitle></div><StatusBadge status={order.status} /></div><DialogDescription>Supplier commitment, approval trail, and receiving result in one record.</DialogDescription></DialogHeader><div className="purchase-detail-summary"><div><small>Supplier</small><strong>{order.supplier.name}</strong><span>{order.supplier.email}</span></div><div><small>Order total</small><strong>{money(order.total_amount)}</strong><span>{order.items.length} product lines</span></div><div><small>Created</small><strong>{date(order.created_at)}</strong><span>By user #{order.created_by}</span></div></div><div className="purchase-detail-timeline">{milestones.map((item, index) => <div className={item.done ? 'done' : item.current ? 'current' : ''} key={item.label}><span>{item.done ? <Check /> : index + 1}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div>{index < milestones.length - 1 && <i />}</div>)}</div><section className="purchase-detail-lines"><header><span>Product</span><span>Quantity</span><span>Unit cost</span><span>Total</span></header>{order.items.map((item) => <div key={item.id}><span><strong>{item.product.name}</strong><small>{item.product.sku}</small></span><b>{item.quantity}</b><b>{money(item.unit_cost)}</b><b>{money(item.line_total)}</b></div>)}<footer><span>Order total</span><strong>{money(order.total_amount)}</strong></footer></section>{order.notes && <div className="purchase-detail-note"><strong>Internal notes</strong><p>{order.notes}</p></div>}{order.rejection_reason && <div className="purchase-detail-note danger"><strong>Rejection reason</strong><p>{order.rejection_reason}</p></div>}{order.cancellation_reason && <div className="purchase-detail-note danger"><strong>Cancellation reason</strong><p>{order.cancellation_reason}</p></div>}{order.receipt && <div className="purchase-receipt-summary"><PackageCheck /><div><strong>{order.receipt.number}</strong><span>Received at {order.receipt.warehouse.code} — {order.receipt.warehouse.name} on {date(order.receipt.received_at)}</span></div><ArrowRight /></div>}</DialogContent></Dialog>
}

function buildMilestones(order) {
  const reached = { draft: 0, pending_approval: 1, approved: 2, received: 3 }[order.status] ?? 1
  return [
    { label: 'Draft created', detail: date(order.created_at), done: reached > 0, current: reached === 0 },
    { label: 'Submitted', detail: order.submitted_at ? date(order.submitted_at) : 'Waiting for purchasing', done: reached > 1, current: reached === 1 },
    { label: 'Manager decision', detail: order.approved_at ? date(order.approved_at) : order.rejected_at ? 'Rejected' : 'Waiting for approval', done: reached > 2, current: reached === 2 },
    { label: 'Goods received', detail: order.receipt ? date(order.receipt.received_at) : 'Waiting for delivery', done: order.status === 'received', current: false },
  ]
}
function money(value) { return Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'JOD', minimumFractionDigits: 2 }) }
function date(value) { return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—' }
