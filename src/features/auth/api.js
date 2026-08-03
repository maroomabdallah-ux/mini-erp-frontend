import { apiRequest } from '@/shared/api/api-client'
export const login = (input) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(input), auth: false })
export const getMe = () => apiRequest('/auth/me')
export const logout = (refreshToken) => apiRequest('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }), auth: false })
