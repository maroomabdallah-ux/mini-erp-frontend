import { apiRequest } from '@/shared/api/api-client'

export const rolesApi = {
  list: () => apiRequest('/roles'),
  detail: (id) => apiRequest(`/roles/${id}`),
  permissions: () => apiRequest('/roles/permissions/all'),
  create: (input) => apiRequest('/roles', { method: 'POST', body: JSON.stringify(input) }),
  update: (id, input) => apiRequest(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deactivate: (id) => apiRequest(`/roles/${id}`, { method: 'DELETE' }),
  assignPermissions: (id, permissionIds) => apiRequest(`/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permission_ids: permissionIds }) }),
}
