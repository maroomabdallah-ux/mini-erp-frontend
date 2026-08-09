# Mini ERP Frontend

Frontend application built with React, JavaScript, Vite, Tailwind CSS, shadcn-style components, TanStack Query, and permission-based navigation.

The completed scope includes authentication, role-aware dashboards, administration, master data, procurement, inventory, quotations, sales orders, billing, payments, accounting, statements, and management reporting.

## Project Status

The functional frontend scope is complete. The Reports workspace provides an executive overview, profit analysis, twelve-month sales trend, top products, inventory valuation, receivables aging, and a running stock ledger. Accounting includes a read-first journal register, hierarchical Chart of Accounts, source-document navigation, supplier balances and payment reversal, bank-style statements, and invoice accounting timelines.

The frontend now includes a TypeScript entry point and TypeScript project validation, route-level code splitting, CI build/typecheck/security gates, partial purchase receiving, multi-invoice customer receipt allocation, per-warehouse valuation, report ranking options, category profit filters, and downloadable CSV import error reports.

Final local checks:

```bash
npm run typecheck
npm run build
npm audit
```

## 1. Run the Project

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The frontend requires the Mini ERP backend to be running separately.

## 2. Important URLs

Frontend development server:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:8000
```

Backend Swagger UI:

```text
http://localhost:8000/docs
```

## 3. Environment Configuration

The frontend reads the backend URL from:

```env
VITE_API_URL=http://localhost:8000
```

Set this value before running or building the application when the API uses a different host or port.

## 4. Development Admin Account

```text
Username: admin
Password: Passw0rd!
Email: admin@example.com
```

These credentials are for local development only. Change the password in any shared or production-like environment.

## 5. Authentication and Session Flow

The login page accepts a username or email address and a password.

Authentication flow:

1. The frontend calls `POST /auth/login`.
2. The backend returns an access token, refresh token, and user profile.
3. The frontend stores authentication tokens in session storage, so closing the browser tab ends the local session.
4. The centralized API client adds the access token to protected requests.
5. When the access token expires, the client attempts one token refresh.
6. If refresh fails, the local session is cleared and the login page is displayed.

The current user profile contains the effective roles and permissions used to build the navigation and hide unauthorized actions.

Every authenticated user also has a Settings workspace for updating personal details, changing their password, choosing Light/Dark/System appearance, and selecting English or Arabic. The implemented application pages, dialogs, form hints, filters, states, and navigation support automatic English LTR and Arabic RTL presentation. Preferences are stored locally per browser.

## 6. Permission Enforcement

The frontend uses permissions for navigation and interface behavior. The backend remains the final security authority and validates every protected request.

Implemented frontend permissions:

| Permission                 | Frontend access                                                |
| -------------------------- | -------------------------------------------------------------- |
| `users.manage`             | View and manage users                                          |
| `roles.manage`             | View and manage roles and permissions                          |
| `audit.read`               | View audit logs                                                |
| `products.read`            | View products and categories                                   |
| `products.manage`          | Create, update, deactivate, and import products and categories |
| `warehouses.read`          | View and search warehouses                                     |
| `warehouses.manage`        | Create, update, and deactivate warehouses                      |
| `suppliers.read`           | View suppliers                                                 |
| `suppliers.manage`         | Create, update, and deactivate suppliers                       |
| `customers.read`           | View customers                                                 |
| `customers.manage`         | Create, update, and deactivate customers                       |
| `purchase_orders.read`     | View purchase orders                                           |
| `purchase_orders.create`   | Create purchase orders                                         |
| `purchase_orders.update`   | Edit and submit draft purchase orders                          |
| `purchase_orders.approve`  | Approve or reject purchase orders                              |
| `purchase_orders.cancel`   | Cancel purchase orders                                         |
| `goods_receipts.read`      | View goods receipts                                            |
| `goods_receipts.create`    | Receive approved purchase orders                               |
| `quotations.read`          | View sales quotations                                          |
| `quotations.manage`        | Create, edit, send, accept, reject, and expire quotations      |
| `inventory.read`           | View stock by location and movement history                    |
| `inventory.adjust`         | Record manual stock adjustments                                |
| `inventory.transfer`       | Transfer stock between warehouses                              |
| `inventory.count`          | Record physical stock counts                                   |
| `inventory.count.approve`  | Approve counts and apply variances                             |
| `inventory.low_stock.read` | View aggregate low-stock alerts                                |

Users may need to sign out and sign in again after their backend permissions change.

## 7. Current Role Access

Product access:

| Role               | View products | Manage products |
| ------------------ | ------------: | --------------: |
| Admin              |           Yes |             Yes |
| Purchasing Officer |           Yes |             Yes |
| Sales Officer      |           Yes |              No |
| Warehouse Keeper   |           Yes |              No |
| Accountant         |           Yes |              No |
| Manager            |           Yes |              No |

Warehouse access:

| Role               | View warehouses | Manage warehouses |
| ------------------ | --------------: | ----------------: |
| Admin              |             Yes |               Yes |
| Purchasing Officer |             Yes |                No |
| Sales Officer      |             Yes |                No |
| Warehouse Keeper   |             Yes |                No |
| Accountant         |             Yes |                No |
| Manager            |             Yes |                No |

An authorized administrator can change role permissions from the Roles & Permissions page.

## 8. Dashboard

The dashboard displays:

- The signed-in user's account status.
- The primary assigned role.
- A summary of effective permissions.
- Role-aware access information.

The dashboard is available to every authenticated user.

## 9. User Management

The Users page supports:

- Server-side search and pagination.
- Creating users.
- Updating account details.
- Assigning active roles.
- Resetting passwords.
- Soft-deactivating accounts.
- Preventing self-deactivation from the interface.
- Loading, empty, and error states.

This page requires `users.manage`.

## 10. Roles and Permissions

The Roles & Permissions page supports:

- Listing roles.
- Creating custom roles.
- Updating role details.
- Assigning and replacing permissions.
- Deactivating non-core roles.
- Displaying permissions by module.

This page requires `roles.manage`.

## 11. Audit Logs

The Audit Logs page supports:

- Pagination.
- Filtering by user, action, table, and date.
- Viewing record details.
- Viewing old and new JSON values.

This page requires `audit.read`.

## 12. Products and Categories

The Products feature supports:

- Product search by name, SKU, or barcode.
- Category and active-status filters.
- Server-side pagination.
- Product creation and editing.
- Product soft deactivation.
- Cost price, sale price, and minimum stock configuration.
- Hierarchical category creation and editing.
- Category soft deactivation.
- CSV bulk import.

Read operations require `products.read`. Management actions require `products.manage`.

## 13. Product CSV Import

The repository includes a ready-to-use example:

```text
sample-products.csv
```

CSV format:

```csv
sku,name,barcode,category_id,cost_price,sale_price,min_stock_level
LAP-001,Business Laptop,123456789,1,500.00,650.00,5.00
MOU-001,Wireless Mouse,987654321,2,12.00,20.00,10.00
```

Required columns:

- `sku`
- `name`

The backend validates each row separately. Valid rows are imported even when other rows contain errors.

## 14. Warehouses

The Warehouses feature supports:

- Search by code, name, or address.
- Active-status filtering.
- Pagination.
- Creating and updating warehouses.
- Soft-deactivating warehouses.
- Permission-aware management actions.
- A responsive location-card layout distinct from the table-based modules.

Read operations require `warehouses.read`. Management actions require `warehouses.manage`.

The backend prevents deactivating a warehouse that currently holds stock.

## 15. Inventory

The Inventory workspace supports:

- Stock quantities for each product and warehouse pair.
- Search and warehouse filtering with server-side pagination.
- A filtered total quantity across all matching locations.
- Movement history by product, warehouse, and movement type.
- Manual positive or negative adjustments with a required reason.
- Atomic warehouse-to-warehouse transfers with available-stock validation and before/after previews.
- Physical stock counts with system-versus-counted variance previews.
- A pending approval workflow that changes stock only after authorized review.
- Aggregate low-stock alerts based on each product's minimum stock level.
- Permission-aware tabs and actions.

Stock and movement access requires `inventory.read`. Manual adjustments require `inventory.adjust`. Warehouse transfers require `inventory.transfer`. Count entry requires `inventory.count`, while approval requires `inventory.count.approve`. Low-stock alerts require `inventory.low_stock.read`.

Default role access follows the backend seed policy: Admin has all Inventory actions, Warehouse Keeper can view, adjust, and read alerts, Sales Officer can view stock and movements, and Manager can view stock, movements, and alerts.

## 16. Suppliers and Purchasing

The Suppliers workspace supports search, status filtering, contact and credit-term management, editing, and soft deactivation.

The Purchase Orders workspace implements the complete purchasing flow:

```text
Draft → Pending Approval → Approved → Goods Receipt → Warehouse Stock
```

Authorized users can create and edit draft orders using active suppliers and products, submit them for approval, approve or reject them, cancel active orders, and receive approved goods into a selected warehouse. Goods receipt updates inventory and movement history through the backend transaction.

## 17. Customers

The Customers workspace supports:

- Automatic customer codes.
- Contact person, email, phone, address, city, and tax-number fields.
- Approved customer credit limits.
- Search, city and status filters, pagination, editing, and soft deactivation.
- Permission-aware read and management actions.

Sales Officers manage customer records. Managers and Accountants have read access, while Administrators have full access.

## 18. Sales Quotations

The Quotations workspace builds commercial offers from active customers and catalog products. It includes whole-unit quantities, customer-facing unit prices, validity dates, discounts, tax, notes, and automatic total calculations.

Implemented workflow:

```text
Draft → Sent → Accepted / Rejected / Expired
```

Only drafts can be edited. Rejected quotations retain the customer decision reason. Accepted quotations expose a separate conversion action that creates a Sales Order; quotations do not reserve or deduct stock.

## 19. Sales Orders and Delivery

The Sales Orders workspace provides a controlled fulfillment flow:

```text
Accepted Quotation → Draft Sales Order → Confirmed → Warehouse Delivery
```

The register includes search, status filters, operational metrics, complete order details, frozen quotation totals, cancellation reasons, and fulfillment history. Confirmation does not change stock. During delivery, the interface checks every active warehouse, shows available versus required units for each product, and permits selection only when one warehouse can fulfill the entire order. A successful delivery deducts inventory and displays the generated delivery reference.

## 20. Invoices and Payments

The billing workspace converts delivered Sales Orders into customer invoices and follows the complete receivable lifecycle:

```text
Draft Invoice → Issued → Partially Paid → Paid
```

It includes eligible-order selection, automatic 30-day due dates, overdue filtering, immutable invoice totals, payment methods and references, partial payments, remaining balances, controlled reversals, cancellation of unpaid documents, accountant alerts, bilingual UI, dark mode, and printable invoice details.

## 21. API Client

All feature APIs use the centralized client in:

```text
src/shared/api/api-client.js
```

The client handles:

- The configured backend base URL.
- JSON request headers.
- Multipart form data for CSV uploads.
- Bearer access tokens.
- One automatic refresh attempt after `401 Unauthorized`.
- Standard API error extraction.
- Session-expiration events.

## 22. Frontend Architecture

The application uses a simple feature-based architecture:

- Each business feature owns its pages, dialogs, and API functions.
- Shared shadcn-style components live in `src/components/ui`.
- Authentication state is managed by `AuthProvider`.
- Server state and cache invalidation are managed by TanStack Query.
- Navigation configuration is separate from feature components.
- Permission constants and checks are shared across the application.
- Global responsive styles and the design system live in one stylesheet.

## 23. Project Structure

```text
src/
├── app/
│   ├── app.jsx                 # Application entry and page authorization
│   └── navigation.js          # Permission-aware navigation
├── components/
│   ├── auth/                  # Shared authorization components
│   ├── layout/                # Application shell and navigation
│   └── ui/                    # Reusable shadcn-style UI components
├── features/
│   ├── audit/                 # Audit log API and interface
│   ├── auth/                  # Authentication, provider, and login
│   ├── customers/             # Customer master data
│   ├── dashboard/             # Role-aware overview
│   ├── inventory/             # Stock, movements, alerts, and adjustments
│   ├── products/              # Products and categories
│   ├── purchases/             # Purchase orders and goods receipts
│   ├── quotations/            # Sales quotation workflow
│   ├── roles/                 # Roles and permissions
│   ├── settings/              # Profile, security, language, and appearance
│   ├── suppliers/             # Supplier directory
│   ├── users/                 # User management
│   └── warehouses/            # Warehouse management
├── lib/
│   └── utils.js               # Shared utility functions
├── shared/
│   ├── api/                   # Centralized API client
│   └── permissions/           # Permission constants and helpers
├── styles/
│   └── globals.css            # Theme and responsive styles
└── main.jsx                   # React bootstrap file
```

## 24. Technology Stack

- React 19
- JavaScript with ES modules
- Vite 8
- Tailwind CSS 4
- shadcn-style components
- Radix UI primitives
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- Sonner

## 25. User Interface Standards

The implemented interface includes:

- English application content.
- Responsive desktop, tablet, and mobile layouts.
- Permission-aware navigation.
- Consistent loading, empty, error, and success states.
- Confirmation before destructive actions.
- Toast notifications for API operations.
- A cool-neutral visual system with accessible status colors.
- Feature-specific layouts where the data benefits from a different presentation.

## 26. Available Scripts

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 27. Production Build

Run:

```bash
npm run build
```

The optimized application is generated in:

```text
dist/
```

Set the correct `VITE_API_URL` before building for a non-local environment.

## 28. Current Scope

Completed frontend modules:

- Authentication and session handling
- Dashboard
- Users
- Roles and permissions
- Audit logs
- Products and categories
- Product CSV import
- Suppliers
- Warehouses
- Inventory stock overview, movements, adjustments, transfers, physical counts, approvals, and low-stock alerts
- Purchase orders and goods receipts
- Customers
- Sales quotations
- Sales orders, warehouse availability, confirmation, cancellation, and delivery
- Customer invoices, partial and full payments, balances, reversals, and overdue alerts
- Accounting dashboard with Cash, Bank, AR, AP, Inventory, and monthly-profit balances
- Read-first journal register with date, account, source-document, and text filters
- Journal detail dialogs with separated debit and credit sections and source navigation
- Hierarchical Chart of Accounts with protected system-account badges
- Supplier payments with purchase-order paid and outstanding balances
- Bank-style customer and supplier statements with running balances
- Invoice accounting timelines linking document, journal, payment, and payment-journal events
- Printable quotations, sales orders, invoices, and statements
- Personal settings with profile editing, password changes, dark mode, and bilingual direction support

Remaining frontend modules include:

- Reports

## 29. Quality Checks

Verify the production build before considering a frontend feature complete:

```bash
npm run build
```

The current application build completes successfully with all implemented modules.
