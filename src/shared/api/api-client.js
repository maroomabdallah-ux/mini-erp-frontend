const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, body) { super(message); this.status = status; this.body = body }
}

export async function apiRequest(path, options = {}) {
  const { auth = true, retry = true, headers, ...init } = options
  const token = sessionStorage.getItem('erp_access_token')
  const contentHeaders = init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...contentHeaders, ...(auth && token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
  })

  if (response.status === 401 && auth && retry) {
    const refreshToken = sessionStorage.getItem('erp_refresh_token')
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) })
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        sessionStorage.setItem('erp_access_token', data.access_token)
        return apiRequest(path, { ...options, retry: false })
      }
    }
    window.dispatchEvent(new Event('erp:unauthorized'))
  }
  if (!response.ok) {
    let body
    try { body = await response.json() } catch { /* empty response */ }
    throw new ApiError(body?.detail || 'The request could not be completed. Please try again.', response.status, body)
  }
  return response.status === 204 ? undefined : response.json()
}
