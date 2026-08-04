import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Armchair,
  Boxes,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  FileUp,
  FolderTree,
  Laptop,
  MoreHorizontal,
  NotebookTabs,
  Package,
  PenLine,
  Pencil,
  Plus,
  Search,
  Smartphone,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/auth-provider";
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import { productsApi } from "./api";
import { ProductDialog } from "./product-dialog";
import { CategoryDialog } from "./category-dialog";

const PAGE_SIZE = 20;
const money = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

function categoryVisual(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes("computer") || normalized.includes("laptop"))
    return { Icon: Laptop, tone: "blue" };
  if (normalized.includes("mobile") || normalized.includes("phone"))
    return { Icon: Smartphone, tone: "violet" };
  if (normalized.includes("paper") || normalized.includes("notebook"))
    return { Icon: NotebookTabs, tone: "sky" };
  if (normalized.includes("writing") || normalized.includes("pen"))
    return { Icon: PenLine, tone: "rose" };
  if (normalized.includes("furniture") || normalized.includes("chair"))
    return { Icon: Armchair, tone: "amber" };
  if (normalized.includes("electronic"))
    return { Icon: Zap, tone: "indigo" };
  if (normalized.includes("office") || normalized.includes("supplies"))
    return { Icon: Boxes, tone: "emerald" };
  return { Icon: Tag, tone: "neutral" };
}

