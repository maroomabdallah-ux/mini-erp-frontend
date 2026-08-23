import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NAVIGATION_ITEMS } from '@/app/navigation'
import { hasPermission } from '@/shared/permissions/permissions'
import { usePreferences } from '@/shared/preferences/preferences-provider'
import { MiniErpLogo } from '@/components/brand/mini-erp-logo'
import { ActionCenter } from '@/components/layout/action-center'
import { AiAssistant } from '@/features/ai-assistant/components/ai-assistant'

const initials = (user) => `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}` || 'U'
export function AppShell({ children, currentPage, onNavigate }) {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false)
  const { t } = usePreferences()
  const visibleNavigation = NAVIGATION_ITEMS.filter((item) => hasPermission(user, item.permission))
  const primaryRole = user.roles?.find((role) => role.is_active)?.name || 'user'
  const roleClass = primaryRole.toLowerCase().replaceAll(' ', '_')
  return <div className={`app-shell role-${roleClass}`}>
    {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-head"><div className="brand-mark small"><MiniErpLogo /></div><div><strong>Mini ERP</strong><span>{t('shell.workspace')}</span></div><button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
      <nav>{visibleNavigation.map((item) => <button key={item.id} className={currentPage === item.id ? 'active' : ''} disabled={item.disabled} onClick={() => { onNavigate(item.id); setOpen(false) }}><item.icon /><span>{t(item.labelKey)}</span>{currentPage === item.id && <i />}</button>)}</nav>
      <div className="sidebar-foot"><p>{t('shell.version')}</p><span>{t('shell.primary')}</span></div>
    </aside>
    <div className="content-area">
      <header className="topbar"><Button variant="ghost" size="icon" className="menu-button" onClick={() => setOpen(true)}><Menu /></Button><div className="topbar-spacer" /><AiAssistant /><ActionCenter user={user} currentPage={currentPage} onNavigate={onNavigate} /><div className="topbar-divider" />
        <DropdownMenu><DropdownMenuTrigger asChild><button className="profile-trigger"><Avatar><AvatarFallback>{initials(user)}</AvatarFallback></Avatar><div><strong>{user.first_name} {user.last_name}</strong><span>{user.roles?.find((role) => role.is_active)?.name || 'User'}</span></div><ChevronDown /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => onNavigate('settings')}>{t('shell.profile')}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void logout()} className="text-destructive"><LogOut />{t('shell.signOut')}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </header>
      <main className="main-content">{children}</main>
    </div>
  </div>
}
