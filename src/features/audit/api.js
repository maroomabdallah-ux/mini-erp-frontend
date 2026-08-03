import { apiRequest } from '@/shared/api/api-client'

export const auditApi = {
  list: (filters) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => { if (value !== '' && value != null) params.set(key, value) })
    return apiRequest(`/audit-logs?${params.toString()}`)
  },
}
