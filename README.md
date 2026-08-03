# Mini ERP Frontend

A modern, permission-aware frontend for the Mini ERP system. The application is built with React and JavaScript and connects to the FastAPI backend through a centralized API client.

## Current Features

- JWT authentication with access and refresh tokens
- Automatic token refresh and session expiration handling
- Permission-based navigation and page access
- Responsive application shell with desktop and mobile navigation
- User management
  - Search and server-side pagination
  - Create and update users
  - Assign roles
  - Reset passwords
  - Deactivate accounts
- Role and permission management
  - Create and update roles
  - Assign permissions
  - Deactivate roles
- Audit log viewer with filters and record details
- Product catalog
  - Search by product name, SKU, or barcode
  - Filter by category and active status
  - Server-side pagination
  - Create, update, and deactivate products
  - CSV bulk import
- Hierarchical category management
- Warehouse management with search, status filters, pagination, and role-aware actions
- Loading, empty, error, and confirmation states
- Toast notifications for successful and failed operations

## Technology Stack

- React 19
- JavaScript (ES modules)
- Vite 8
- Tailwind CSS 4
- shadcn-style reusable UI components
- Radix UI primitives
- TanStack Query
- React Hook Form and Zod
- Lucide React icons
- Sonner notifications

## Requirements

Before running the frontend, make sure the following are installed:

- Node.js 20 or later
- npm
- The Mini ERP backend running on `http://localhost:8000`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the backend URL

Copy the example environment file:

```bash
cp .env.example .env
```

The default configuration is:

```env
VITE_API_URL=http://localhost:8000
```

Change this value if the backend runs on a different host or port.

### 3. Start the development server

```bash
npm run dev
```

Vite will print the local application URL, usually:

```text
http://localhost:5173
```

### 4. Sign in

The default development administrator account is:

```text
Username: admin
Password: Passw0rd!
```

These credentials are intended for local development only.

## Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Create an optimized production build |
| `npm run preview` | Preview the production build locally |

## Project Structure

```text
src/
├── app/
│   ├── app.jsx                 # Application entry and page authorization
│   └── navigation.js          # Permission-aware navigation configuration
├── components/
│   ├── auth/                  # Shared authorization components
│   ├── layout/                # Application shell and navigation
│   └── ui/                    # Reusable shadcn-style UI components
├── features/
│   ├── audit/                 # Audit log API and interface
│   ├── auth/                  # Authentication API, provider, and login page
│   ├── dashboard/             # Role-aware overview page
│   ├── products/              # Products, categories, dialogs, and API calls
│   ├── roles/                 # Roles and permissions management
│   ├── users/                 # User management
│   └── warehouses/            # Warehouse management
├── lib/
│   └── utils.js               # Shared utility functions
├── shared/
│   ├── api/                   # Centralized API client
│   └── permissions/           # Permission constants and access helpers
├── styles/
│   └── globals.css            # Global theme and responsive styles
└── main.jsx                   # React bootstrap file
```

## Architecture

The application uses a simple feature-based architecture:

- Each business feature owns its pages, dialogs, and API functions.
- Shared UI primitives live in `src/components/ui`.
- Authentication state is managed by `AuthProvider`.
- Server state and cache invalidation are managed by TanStack Query.
- API requests pass through one client that handles bearer tokens, token refresh, and standard errors.
- Page visibility and management actions are controlled by backend permission codes.

The frontend hides unauthorized actions for usability, while the backend remains responsible for enforcing security.

## Permissions

The implemented frontend permissions are:

| Permission          | Frontend access                                                |
| ------------------- | -------------------------------------------------------------- |
| `users.manage`      | User management                                                |
| `roles.manage`      | Role and permission management                                 |
| `audit.read`        | Audit log access                                               |
| `products.read`     | View products and categories                                   |
| `products.manage`   | Create, update, deactivate, and import products and categories |
| `warehouses.read`   | View and search warehouses                                     |
| `warehouses.manage` | Create, update, and deactivate warehouses                      |

The current product access matrix is:

| Role               | View products | Manage products |
| ------------------ | ------------: | --------------: |
| Admin              |           Yes |             Yes |
| Purchasing Officer |           Yes |             Yes |
| Sales Officer      |           Yes |              No |
| Warehouse Keeper   |           Yes |              No |
| Accountant         |           Yes |              No |
| Manager            |           Yes |              No |

Permissions can be changed by an authorized administrator from the Roles & Permissions page.

## Product CSV Import

Product imports accept a UTF-8 CSV file. Example:

```csv
sku,name,barcode,category_id,cost_price,sale_price,min_stock_level
LAP-001,Business Laptop,123456789,1,500.00,650.00,5.00
MOU-001,Wireless Mouse,987654321,2,12.00,20.00,10.00
```

Required columns:

- `sku`
- `name`

Optional columns are validated by the backend. Invalid rows are reported without preventing valid rows from being imported.

## Authentication Flow

1. The user signs in with a username/email and password.
2. The backend returns an access token, refresh token, and user profile.
3. Tokens are stored in local storage for the current implementation.
4. The API client adds the access token to protected requests.
5. When an access token expires, the client attempts one refresh automatically.
6. If refresh fails, the session is cleared and the login page is displayed.

## Production Build

Create the production bundle:

```bash
npm run build
```

The optimized files are generated in the `dist` directory. Configure the production environment with the correct `VITE_API_URL` before building.

## Backend Dependency

This repository contains the frontend only. It requires the Mini ERP FastAPI backend for authentication, permissions, users, roles, audit logs, products, categories, and warehouses.

The backend should allow the frontend origin through its CORS configuration.

## Language and UI

- Application content and code are written in English.
- The interface is responsive and supports common desktop and mobile widths.
- The current visual system uses a cool-neutral palette with accessible status colors.

## Current Scope

The completed frontend modules are:

- Authentication
- Dashboard
- Users
- Roles and permissions
- Audit logs
- Products and categories
- Warehouses

Inventory, suppliers, customers, purchasing, sales, accounting, and reports will be added as their backend features are completed.
