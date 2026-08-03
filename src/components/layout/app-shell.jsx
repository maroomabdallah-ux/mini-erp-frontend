import { Bell, Building2, ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NAVIGATION_ITEMS } from '@/app/navigation'
import { hasPermission } from '@/shared/permissions/permissions'

const initials = (user) => `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}` || 'U'
export function AppShell({ children, currentPage, onNavigate }) {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false)
  const visibleNavigation = NAVIGATION_ITEMS.filter((item) => hasPermission(user, item.permission))
  return <div className="app-shell">
    {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-head"><div className="brand-mark small"><Building2 /></div><div><strong>Mini ERP</strong><span>Business workspace</span></div><button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
      <nav>{visibleNavigation.map((item) => <button key={item.id} className={currentPage === item.id ? 'active' : ''} disabled={item.disabled} onClick={() => { onNavigate(item.id); setOpen(false) }}><item.icon /><span>{item.label}</span>{currentPage === item.id && <i />}</button>)}</nav>
      <div className="sidebar-foot"><p>Version 1.0</p><span>Primary workspace</span></div>
    </aside>
    <div className="content-area">
      <header className="topbar"><Button variant="ghost" size="icon" className="menu-button" onClick={() => setOpen(true)}><Menu /></Button><div className="topbar-spacer" /><Button variant="ghost" size="icon" className="notification"><Bell /><span /></Button><div className="topbar-divider" />
        <DropdownMenu><DropdownMenuTrigger asChild><button className="profile-trigger"><Avatar><AvatarFallback>{initials(user)}</AvatarFallback></Avatar><div><strong>{user.first_name} {user.last_name}</strong><span>{user.roles?.find((role) => role.is_active)?.name || 'User'}</span></div><ChevronDown /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void logout()} className="text-destructive"><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </header>
      <main className="main-content">{children}</main>
    </div>
  </div>
}
