import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  Landmark,
  PackageCheck,
  PackageX,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auditApi } from "@/features/audit/api";
import { inventoryApi } from "@/features/inventory/api";
import { purchasesApi } from "@/features/purchases/api";
import { billingApi } from "@/features/billing/api";
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import { usePreferences } from "@/shared/preferences/preferences-provider";

export function ActionCenter({ user, currentPage, onNavigate }) {
  const { t, language } = usePreferences();
  const canApproveCounts = hasPermission(
    user,
    PERMISSIONS.INVENTORY_COUNT_APPROVE,
  );
  const canReadLowStock = hasPermission(
    user,
    PERMISSIONS.INVENTORY_LOW_STOCK_READ,
  );
  const canReadAudit = hasPermission(user, PERMISSIONS.AUDIT_READ);
  const canApproveOrders = hasPermission(
    user,
    PERMISSIONS.PURCHASE_ORDERS_APPROVE,
  );
  const canReceiveOrders = hasPermission(
    user,
    PERMISSIONS.GOODS_RECEIPTS_CREATE,
  );
  const canCreatePayments = hasPermission(user, PERMISSIONS.PAYMENTS_CREATE);
  const readStorageKey = `erp_action_center_read_${user.id}`;
  const [readItems, setReadItems] = useState(
    () => new Set(JSON.parse(localStorage.getItem(readStorageKey) || "[]")),
  );
  useEffect(
    () =>
      setReadItems(
        new Set(JSON.parse(localStorage.getItem(readStorageKey) || "[]")),
      ),
    [readStorageKey],
  );
  const countsQuery = useQuery({
    queryKey: ["action-center-counts"],
    queryFn: () => inventoryApi.counts({ page: 1, size: 5, status: "pending" }),
    enabled: canApproveCounts,
    refetchInterval: 60_000,
  });
  const lowStockQuery = useQuery({
    queryKey: ["action-center-low-stock"],
    queryFn: inventoryApi.lowStock,
    enabled: canReadLowStock,
    refetchInterval: 60_000,
  });
  const auditQuery = useQuery({
    queryKey: ["action-center-audit"],
    queryFn: () => auditApi.list({ page: 1, size: 4 }),
    enabled: canReadAudit,
    refetchInterval: 60_000,
  });
  const approvalOrdersQuery = useQuery({
    queryKey: ["action-center-purchase-orders", "pending"],
    queryFn: () =>
      purchasesApi.list({ page: 1, size: 5, status: "pending_approval" }),
    enabled: canApproveOrders,
    refetchInterval: 60_000,
  });
  const receivingOrdersQuery = useQuery({
    queryKey: ["action-center-purchase-orders", "approved"],
    queryFn: () => purchasesApi.list({ page: 1, size: 5, status: "approved" }),
    enabled: canReceiveOrders,
    refetchInterval: 60_000,
  });
  const overdueInvoicesQuery = useQuery({
    queryKey: ["action-center-invoices", "overdue"],
    queryFn: () => billingApi.list({ page: 1, size: 5, overdue: true }),
    enabled: canCreatePayments,
    refetchInterval: 60_000,
  });
  const pendingCounts = canApproveCounts ? countsQuery.data?.items || [] : [];
  const pendingCountTotal = canApproveCounts ? countsQuery.data?.total || 0 : 0;
  const lowStock = canReadLowStock ? lowStockQuery.data || [] : [];
  const recentAudit = canReadAudit ? auditQuery.data || [] : [];
  const approvalOrders = canApproveOrders
    ? approvalOrdersQuery.data?.items || []
    : [];
  const receivingOrders = canReceiveOrders
    ? receivingOrdersQuery.data?.items || []
    : [];
  const overdueInvoices = canCreatePayments
    ? overdueInvoicesQuery.data?.items || []
    : [];
  const countKey = (item) => `count:${item.id}`;
  const lowStockKey = (item) => `low:${item.product_id}:${item.total_quantity}`;
  const orderKey = (item) => `purchase:${item.id}:${item.status}`;
  const invoiceKey = (item) => `invoice:${item.id}:${item.paid_amount}`;
  const unreadCounts = pendingCounts.filter(
    (item) => !readItems.has(countKey(item)),
  ).length;
  const unreadLowStock = lowStock.filter(
    (item) => !readItems.has(lowStockKey(item)),
  ).length;
  const unreadApprovalOrders = approvalOrders.filter(
    (item) => !readItems.has(orderKey(item)),
  ).length;
  const unreadReceivingOrders = receivingOrders.filter(
    (item) => !readItems.has(orderKey(item)),
  ).length;
  const unreadInvoices = overdueInvoices.filter(
    (item) => !readItems.has(invoiceKey(item)),
  ).length;
  const actionCount =
    unreadCounts +
    unreadLowStock +
    unreadApprovalOrders +
    unreadReceivingOrders +
    unreadInvoices;
  const markRead = (key) =>
    setReadItems((current) => {
      const next = new Set(current);
      next.add(key);
      localStorage.setItem(readStorageKey, JSON.stringify([...next]));
      return next;
    });
  const goInventory = (tab) => {
    if (currentPage === "inventory")
      window.dispatchEvent(
        new CustomEvent("erp:inventory-tab", { detail: tab }),
      );
    else sessionStorage.setItem("erp_inventory_tab", tab);
    onNavigate("inventory");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="notification"
          aria-label={t("actions.title")}
        >
          <Bell />
          {actionCount > 0 && (
            <span className="notification-count">
              {actionCount > 99 ? "99+" : actionCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        dir={language === "ar" ? "rtl" : "ltr"}
        className="action-center"
        align="end"
      >
        <header>
          <div>
            <strong>{t("actions.title")}</strong>
            <small>{t("actions.subtitle")}</small>
          </div>
          {actionCount > 0 && <b>{actionCount}</b>}
        </header>
        <div className="action-center-scroll">
          {canApproveCounts && (
            <ActionSection
              title={t("actions.approvals")}
              icon={<ClipboardCheck />}
              count={unreadCounts}
            >
              {pendingCounts.map((item) => {
                const key = countKey(item);
                return (
                  <button
                    className={readItems.has(key) ? "read" : ""}
                    key={item.id}
                    onClick={() => {
                      markRead(key);
                      goInventory("counts");
                    }}
                  >
                    <span className="action-icon count">
                      <ClipboardCheck />
                    </span>
                    <div>
                      <strong>{t("actions.countPending")}</strong>
                      <p>
                        {item.product.name} · {item.warehouse.name}
                      </p>
                      <small>{item.reference}</small>
                    </div>
                    <ChevronRight />
                  </button>
                );
              })}
            </ActionSection>
          )}
          {canApproveOrders && (
            <ActionSection
              title={t("actions.procurement")}
              icon={<ShoppingCart />}
              count={unreadApprovalOrders}
            >
              {approvalOrders.map((item) => {
                const key = orderKey(item);
                return (
                  <button
                    className={readItems.has(key) ? "read" : ""}
                    key={item.id}
                    onClick={() => {
                      markRead(key);
                      onNavigate("purchases");
                    }}
                  >
                    <span className="action-icon count">
                      <ShoppingCart />
                    </span>
                    <div>
                      <strong>{t("actions.orderApproval")}</strong>
                      <p>{item.supplier.name}</p>
                      <small>{item.number}</small>
                    </div>
                    <ChevronRight />
                  </button>
                );
              })}
            </ActionSection>
          )}
          {canReceiveOrders && (
            <ActionSection
              title={t("actions.procurement")}
              icon={<PackageCheck />}
              count={unreadReceivingOrders}
            >
              {receivingOrders.map((item) => {
                const key = orderKey(item);
                return (
                  <button
                    className={readItems.has(key) ? "read" : ""}
                    key={item.id}
                    onClick={() => {
                      markRead(key);
                      onNavigate("purchases");
                    }}
                  >
                    <span className="action-icon stock">
                      <PackageCheck />
                    </span>
                    <div>
                      <strong>{t("actions.orderReceipt")}</strong>
                      <p>{item.supplier.name}</p>
                      <small>{item.number}</small>
                    </div>
                    <ChevronRight />
                  </button>
                );
              })}
            </ActionSection>
          )}
          {canCreatePayments && (
            <ActionSection
              title="Receivables"
              icon={<Landmark />}
              count={unreadInvoices}
            >
              {overdueInvoices.map((item) => {
                const key = invoiceKey(item);
                return (
                  <button
                    className={readItems.has(key) ? "read" : ""}
                    key={item.id}
                    onClick={() => {
                      markRead(key);
                      onNavigate("billing");
                    }}
                  >
                    <span className="action-icon count">
                      <Landmark />
                    </span>
                    <div>
                      <strong>Overdue invoice</strong>
                      <p>{item.customer.name}</p>
                      <small>
                        {item.number} · {item.balance_due} JOD
                      </small>
                    </div>
                    <ChevronRight />
                  </button>
                );
              })}
            </ActionSection>
          )}
          {canReadLowStock && (
            <ActionSection
              title={t("actions.stockAlerts")}
              icon={<PackageX />}
              count={unreadLowStock}
            >
              {lowStock.slice(0, 5).map((item) => {
                const key = lowStockKey(item);
                return (
                  <button
                    className={readItems.has(key) ? "read" : ""}
                    key={item.product_id}
                    onClick={() => {
                      markRead(key);
                      goInventory("low");
                    }}
                  >
                    <span className="action-icon stock">
                      <PackageX />
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>
                        {t("actions.shortage")}: {formatQuantity(item.shortage)}
                      </p>
                      <small>{item.sku}</small>
                    </div>
                    <ChevronRight />
                  </button>
                );
              })}
            </ActionSection>
          )}
          {canReadAudit && recentAudit.length > 0 && (
            <ActionSection
              title={t("actions.recentActivity")}
              icon={<FileClock />}
            >
              {recentAudit.slice(0, 4).map((item) => (
                <button key={item.id} onClick={() => onNavigate("audit")}>
                  <span className="action-icon audit">
                    <FileClock />
                  </span>
                  <div>
                    <strong>{item.action.replaceAll("_", " ")}</strong>
                    <p>
                      {item.table_name} · #{item.record_id || "—"}
                    </p>
                    <small>{formatDate(item.created_at, language)}</small>
                  </div>
                  <ChevronRight />
                </button>
              ))}
            </ActionSection>
          )}
          {!countsQuery.isLoading &&
            !lowStockQuery.isLoading &&
            !auditQuery.isLoading &&
            !approvalOrdersQuery.isLoading &&
            !receivingOrdersQuery.isLoading &&
            !overdueInvoicesQuery.isLoading &&
            pendingCounts.length === 0 &&
            approvalOrders.length === 0 &&
            receivingOrders.length === 0 &&
            overdueInvoices.length === 0 &&
            lowStock.length === 0 &&
            recentAudit.length === 0 && (
              <div className="action-empty">
                <CheckCircle2 />
                <strong>{t("actions.clear")}</strong>
                <p>{t("actions.noActions")}</p>
              </div>
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionSection({ title, icon, count, children }) {
  if (!children || (Array.isArray(children) && children.length === 0))
    return null;
  return (
    <section className="action-section">
      <div className="action-section-title">
        <span>{icon}</span>
        <strong>{title}</strong>
        {count > 0 && <b>{count}</b>}
      </div>
      {children}
    </section>
  );
}
function formatQuantity(value) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}
function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === "ar" ? "ar-JO" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
