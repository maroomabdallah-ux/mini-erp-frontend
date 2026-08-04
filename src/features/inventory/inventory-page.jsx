import { useDeferredValue, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, AlertTriangle, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Boxes, Check, ChevronLeft, ChevronRight, ClipboardCheck, History, Package, Plus, Search, SlidersHorizontal, TriangleAlert, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/auth-provider'
import { hasPermission, PERMISSIONS } from '@/shared/permissions/permissions'
import { AdjustmentDialog } from './adjustment-dialog'
import { inventoryApi } from './api'
import { TransferDialog } from './transfer-dialog'
import { CountDialog } from './count-dialog'

const PAGE_SIZE = 20

export function InventoryPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canAdjust = hasPermission(user, PERMISSIONS.INVENTORY_ADJUST)
  const canTransfer = hasPermission(user, PERMISSIONS.INVENTORY_TRANSFER)
  const canCount = hasPermission(user, PERMISSIONS.INVENTORY_COUNT)
  const canApproveCount = hasPermission(user, PERMISSIONS.INVENTORY_COUNT_APPROVE)
  const canReadLowStock = hasPermission(user, PERMISSIONS.INVENTORY_LOW_STOCK_READ)
  const [tab, setTab] = useState(() => { const requested = sessionStorage.getItem('erp_inventory_tab'); sessionStorage.removeItem('erp_inventory_tab'); return requested || 'stock' })
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [stockWarehouse, setStockWarehouse] = useState('')
  const [stockPage, setStockPage] = useState(1)
  const [movementPage, setMovementPage] = useState(1)
  const [movementProduct, setMovementProduct] = useState('')
  const [movementWarehouse, setMovementWarehouse] = useState('')
  const [movementType, setMovementType] = useState('')
  const [adjustment, setAdjustment] = useState({ open: false, stock: null })
  const [transferOpen, setTransferOpen] = useState(false)
  const [countOpen, setCountOpen] = useState(false)
  const [countStatus, setCountStatus] = useState('pending')

  const productsQuery = useQuery({ queryKey: ['inventory-products'], queryFn: inventoryApi.products })
  const warehousesQuery = useQuery({ queryKey: ['inventory-warehouses'], queryFn: inventoryApi.warehouses })
  const stockFilters = { page: stockPage, size: PAGE_SIZE, search: deferredSearch, warehouseId: stockWarehouse }
  const stockQuery = useQuery({ queryKey: ['inventory-stock', stockFilters], queryFn: () => inventoryApi.stock(stockFilters) })
  const movementFilters = { page: movementPage, size: PAGE_SIZE, productId: movementProduct, warehouseId: movementWarehouse, type: movementType }
  const movementsQuery = useQuery({ queryKey: ['inventory-movements', movementFilters], queryFn: () => inventoryApi.movements(movementFilters), enabled: tab === 'movements' })
  const lowStockQuery = useQuery({ queryKey: ['inventory-low-stock'], queryFn: inventoryApi.lowStock, enabled: canReadLowStock })
  const countsQuery = useQuery({ queryKey: ['inventory-counts', countStatus], queryFn: () => inventoryApi.counts({ status: countStatus }), enabled: tab === 'counts' })

  const products = productsQuery.data?.items || []
  const warehouses = warehousesQuery.data?.items || []
  const stock = stockQuery.data?.items || []
  const totalRows = stockQuery.data?.total || 0
  const stockPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const movementPages = Math.max(1, Math.ceil((movementsQuery.data?.total || 0) / PAGE_SIZE))
  const lowStock = lowStockQuery.data?.items || lowStockQuery.data || []
  const totalUnits = stockQuery.data?.total_quantity || 0

  useEffect(() => setStockPage(1), [deferredSearch, stockWarehouse])
  useEffect(() => setMovementPage(1), [movementProduct, movementWarehouse, movementType])
  useEffect(() => { const openTab = (event) => setTab(event.detail); window.addEventListener('erp:inventory-tab', openTab); return () => window.removeEventListener('erp:inventory-tab', openTab) }, [])

  const adjust = useMutation({
    mutationFn: inventoryApi.adjust,
    onSuccess: () => {
      toast.success('Stock adjustment saved')
      setAdjustment({ open: false, stock: null })
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] })
    },
    onError: (error) => toast.error(error.message),
  })
  const transfer = useMutation({
    mutationFn: inventoryApi.transfer,
    onSuccess: (result) => {
      toast.success(`Transfer ${result.transfer_reference} completed`)
      setTransferOpen(false)
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-transfer-stock'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] })
    },
    onError: (error) => toast.error(error.message),
  })
  const createCount = useMutation({ mutationFn: inventoryApi.createCount, onSuccess: () => { toast.success('Physical count submitted for approval'); setCountOpen(false); queryClient.invalidateQueries({ queryKey: ['inventory-counts'] }) }, onError: (error) => toast.error(error.message) })
  const approveCount = useMutation({ mutationFn: inventoryApi.approveCount, onSuccess: (result) => { toast.success(`Count ${result.reference} approved`); queryClient.invalidateQueries({ queryKey: ['inventory-counts'] }); queryClient.invalidateQueries({ queryKey: ['inventory-stock'] }); queryClient.invalidateQueries({ queryKey: ['inventory-movements'] }); queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] }) }, onError: (error) => toast.error(error.message) })

  return <div className="page-stack inventory-page">
    <section className="inventory-hero">
      <div><p className="eyebrow-text">Inventory control</p><h1>Stock operations</h1><p>One reliable view of every product quantity across your warehouse network.</p></div>
      <div className="inventory-hero-actions">{canAdjust && <Button className="inventory-adjust-button" size="lg" variant="outline" onClick={() => setAdjustment({ open: true, stock: null })}><SlidersHorizontal />Adjust stock</Button>}{canTransfer && <Button size="lg" onClick={() => setTransferOpen(true)}><ArrowLeftRight />Transfer stock</Button>}</div>
      <div className="inventory-hero-mark"><Boxes /></div>
    </section>

    <section className="inventory-summary-grid">
      <Summary icon={<Package />} label="Stock records" value={stockQuery.isLoading ? '—' : totalRows} detail="Product and location pairs" />
      <Summary icon={<Activity />} label="Total stock quantity" value={stockQuery.isLoading ? '—' : formatQuantity(totalUnits)} detail="Sum of quantities in the current filtered results" />
      <Summary icon={<Warehouse />} label="Active warehouses" value={warehousesQuery.isLoading ? '—' : warehouses.length} detail="Available inventory locations" />
      {canReadLowStock && <Summary alert icon={<TriangleAlert />} label="Low-stock products" value={lowStockQuery.isLoading ? '—' : lowStock.length} detail="Based on total product stock" />}
    </section>

    <div className="inventory-tabs" role="tablist">
      <button className={tab === 'stock' ? 'active' : ''} onClick={() => setTab('stock')}><Boxes />Stock overview</button>
      <button className={tab === 'movements' ? 'active' : ''} onClick={() => setTab('movements')}><History />Movement history</button>
      {(canCount || canApproveCount) && <button className={tab === 'counts' ? 'active' : ''} onClick={() => setTab('counts')}><ClipboardCheck />Physical counts</button>}
      {canReadLowStock && <button className={tab === 'low' ? 'active' : ''} onClick={() => setTab('low')}><TriangleAlert />Low stock{lowStock.length > 0 && <span>{lowStock.length}</span>}</button>}
    </div>

    {tab === 'stock' && <StockPanel query={stockQuery} items={stock} search={search} setSearch={setSearch} warehouse={stockWarehouse} setWarehouse={setStockWarehouse} warehouses={warehouses} canAdjust={canAdjust} onAdjust={(item) => setAdjustment({ open: true, stock: item })} page={stockPage} pages={stockPages} setPage={setStockPage} />}
    {tab === 'movements' && <MovementsPanel query={movementsQuery} products={products} warehouses={warehouses} filters={{ product: movementProduct, warehouse: movementWarehouse, type: movementType }} setters={{ product: setMovementProduct, warehouse: setMovementWarehouse, type: setMovementType }} page={movementPage} pages={movementPages} setPage={setMovementPage} />}
    {tab === 'low' && canReadLowStock && <LowStockPanel query={lowStockQuery} items={lowStock} />}
    {tab === 'counts' && <CountsPanel query={countsQuery} status={countStatus} setStatus={setCountStatus} canCount={canCount} canApprove={canApproveCount} currentUserId={user.id} onCreate={() => setCountOpen(true)} onApprove={(id) => { if (window.confirm('Approve this count and update stock to the counted quantity?')) approveCount.mutate(id) }} approving={approveCount.isPending} />}

    <AdjustmentDialog open={adjustment.open} onOpenChange={(open) => setAdjustment({ open, stock: open ? adjustment.stock : null })} products={products} warehouses={warehouses} initialStock={adjustment.stock} onSave={(payload) => adjust.mutate(payload)} loading={adjust.isPending} />
    <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} products={products} warehouses={warehouses} onSave={(payload) => transfer.mutate(payload)} loading={transfer.isPending} />
    <CountDialog open={countOpen} onOpenChange={setCountOpen} products={products} warehouses={warehouses} onSave={(payload) => createCount.mutate(payload)} loading={createCount.isPending} />
  </div>
}

