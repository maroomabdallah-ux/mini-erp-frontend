import { apiRequest } from '@/shared/api/api-client'

export const warehousesApi = {
  list: ({ page = 1, size = 20, search = '', status = '' }) => {
    const params = new URLSearchParams({ page, size })
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('is_active', status)
    return apiRequest(`/warehouses?${params.toString()}`)
  },
  create: (input) => apiRequest('/warehouses', { method: 'POST', body: JSON.stringify(input) }),
  update: (id, input) => apiRequest(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deactivate: (id) => apiRequest(`/warehouses/${id}`, { method: 'DELETE' }),
}
