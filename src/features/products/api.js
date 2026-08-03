import { apiRequest } from '@/shared/api/api-client'

export const productsApi = {
  list: ({ page = 1, size = 20, search = '', categoryId = '', status = '' }) => {
    const params = new URLSearchParams({ page, size })
    if (search.trim()) params.set('search', search.trim())
    if (categoryId) params.set('category_id', categoryId)
    if (status) params.set('is_active', status)
    return apiRequest(`/products?${params.toString()}`)
  },
  create: (input) => apiRequest('/products', { method: 'POST', body: JSON.stringify(input) }),
  update: (id, input) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deactivate: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  importCsv: (file) => {
    const body = new FormData()
    body.append('file', file)
    return apiRequest('/products/import', { method: 'POST', body })
  },
  categories: (includeInactive = false) => apiRequest(`/categories?include_inactive=${includeInactive}`),
  createCategory: (input) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(input) }),
  updateCategory: (id, input) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deactivateCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
}