export function ProductsPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.PRODUCTS_MANAGE);
  const queryClient = useQueryClient();
  const importInput = useRef(null);
  const [view, setView] = useState("products");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("true");
  const [productEditor, setProductEditor] = useState({
    open: false,
    product: null,
  });
  const [categoryEditor, setCategoryEditor] = useState({
    open: false,
    category: null,
  });

  const filters = {
    page,
    size: PAGE_SIZE,
    search: deferredSearch,
    categoryId,
    status,
  };
  const productsQuery = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.list(filters),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories", true],
    queryFn: () => productsApi.categories(true),
  });
  const products = productsQuery.data?.items || [];
  const total = productsQuery.data?.total || 0;
  const categories = categoriesQuery.data || [];
  const activeCategories = categories.filter((category) => category.is_active);

  useEffect(() => setPage(1), [deferredSearch, categoryId, status]);
  const refreshProducts = () =>
    queryClient.invalidateQueries({ queryKey: ["products"] });
  const refreshCategories = () =>
    queryClient.invalidateQueries({ queryKey: ["categories"] });

  const saveProduct = useMutation({
    mutationFn: (payload) =>
      productEditor.product
        ? productsApi.update(productEditor.product.id, payload)
        : productsApi.create(payload),
    onSuccess: () => {
      toast.success(
        productEditor.product
          ? "Product updated successfully"
          : "Product added successfully",
      );
      setProductEditor({ open: false, product: null });
      refreshProducts();
    },
    onError: (error) => toast.error(error.message),
  });
  const deactivateProduct = useMutation({
    mutationFn: productsApi.deactivate,
    onSuccess: () => {
      toast.success("Product deactivated");
      refreshProducts();
    },
    onError: (error) => toast.error(error.message),
  });
  const saveCategory = useMutation({
    mutationFn: (payload) =>
      categoryEditor.category
        ? productsApi.updateCategory(categoryEditor.category.id, payload)
        : productsApi.createCategory(payload),
    onSuccess: () => {
      toast.success(
        categoryEditor.category
          ? "Category updated successfully"
          : "Category added successfully",
      );
      setCategoryEditor({ open: false, category: null });
      refreshCategories();
      refreshProducts();
    },
    onError: (error) => toast.error(error.message),
  });
  const deactivateCategory = useMutation({
    mutationFn: productsApi.deactivateCategory,
    onSuccess: () => {
      toast.success("Category deactivated");
      refreshCategories();
      refreshProducts();
    },
    onError: (error) => toast.error(error.message),
  });
  const importProducts = useMutation({
    mutationFn: productsApi.importCsv,
    onSuccess: (result) => {
      if (result.error_count)
        toast.warning(
          `${result.created_count} products imported. ${result.error_count} rows need attention.`,
        );
      else
        toast.success(`${result.created_count} products imported successfully`);
      refreshProducts();
    },
    onError: (error) => toast.error(error.message),
  });
  const chooseImport = (event) => {
    const file = event.target.files?.[0];
    if (file) importProducts.mutate(file);
    event.target.value = "";
  };

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow-text">Catalog management</p>
          <h1>Products</h1>
          <p>
            Keep product details, pricing, and categories organized in one
            place.
          </p>
        </div>
        {canManage && (
          <div className="heading-actions">
            <input
              ref={importInput}
              className="sr-only"
              type="file"
              accept=".csv,text/csv"
              onChange={chooseImport}
            />
            <Button
              variant="outline"
              size="lg"
              disabled={importProducts.isPending}
              onClick={() => importInput.current?.click()}
            >
              <FileUp />
              {importProducts.isPending ? "Importing..." : "Import CSV"}
            </Button>
            <Button
              size="lg"
              onClick={() => setProductEditor({ open: true, product: null })}
            >
              <Plus />
              Add product
            </Button>
          </div>
        )}
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span>
            <Package />
          </span>
          <div>
            <p>Products found</p>
            <strong>{total}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="clay">
            <FolderTree />
          </span>
          <div>
            <p>Active categories</p>
            <strong>{activeCategories.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="amber">
            <CircleDollarSign />
          </span>
          <div>
            <p>Priced products on this page</p>
            <strong>
              {
                products.filter((product) => Number(product.sale_price) > 0)
                  .length
              }
            </strong>
          </div>
        </div>
      </section>

      <div className="catalog-tabs">
        <button
          className={view === "products" ? "active" : ""}
          onClick={() => setView("products")}
        >
          <Package />
          Product catalog
        </button>
        <button
          className={view === "categories" ? "active" : ""}
          onClick={() => setView("categories")}
        >
          <FolderTree />
          Categories
        </button>
      </div>

      {view === "products" ? (
        <section className="data-card">
          <div className="table-toolbar product-toolbar">
            <div>
              <h2>Product catalog</h2>
              <p>{total} products match the current filters</p>
            </div>
            <div className="catalog-filters">
              <div className="search-box">
                <Search />
                <Input
                  placeholder="Search name, SKU, or barcode..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                className="form-select"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">All categories</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          {productsQuery.isLoading ? (
            <LoadingState label="Loading products..." />
          ) : productsQuery.isError ? (
            <ErrorState onRetry={productsQuery.refetch} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No matching products"
              copy="Change your filters or add your first product."
            />
          ) : (
            <>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU / Barcode</th>
                      <th>Category</th>
                      <th>Cost price</th>
                      <th>Sale price</th>
                      <th>Low-stock threshold</th>
                      <th>Status</th>
                      {canManage && (
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <span>
                              <Package />
                            </span>
                            <strong>{product.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="code-cell">
                            <strong>{product.sku}</strong>
                            <span>{product.barcode || "No barcode"}</span>
                          </div>
                        </td>
                        <td>
                          {product.category ? (
                            <Badge>{product.category.name}</Badge>
                          ) : (
                            <span className="muted">Uncategorized</span>
                          )}
                        </td>
                        <td>{money(product.cost_price)}</td>
                        <td>
                          <strong>{money(product.sale_price)}</strong>
                        </td>
                    <td>
                      {Number(product.min_stock_level).toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                        <td>
                          <Status active={product.is_active} />
                        </td>
                        {canManage && (
                          <td>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setProductEditor({ open: true, product })
                                  }
                                >
                                  <Pencil />
                                  Edit product
                                </DropdownMenuItem>
                                {product.is_active && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onSelect={() => {
                                        if (
                                          window.confirm(
                                            `Deactivate ${product.name}?`,
                                          )
                                        )
                                          deactivateProduct.mutate(product.id);
                                      }}
                                    >
                                      <Trash2 />
                                      Deactivate product
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={total} onPage={setPage} />
            </>
          )}
        </section>
      ) : (
        <section className="data-card">
          <div className="table-toolbar">
            <div>
              <h2>Categories</h2>
              <p>Organize products into clear catalog groups</p>
            </div>
            {canManage && (
              <Button
                onClick={() =>
                  setCategoryEditor({ open: true, category: null })
                }
              >
                <Plus />
                Add category
              </Button>
            )}
          </div>
          {categoriesQuery.isLoading ? (
            <LoadingState label="Loading categories..." />
          ) : categoriesQuery.isError ? (
            <ErrorState onRetry={categoriesQuery.refetch} />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No categories yet"
              copy="Add a category to organize the product catalog."
            />
          ) : (
            <div className="category-grid">
              {categories.map((category) => {
                const { Icon: CategoryIcon, tone } = categoryVisual(
                  category.name,
                );
                const parent = categories.find(
                  (item) => item.id === category.parent_id,
                );
                const productCount = products.filter(
                  (product) => product.category_id === category.id,
                ).length;
                return (
                  <article
                    className={`category-card ${category.is_active ? "" : "inactive-card"}`}
                    key={category.id}
                  >
                    <div className={`category-card-icon ${tone}`}>
                      <CategoryIcon />
                    </div>
                    <div className="category-card-copy">
                      <div>
                        <h3>{category.name}</h3>
                        <Status active={category.is_active} />
                      </div>
                      <p>
                        {parent
                          ? `Subcategory of ${parent.name}`
                          : "Top-level category"}
                      </p>
                      <span>{productCount} products on current page</span>
                    </div>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onSelect={() =>
                              setCategoryEditor({ open: true, category })
                            }
                          >
                            <Pencil />
                            Edit category
                          </DropdownMenuItem>
                          {category.is_active && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => {
                                  if (
                                    window.confirm(
                                      `Deactivate ${category.name}?`,
                                    )
                                  )
                                    deactivateCategory.mutate(category.id);
                                }}
                              >
                                <Trash2 />
                                Deactivate category
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      <ProductDialog
        open={productEditor.open}
        onOpenChange={(open) =>
          setProductEditor({
            open,
            product: open ? productEditor.product : null,
          })
        }
        product={productEditor.product}
        categories={activeCategories}
        onSave={(payload) => saveProduct.mutate(payload)}
        loading={saveProduct.isPending}
      />
      <CategoryDialog
        open={categoryEditor.open}
        onOpenChange={(open) =>
          setCategoryEditor({
            open,
            category: open ? categoryEditor.category : null,
          })
        }
        category={categoryEditor.category}
        categories={categories}
        onSave={(payload) => saveCategory.mutate(payload)}
        loading={saveCategory.isPending}
      />
    </div>
  );
}

function Status({ active }) {
  return (
    <span className={`status ${active ? "active" : "inactive"}`}>
      <i />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
function LoadingState({ label }) {
  return (
    <div className="table-state">
      <div className="loader" />
      <p>{label}</p>
    </div>
  );
}
function ErrorState({ onRetry }) {
  return (
    <div className="table-state">
      <AlertTriangle />
      <h3>Unable to load data</h3>
      <Button variant="outline" onClick={() => onRetry()}>
        Try again
      </Button>
    </div>
  );
}
function EmptyState({ icon: Icon, title, copy }) {
  return (
    <div className="table-state">
      <Icon />
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}
function Pagination({ page, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="table-pagination">
      <span>
        Page {page} of {pages}
      </span>
      <div>
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