function Summary({ icon, label, value, detail, alert }) { return <article className={`inventory-summary ${alert ? 'alert' : ''}`}><span>{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article> }

function StockPanel({ query, items, search, setSearch, warehouse, setWarehouse, warehouses, canAdjust, onAdjust, page, pages, setPage }) {
  return <section className="inventory-panel">
    <header><div><h2>Stock by location</h2><p>Each row represents one product stored in one warehouse.</p></div></header>
    <div className="inventory-filters"><div className="search-box"><Search /><Input placeholder="Search SKU or product name..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="form-select" value={warehouse} onChange={(event) => setWarehouse(event.target.value)}><option value="">All warehouses</option>{warehouses.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select></div>
    {query.isLoading ? <InventoryState loading text="Loading stock..." /> : query.isError ? <InventoryState error retry={query.refetch} text="Unable to load stock" /> : items.length === 0 ? <InventoryState icon={<Boxes />} text="No stock matches these filters" /> : <div className="table-scroll inventory-table-scroll"><table><thead><tr><th>Product</th><th>Warehouse</th><th>Quantity at location</th><th>Updated</th>{canAdjust && <th>Action</th>}</tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="stock-product-cell"><span><Package /></span><div><strong>{item.product.name}</strong><small>{item.product.sku}</small></div></div></td><td><div className="stock-warehouse-cell"><strong>{item.warehouse.name}</strong><small>{item.warehouse.code}</small></div></td><td><strong className="stock-quantity">{formatQuantity(item.quantity)}</strong></td><td className="username">{formatDate(item.updated_at)}</td>{canAdjust && <td><Button variant="outline" size="sm" onClick={() => onAdjust(item)}><Plus />Adjust</Button></td>}</tr>)}</tbody></table></div>}
    <Pagination page={page} pages={pages} setPage={setPage} />
  </section>
}

