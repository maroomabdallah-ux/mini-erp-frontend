import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Boxes,
  CalendarRange,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-provider";
import { productsApi } from "@/features/products/api";
import { warehousesApi } from "@/features/warehouses/api";
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import { reportsApi } from "./api";

const iso = (date) => date.toISOString().slice(0, 10);
const today = () => iso(new Date());
const monthStart = () => {
  const value = new Date();
  value.setDate(1);
  return iso(value);
};
const money = (value) =>
  Number(value || 0).toLocaleString("en-JO", {
    style: "currency",
    currency: "JOD",
  });

export function ReportsPage() {
  const { user } = useAuth();
  const tabs = [
    ["overview", "Executive overview", PERMISSIONS.REPORTS_PROFIT_READ],
    ["profit", "Profit", PERMISSIONS.REPORTS_PROFIT_READ],
    ["sales", "Sales", PERMISSIONS.REPORTS_MONTHLY_SALES_READ],
    ["products", "Top products", PERMISSIONS.REPORTS_TOP_PRODUCTS_READ],
    [
      "valuation",
      "Inventory valuation",
      PERMISSIONS.REPORTS_INVENTORY_VALUATION_READ,
    ],
    ["aging", "Receivables aging", PERMISSIONS.REPORTS_RECEIVABLES_READ],
    ["movements", "Stock ledger", PERMISSIONS.REPORTS_INVENTORY_VALUATION_READ],
  ].filter(([, , permission]) => hasPermission(user, permission));
  const [tab, setTab] = useState(tabs[0]?.[0] || "overview");
  return (
    <div className="reports-page">
      <section className="reports-hero">
        <div>
          <p>Business intelligence</p>
          <h1>Management reports</h1>
          <span>
            Financial and operational performance from posted ERP transactions.
          </span>
        </div>
        <BarChart3 />
      </section>
      <nav className="reports-tabs">
        {tabs.map(([id, label]) => (
          <button
            className={tab === id ? "active" : ""}
            key={id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "overview" && <Overview />}
      {tab === "profit" && <Profit />}
      {tab === "sales" && <MonthlySales />}
      {tab === "products" && <TopProducts />}
      {tab === "valuation" && <Valuation />}
      {tab === "aging" && <Aging />}
      {tab === "movements" && <StockLedger />}
    </div>
  );
}

function Overview() {
  const query = useQuery({
    queryKey: ["reports-dashboard"],
    queryFn: reportsApi.dashboard,
  });
  const cards = [
    ["Sales this month", "sales_this_month", TrendingUp, true],
    ["Profit this month", "profit_this_month", CircleDollarSign, true],
    ["Receivables", "receivables", WalletCards, true],
    ["Inventory value", "inventory_value", Boxes, true],
    ["Overdue invoices", "overdue_invoices", ReceiptText],
    ["Low-stock products", "low_stock_products", PackageSearch],
    ["Purchase approvals", "pending_purchase_approvals", CalendarRange],
    ["Quotes expiring soon", "quotations_expiring_soon", CalendarRange],
  ];
  return (
    <section className="report-kpis">
      {cards.map(([label, key, Icon, currency]) => (
        <article key={key}>
          <span>
            <Icon />
          </span>
          <div>
            <small>{label}</small>
            <strong>
              {query.isLoading
                ? "—"
                : currency
                  ? money(query.data?.[key])
                  : query.data?.[key] || 0}
            </strong>
          </div>
        </article>
      ))}
    </section>
  );
}

function Range({ value, onChange }) {
  return (
    <div className="report-range">
      <label>
        From
        <Input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
        />
      </label>
      <label>
        To
        <Input
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </label>
    </div>
  );
}

function Profit() {
  const [range, setRange] = useState({ from: monthStart(), to: today() });
  const [categoryId, setCategoryId] = useState("");
  const categories = useQuery({
    queryKey: ["report-categories"],
    queryFn: () => productsApi.categories(),
  });
  const query = useQuery({
    queryKey: ["profit-report", range, categoryId],
    queryFn: () => reportsApi.profit(range.from, range.to, categoryId),
  });
  return (
    <ReportPanel
      title="Profit report"
      subtitle="Net invoiced revenue less cost of goods sold."
      controls={
        <div className="report-range">
          <Range value={range} onChange={setRange} />
          <label>
            Category
            <select
              className="form-select"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      }
    >
      <div className="profit-summary">
        <Metric label="Revenue" value={money(query.data?.revenue)} />
        <Metric
          label="Cost of goods sold"
          value={money(query.data?.cost_of_goods_sold)}
        />
        <Metric
          label="Gross profit"
          value={money(query.data?.gross_profit)}
          highlight
        />
        <Metric
          label="Gross margin"
          value={`${query.data?.gross_margin_percent || 0}%`}
        />
      </div>
    </ReportPanel>
  );
}

function MonthlySales() {
  const query = useQuery({
    queryKey: ["monthly-sales"],
    queryFn: () => reportsApi.monthlySales(12),
  });
  const max = Math.max(
    ...(query.data || []).map((row) => Number(row.net_sales)),
    1,
  );
  return (
    <ReportPanel
      title="Monthly sales"
      subtitle="A twelve-month view of posted invoice revenue."
    >
      <div className="sales-chart">
        {query.data?.map((row) => (
          <div key={row.month}>
            <span>{money(row.net_sales)}</span>
            <i
              style={{
                height: `${Math.max(5, (Number(row.net_sales) / max) * 170)}px`,
              }}
            />
            <b>{row.month}</b>
            <small>{row.invoice_count} invoices</small>
          </div>
        ))}
      </div>
    </ReportPanel>
  );
}

function TopProducts() {
  const [range, setRange] = useState({ from: monthStart(), to: today() });
  const [sortBy, setSortBy] = useState("revenue");
  const query = useQuery({
    queryKey: ["top-products", range, sortBy],
    queryFn: () => reportsApi.topProducts(range.from, range.to, sortBy),
  });
  return (
    <ReportPanel
      title="Top-selling products"
      subtitle="Products ranked by quantity or net invoiced sales."
      controls={
        <div className="report-range">
          <Range value={range} onChange={setRange} />
          <label>
            Rank by
            <select
              className="form-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="revenue">Revenue</option>
              <option value="quantity">Quantity</option>
            </select>
          </label>
        </div>
      }
    >
      <Table
        headers={["Product", "SKU", "Quantity", "Net sales"]}
        rows={query.data?.map((row) => [
          row.product_name,
          row.sku,
          row.quantity_sold,
          money(row.net_sales),
        ])}
      />
    </ReportPanel>
  );
}

function Valuation() {
  const query = useQuery({
    queryKey: ["inventory-valuation"],
    queryFn: reportsApi.valuation,
  });
  return (
    <ReportPanel
      title="Inventory valuation"
      subtitle="Current on-hand stock valued at product cost for each warehouse."
    >
      <div className="report-total">
        <span>Total inventory value</span>
        <strong>{money(query.data?.total_value)}</strong>
        <small>{query.data?.total_quantity || 0} units on hand</small>
      </div>
      <Table
        headers={[
          "Warehouse",
          "Product",
          "SKU",
          "Quantity",
          "Unit cost",
          "Value",
        ]}
        rows={query.data?.items.map((row) => [
          row.warehouse_name,
          row.product_name,
          row.sku,
          row.quantity,
          money(row.unit_cost),
          money(row.inventory_value),
        ])}
      />
    </ReportPanel>
  );
}

function Aging() {
  const [asOf, setAsOf] = useState(today());
  const query = useQuery({
    queryKey: ["receivables-aging", asOf],
    queryFn: () => reportsApi.aging(asOf),
  });
  return (
    <ReportPanel
      title="Receivables aging"
      subtitle="Outstanding customer balances grouped by days overdue."
      controls={
        <label>
          As of
          <Input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
          />
        </label>
      }
    >
      <div className="report-total">
        <span>Total outstanding</span>
        <strong>{money(query.data?.total_outstanding)}</strong>
      </div>
      <Table
        headers={["Customer", "0–30", "31–60", "61–90", "Over 90", "Total"]}
        rows={query.data?.items.map((row) => [
          row.customer_name,
          money(row.days_0_30),
          money(row.days_31_60),
          money(row.days_61_90),
          money(row.over_90),
          money(row.total),
        ])}
      />
    </ReportPanel>
  );
}

function StockLedger() {
  const [filters, setFilters] = useState({
    productId: "",
    warehouseId: "",
    dateFrom: "",
    dateTo: "",
  });
  const products = useQuery({
    queryKey: ["report-products"],
    queryFn: () => productsApi.list({ page: 1, size: 100, status: "true" }),
  });
  const warehouses = useQuery({
    queryKey: ["report-warehouses"],
    queryFn: () => warehousesApi.list({ page: 1, size: 100, status: "true" }),
  });
  const query = useQuery({
    queryKey: ["stock-ledger", filters],
    queryFn: () => reportsApi.stockMovements(filters),
    enabled: Boolean(filters.productId),
  });
  return (
    <ReportPanel
      title="Stock movement ledger"
      subtitle="A running quantity balance for one product."
      controls={
        <div className="report-range">
          <label>
            Product
            <select
              className="form-select"
              value={filters.productId}
              onChange={(e) =>
                setFilters({ ...filters, productId: e.target.value })
              }
            >
              <option value="">Select</option>
              {products.data?.items.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.sku} — {row.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Warehouse
            <select
              className="form-select"
              value={filters.warehouseId}
              onChange={(e) =>
                setFilters({ ...filters, warehouseId: e.target.value })
              }
            >
              <option value="">All</option>
              {warehouses.data?.items.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      }
    >
      <Table
        headers={["Date", "Reference", "Warehouse", "In", "Out", "Balance"]}
        rows={query.data?.map((row) => [
          new Date(row.occurred_at).toLocaleDateString(),
          row.reference,
          row.warehouse_name,
          row.quantity_in || "",
          row.quantity_out || "",
          row.running_balance,
        ])}
        empty={
          filters.productId
            ? "No movements found."
            : "Select a product to view its ledger."
        }
      />
    </ReportPanel>
  );
}

function ReportPanel({ title, subtitle, controls, children }) {
  return (
    <section className="report-panel">
      <header>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {controls}
      </header>
      {children}
    </section>
  );
}
function Metric({ label, value, highlight }) {
  return (
    <article className={highlight ? "highlight" : ""}>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}
function Table({
  headers,
  rows = [],
  empty = "No report data for this period.",
}) {
  return (
    <div
      className="report-table"
      style={{ "--report-columns": headers.length }}
    >
      <div className="head">
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      {rows.length ? (
        rows.map((row, index) => (
          <div key={index}>
            {row.map((cell, cellIndex) => (
              <span key={cellIndex}>{cell}</span>
            ))}
          </div>
        ))
      ) : (
        <p>{empty}</p>
      )}
    </div>
  );
}
