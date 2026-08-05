import { apiRequest } from '@/shared/api/api-client'

export const quotationsApi = {
  list: ({ page = 1, size = 20, search = '', status = '', customerId = '' }) => {
    const params = new URLSearchParams({ page, size })
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    if (customerId) params.set('customer_id', customerId)
    return apiRequest(`/quotations?${params}`)
  },
  create: (input) => apiRequest('/quotations', { method: 'POST', body: JSON.stringify(input) }),
  update: (id, input) => apiRequest(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  send: (id) => apiRequest(`/quotations/${id}/send`, { method: 'POST' }),
  accept: (id) => apiRequest(`/quotations/${id}/accept`, { method: 'POST' }),
  reject: (id, reason) => apiRequest(`/quotations/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  expire: (id) => apiRequest(`/quotations/${id}/expire`, { method: 'POST' }),
}
