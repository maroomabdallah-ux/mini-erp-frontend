export function MiniErpLogo({ className = '', variant = 'icon' }) {
  if (variant === 'full') return <img className={`mini-erp-logo-full ${className}`} src="/mini-erp-icon.png" alt="Mini ERP" />
  return <span className={`mini-erp-logo ${className}`} role="img" aria-label="Mini ERP logo"><img src="/mini-erp-icon.png" alt="" /></span>
}
