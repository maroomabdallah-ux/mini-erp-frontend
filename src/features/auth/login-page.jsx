import { useState } from 'react'
import { Building2, Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from './auth-provider'

export function LoginPage() {
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
      <div className="brand-mark"><Building2 /></div>
      <div className="mt-auto max-w-lg"><span className="eyebrow"><ShieldCheck className="size-4" /> Secure, connected business management</span><h1>Clearer operations.<br />Faster decisions.</h1><p>One calm workspace to organize your team and daily operations with confidence.</p></div>
      <div className="login-orb" />
    </section>
    <section className="login-form-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="mobile-brand"><div className="brand-mark small"><Building2 /></div><strong>Mini ERP</strong></div>
        <div><p className="eyebrow-text">Welcome back</p><h2>Sign in</h2><p className="muted-copy">Enter your account details to access the admin dashboard.</p></div>
        <div className="form-field"><Label htmlFor="login">Username or email</Label><Input id="login" autoComplete="username" placeholder="admin" value={values.login} onChange={(e) => setValues({ ...values, login: e.target.value })} required /></div>
        <div className="form-field"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className="pr-11" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required /><button type="button" className="password-toggle" onClick={() => setShow(!show)} aria-label="Show password">{show ? <EyeOff /> : <Eye />}</button></div></div>
        <Button size="lg" className="mt-1 w-full" disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}Sign in</Button>
        <p className="login-help">Need help? Contact your system administrator</p>
      </form>
    </section>
  </main>
}
