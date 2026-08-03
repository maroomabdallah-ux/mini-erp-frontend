import { apiRequest } from '@/shared/api/api-client'
export const usersApi = {
  list: (page = 1, size = 20, search = '') => {
    const params = new URLSearchParams({ page, size })
    if (search.trim()) params.set('search', search.trim())
    return apiRequest(`/users?${params.toString()}`)
  },
  roles: () => apiRequest('/roles'),
  create: (input) => apiRequest('/users', { method: 'POST', body: JSON.stringify(input) }),
  update: (id, input) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deactivate: (id) => apiRequest(`/users/${id}/deactivate`, { method: 'POST' }),
  resetPassword: (id, newPassword) => apiRequest(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ new_password: newPassword }) }),
}
