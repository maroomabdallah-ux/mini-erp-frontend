import { apiRequest } from '@/shared/api/api-client'

export const customersApi = {
  list: ({ page = 1, size = 20, search = '', status = '', city = '' }) => {
    const params = new URLSearchParams({ page, size })
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('is_active', status)
    if (city) params.set('city', city)
    return apiRequest(`/customers?${params}`)
  },
  cities: () => apiRequest('/customers/cities'),
  create: (input) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(input) }),
  update: (id, input) => apiRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deactivate: (id) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),
}
