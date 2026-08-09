import { useState } from 'react'
import { ArrowLeft, Database, Eye, EyeOff, FileClock, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from './auth-provider'
import { MiniErpLogo } from '@/components/brand/mini-erp-logo'

export function LoginPage({ onBack }) {
  const { login } = useAuth()
  const [values, setValues] = useState({ login: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try { await login(values); toast.success('Welcome back') } catch (error) { toast.error(error.message) } finally { setLoading(false) }
  }
  return <main className="login-page">
    <section className="login-brand">
      <div className="brand-signature"><MiniErpLogo variant="full" /></div>
      <div className="login-brand-copy"><span className="eyebrow"><ShieldCheck className="size-4" /> Enterprise resource planning</span><h1>Operational intelligence.<br />Financial control.</h1><p>A controlled workspace connecting every document, movement, approval, and journal entry.</p><div className="login-system-grid"><span><LockKeyhole /><b>RBAC</b><small>Role-based access</small></span><span><FileClock /><b>Audit</b><small>Traceable actions</small></span><span><Database /><b>Data</b><small>Single source of truth</small></span></div></div>
      <div className="login-orb" />
    </section>
    <section className="login-form-wrap">
      <form className="login-card" onSubmit={submit}>
        <button type="button" className="login-back" onClick={onBack}><ArrowLeft /> Back to home</button>
        <div className="mobile-brand"><div className="brand-mark small"><MiniErpLogo /></div><strong>Mini ERP</strong></div>
        <div><p className="eyebrow-text">Secure workspace</p><h2>Sign in to Mini ERP</h2><p className="muted-copy">Use your authorized credentials to continue to the business operating system.</p></div>
        <div className="form-field"><Label htmlFor="login">Username or email</Label><Input id="login" autoComplete="username" placeholder="admin" value={values.login} onChange={(e) => setValues({ ...values, login: e.target.value })} required /></div>
        <div className="form-field"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className="pr-11" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required /><button type="button" className="password-toggle" onClick={() => setShow(!show)} aria-label="Show password">{show ? <EyeOff /> : <Eye />}</button></div></div>
        <Button size="lg" className="mt-1 w-full" disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}Sign in</Button>
        <p className="login-help"><ShieldCheck /> Protected session · Contact your administrator for access</p>
      </form>
    </section>
  </main>
}