function MovementsPanel({ query, products, warehouses, filters, setters, page, pages, setPage }) {
  const items = query.data?.items || []
  return <section className="inventory-panel"><header><div><h2>Movement history</h2><p>An auditable timeline of every quantity change.</p></div></header>
    <div className="inventory-filters three"><select className="form-select" value={filters.product} onChange={(event) => setters.product(event.target.value)}><option value="">All products</option>{products.map((item) => <option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</select><select className="form-select" value={filters.warehouse} onChange={(event) => setters.warehouse(event.target.value)}><option value="">All warehouses</option>{warehouses.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select><select className="form-select" value={filters.type} onChange={(event) => setters.type(event.target.value)}><option value="">All movement types</option><option value="in">Stock in</option><option value="out">Stock out</option><option value="adjust">Adjustment</option></select></div>
    {query.isLoading ? <InventoryState loading text="Loading movements..." /> : query.isError ? <InventoryState error retry={query.refetch} text="Unable to load movements" /> : items.length === 0 ? <InventoryState icon={<History />} text="No movements match these filters" /> : <div className="movement-timeline">{items.map((item) => <article className="movement-item" key={item.id}><div className={`movement-icon ${item.type}`}>{item.type === 'in' ? <ArrowDownToLine /> : item.type === 'out' ? <ArrowUpFromLine /> : <SlidersHorizontal />}</div><div className="movement-copy"><div><strong>{item.product.name}</strong><span>{item.product.sku}</span></div><p>{item.reason}</p><small>{item.warehouse.name} · {formatDateTime(item.created_at)}</small></div><div className={`movement-quantity ${Number(item.quantity) >= 0 ? 'positive' : 'negative'}`}><strong>{Number(item.quantity) > 0 ? '+' : ''}{formatQuantity(item.quantity)}</strong><span>{movementLabel(item.type)}</span></div></article>)}</div>}
    <Pagination page={page} pages={pages} setPage={setPage} />
  </section>
}

function LowStockPanel({ query, items }) { return <section className="inventory-panel"><header><div><h2>Low-stock alerts</h2><p>Products whose total quantity across all warehouses is at or below their minimum level.</p></div></header>{query.isLoading ? <InventoryState loading text="Checking stock levels..." /> : query.isError ? <InventoryState error retry={query.refetch} text="Unable to load low-stock alerts" /> : items.length === 0 ? <InventoryState icon={<Package />} text="All products are above their minimum stock level" /> : <div className="low-stock-grid">{items.map((item) => { const ratio = Math.min(100, Math.max(0, Number(item.total_quantity) / Math.max(1, Number(item.min_stock_level)) * 100)); return <article className="low-stock-card" key={item.product_id}><div><span><TriangleAlert /></span><small>{item.sku}</small></div><h3>{item.name}</h3><div className="stock-meter"><i style={{ width: `${ratio}%` }} /></div><footer><div><strong>{formatQuantity(item.total_quantity)}</strong><span>available</span></div><div><strong>{formatQuantity(item.min_stock_level)}</strong><span>minimum</span></div><div className="shortage"><strong>{formatQuantity(item.shortage)}</strong><span>short</span></div></footer></article> })}</div>}</section> }

function CountsPanel({ query, status, setStatus, canCount, canApprove, currentUserId, onCreate, onApprove, approving }) { const items = query.data?.items || []; return <section className="inventory-panel"><header className="count-panel-header"><div><h2>Physical stock counts</h2><p>Review actual shelf quantities before approved variances change inventory.</p></div>{canCount && <Button onClick={onCreate}><Plus />New count</Button>}</header><div className="inventory-filters"><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="pending">Pending approval</option><option value="approved">Approved counts</option><option value="">All counts</option></select></div>{query.isLoading ? <InventoryState loading text="Loading physical counts..." /> : query.isError ? <InventoryState error retry={query.refetch} text="Unable to load physical counts" /> : items.length === 0 ? <InventoryState icon={<ClipboardCheck />} text="No physical counts match this status" /> : <div className="count-list">{items.map((item) => <article className="count-item" key={item.id}><div className={`count-status-icon ${item.status}`} >{item.status === 'approved' ? <Check /> : <ClipboardCheck />}</div><div className="count-main"><div><strong>{item.product.name}</strong><span>{item.reference}</span></div><p>{item.warehouse.name} · Recorded {formatDateTime(item.created_at)}</p>{item.notes && <small>{item.notes}</small>}{item.status === 'pending' && item.created_by === currentUserId && canApprove && <small className="count-own-note">A different authorized user must approve this count.</small>}</div><div className="count-numbers"><span>Expected<strong>{formatQuantity(item.expected_quantity)}</strong></span><span>Counted<strong>{formatQuantity(item.counted_quantity)}</strong></span><span>Variance<strong className={Number(item.variance) < 0 ? 'negative' : Number(item.variance) > 0 ? 'positive' : ''}>{Number(item.variance) > 0 ? '+' : ''}{formatQuantity(item.variance)}</strong></span></div>{item.status === 'pending' && canApprove && item.created_by !== currentUserId && <Button disabled={approving} onClick={() => onApprove(item.id)}><Check />Approve</Button>}</article>)}</div>}</section> }

function InventoryState({ loading, error, retry, icon, text }) { return <div className="inventory-state">{loading ? <div className="loader" /> : error ? <AlertTriangle /> : icon}<h3>{text}</h3>{error && <Button variant="outline" onClick={() => retry()}>Try again</Button>}</div> }
function Pagination({ page, pages, setPage }) { if (pages <= 1) return null; return <div className="inventory-pagination"><span>Page {page} of {pages}</span><div><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<ChevronRight /></Button></div></div> }
function movementLabel(type) { return type === 'in' ? 'Stock in' : type === 'out' ? 'Stock out' : 'Adjustment' }
function formatQuantity(value) { return Math.round(Number(value || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 }) }
function formatDate(value) { return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) }
function formatDateTime(value) { return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) }
