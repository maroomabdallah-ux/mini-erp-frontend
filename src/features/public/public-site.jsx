import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { MiniErpLogo } from "@/components/brand/mini-erp-logo";
import { Button } from "@/components/ui/button";

const modules = [
  [ShoppingCart, "Sales", "Quotations, sales orders, delivery, invoices and customer receipts."],
  [Boxes, "Purchasing & inventory", "Purchase approvals, partial receipts, warehouses, transfers and stock counts."],
  [Landmark, "Accounting", "Automatic journals, chart of accounts, payments, statements and source traceability."],
  [BarChart3, "Reports", "Profit, sales, inventory valuation, receivables aging and management indicators."],
  [Users, "Administration", "Users, roles, permissions, customers, suppliers and protected system settings."],
  [ShieldCheck, "Control & security", "Audit history, role-based access, secure sessions and reversible financial actions."],
];

function PublicHeader({ page, onNavigate }) {
  return (
    <header className="public-header">
      <button className="public-logo" onClick={() => onNavigate("home")}>
        <span className="brand-mark small"><MiniErpLogo /></span>
        <span><strong>Mini ERP</strong><small>Business Management</small></span>
      </button>
      <nav aria-label="Public navigation">
        <button className={page === "home" ? "active" : ""} onClick={() => onNavigate("home")}>Home</button>
        <button className={page === "about" ? "active" : ""} onClick={() => onNavigate("about")}>About</button>
      </nav>
      <Button onClick={() => onNavigate("login")}>Sign in <ArrowRight /></Button>
    </header>
  );
}

export function PublicSite({ page, onNavigate }) {
  return (
    <main className="public-site">
      <PublicHeader page={page} onNavigate={onNavigate} />
      {page === "about" ? <AboutPage onNavigate={onNavigate} /> : <HomePage onNavigate={onNavigate} />}
      <footer className="public-footer"><span>Mini ERP System</span><span>Connected operations. Reliable decisions.</span></footer>
    </main>
  );
}

function HomePage({ onNavigate }) {
  return (
    <>
      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-kicker"><span className="kicker-dot" /> Built for controlled growth</span>
          <h1>Your business.<br /><em>One source of truth.</em></h1>
          <p>Mini ERP brings sales, purchasing, inventory and finance into one refined operating system—giving every team clarity and every decision reliable data.</p>
          <div className="public-actions">
            <Button size="lg" onClick={() => onNavigate("login")}>Enter workspace <ArrowUpRight /></Button>
            <button className="public-text-link" onClick={() => onNavigate("about")}>Discover the platform <ArrowRight /></button>
          </div>
          <div className="public-proof"><span><ShieldCheck /> Role-based access</span><span><FileCheck2 /> Complete audit trail</span><span><TrendingUp /> Live reporting</span></div>
        </div>
        <div className="public-product-stage" aria-label="ERP dashboard preview">
          <div className="stage-glow" />
          <div className="product-window">
            <div className="product-window-bar"><div><i /><i /><i /></div><span>Executive overview</span><small>Live</small></div>
            <div className="product-preview">
              <aside><MiniErpLogo /><span /><span /><span /><span /><span /></aside>
              <div className="preview-main">
                <div className="preview-heading"><div><small>Good morning</small><strong>Business overview</strong></div><span>August 2026</span></div>
                <div className="preview-stats">
                  <PreviewStat icon={CircleDollarSign} label="Net revenue" value="JD 128,450" trend="+12.4%" />
                  <PreviewStat icon={PackageCheck} label="Inventory value" value="JD 55,200" trend="Healthy" />
                  <PreviewStat icon={TrendingUp} label="Monthly profit" value="JD 18,640" trend="+8.2%" />
                </div>
                <div className="preview-lower">
                  <div className="preview-chart"><span>Revenue performance</span><div className="chart-bars">{[42, 57, 48, 72, 64, 88, 78, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="chart-line" /></div>
                  <div className="preview-activity"><span>Recent activity</span><p><b>SO</b><i /><small>Sales order confirmed</small></p><p><b>GR</b><i /><small>Goods received</small></p><p><b>JE</b><i /><small>Journal posted</small></p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="stage-chip stage-chip-one"><ShieldCheck /><span><small>Control</small>Every action traceable</span></div>
          <div className="stage-chip stage-chip-two"><BarChart3 /><span><small>Performance</small>Real-time visibility</span></div>
        </div>
      </section>
      <section className="public-value-strip"><span>FROM QUOTE</span><i /><span>TO CASH</span><i /><span>TO LEDGER</span><i /><span>TO INSIGHT</span></section>
      <section className="public-section">
        <div className="public-section-heading"><span>THE COMPLETE OPERATING CORE</span><h2>Everything your business needs.<br />Nothing it doesn’t.</h2><p>Purpose-built workflows replace scattered spreadsheets and disconnected tools with a single, dependable system.</p></div>
        <div className="public-module-grid">{modules.map(([Icon, title, text]) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
    </>
  );
}

function PreviewStat({ icon: Icon, label, value, trend }) {
  return <article><span><Icon /></span><small>{label}</small><strong>{value}</strong><em>{trend}</em></article>;
}

function AboutPage({ onNavigate }) {
  return (
    <section className="public-about">
      <span className="public-kicker">About the project</span>
      <h1>A practical Mini ERP built around real workflows.</h1>
      <p className="public-about-lead">The project replaces disconnected daily records with controlled document lifecycles. Every authorized action updates the relevant operational data, preserves an audit trail and—when financial—creates a traceable accounting entry.</p>
      <div className="public-about-grid">
        <article><strong>01</strong><h2>Operational flow</h2><p>Manage products, partners, quotations, orders, warehouses, receiving and delivery through clear document states.</p></article>
        <article><strong>02</strong><h2>Financial integrity</h2><p>Generate balanced journals automatically, allocate receipts, protect system accounts and retain reversal history.</p></article>
        <article><strong>03</strong><h2>Management visibility</h2><p>Use dashboards and reports to follow cash, receivables, payables, stock value, profit and sales performance.</p></article>
        <article><strong>04</strong><h2>Access control</h2><p>Give each role only the permissions it needs while audit logs record important changes and source documents.</p></article>
      </div>
      <div className="public-about-cta"><div><h2>Ready to open the workspace?</h2><p>Sign in with an authorized account to access the ERP modules.</p></div><Button size="lg" onClick={() => onNavigate("login")}>Continue to sign in <ArrowRight /></Button></div>
    </section>
  );
}
