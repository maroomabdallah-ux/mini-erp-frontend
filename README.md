# Mini ERP Frontend

Frontend application built with React, JavaScript, Vite, Tailwind CSS, shadcn-style components, TanStack Query, and permission-based navigation.

The currently completed scope includes authentication, session restoration, dashboard, users, roles, permissions, audit logs, categories, products, CSV product import, and warehouses.

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
3. The frontend stores the current tokens in local storage.
4. The centralized API client adds the access token to protected requests.
5. When the access token expires, the client attempts one token refresh.
6. If refresh fails, the local session is cleared and the login page is displayed.

The current user profile contains the effective roles and permissions used to build the navigation and hide unauthorized actions.

## 6. Permission Enforcement

The frontend uses permissions for navigation and interface behavior. The backend remains the final security authority and validates every protected request.

Implemented frontend permissions:

| Permission | Frontend access |
|---|---|
| `users.manage` | View and manage users |
| `roles.manage` | View and manage roles and permissions |
| `audit.read` | View audit logs |
| `products.read` | View products and categories |
| `products.manage` | Create, update, deactivate, and import products and categories |
| `warehouses.read` | View and search warehouses |
| `warehouses.manage` | Create, update, and deactivate warehouses |

Users may need to sign out and sign in again after their backend permissions change.

## 7. Current Role Access

Product access:

| Role | View products | Manage products |
|---|---:|---:|
| Admin | Yes | Yes |
| Purchasing Officer | Yes | Yes |
| Sales Officer | Yes | No |
| Warehouse Keeper | Yes | No |
| Accountant | Yes | No |
| Manager | Yes | No |

Warehouse access:

| Role | View warehouses | Manage warehouses |
|---|---:|---:|
| Admin | Yes | Yes |
| Purchasing Officer | Yes | No |
| Sales Officer | Yes | No |
| Warehouse Keeper | Yes | No |
| Accountant | Yes | No |
| Manager | Yes | No |

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

## 15. API Client

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

## 16. Frontend Architecture

The application uses a simple feature-based architecture:

- Each business feature owns its pages, dialogs, and API functions.
- Shared shadcn-style components live in `src/components/ui`.
- Authentication state is managed by `AuthProvider`.
- Server state and cache invalidation are managed by TanStack Query.
- Navigation configuration is separate from feature components.
- Permission constants and checks are shared across the application.
- Global responsive styles and the design system live in one stylesheet.

## 17. Project Structure

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
│   ├── dashboard/             # Role-aware overview
│   ├── products/              # Products and categories
│   ├── roles/                 # Roles and permissions
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

## 18. Technology Stack

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

## 19. User Interface Standards

The implemented interface includes:

- English application content.
- Responsive desktop, tablet, and mobile layouts.
- Permission-aware navigation.
- Consistent loading, empty, error, and success states.
- Confirmation before destructive actions.
- Toast notifications for API operations.
- A cool-neutral visual system with accessible status colors.
- Feature-specific layouts where the data benefits from a different presentation.

## 20. Available Scripts

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

## 21. Production Build

Run:

```bash
npm run build
```

The optimized application is generated in:

```text
dist/
```

Set the correct `VITE_API_URL` before building for a non-local environment.

## 22. Current Scope

Completed frontend modules:

- Authentication and session handling
- Dashboard
- Users
- Roles and permissions
- Audit logs
- Products and categories
- Product CSV import
- Warehouses

The Inventory backend currently supports stock levels, movement history, manual adjustments, and low-stock alerts. The Inventory frontend has not been implemented yet.

Future frontend modules include:

- Inventory
- Suppliers
- Customers
- Purchasing
- Sales
- Accounting
- Reports

## 23. Quality Checks

Verify the production build before considering a frontend feature complete:

```bash
npm run build
```

The current application build completes successfully with all implemented modules.
