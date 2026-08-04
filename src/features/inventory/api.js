import { apiRequest } from '@/shared/api/api-client'

export const inventoryApi = {
  stock: ({ page = 1, size = 20, search = '', productId = '', warehouseId = '' }) => {
    const params = new URLSearchParams({ page, size })
    if (search.trim()) params.set('search', search.trim())
    if (productId) params.set('product_id', productId)
    if (warehouseId) params.set('warehouse_id', warehouseId)
    return apiRequest(`/inventory/stock?${params.toString()}`)
  },
  movements: ({ page = 1, size = 20, productId = '', warehouseId = '', type = '' }) => {
    const params = new URLSearchParams({ page, size })
    if (productId) params.set('product_id', productId)
    if (warehouseId) params.set('warehouse_id', warehouseId)
    if (type) params.set('movement_type', type)
    return apiRequest(`/inventory/movements?${params.toString()}`)
  },
  lowStock: () => apiRequest('/inventory/low-stock'),
  adjust: (input) => apiRequest('/inventory/adjustments', { method: 'POST', body: JSON.stringify(input) }),
  transfer: (input) => apiRequest('/inventory/transfers', { method: 'POST', body: JSON.stringify(input) }),
  counts: ({ page = 1, size = 20, status = '' }) => {
    const params = new URLSearchParams({ page, size })
    if (status) params.set('status', status)
    return apiRequest(`/inventory/counts?${params.toString()}`)
  },
  createCount: (input) => apiRequest('/inventory/counts', { method: 'POST', body: JSON.stringify(input) }),
  approveCount: (id) => apiRequest(`/inventory/counts/${id}/approve`, { method: 'POST' }),
  products: () => apiRequest('/products?page=1&size=100&is_active=true'),
  warehouses: () => apiRequest('/warehouses?page=1&size=100&is_active=true'),
}
