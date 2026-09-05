# Urban Furniture Accounting ERP — Frontend & Backend API Contract

This document provides the complete API specification and integration guidelines for connecting the **React + Vite Frontend** with the **Spring Boot (Java 21) + MySQL Backend**.

---

## 1. System Overview & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Authentication** | Firebase Authentication (Email/Password & JWT ID Token) |
| **Backend** | Spring Boot (Java 21), Spring Security, Spring Data JPA |
| **Database** | MySQL (Relational Schema) |
| **Frontend Dev URL** | `http://localhost:3000` |
| **Backend Base URL** | `http://localhost:8080/api` (Configured via `VITE_API_BASE_URL`) |

---

## 2. Authentication & Authorization Flow

Firebase is used **strictly for authentication** (identity & credential management), while **Spring Boot + MySQL** is the sole source of truth for user accounts and roles.

```
                   1. User Login (Email / Password)
  [ User ] ───────────────────────────────────────────────► [ Firebase Auth ]
                                                                   │
                                                                   │ 2. Issues Firebase JWT ID Token
                                                                   ▼
                                                            [ React Frontend ]
                                                                   │
                   3. Protected API Request                        │
                      Header: "Authorization: Bearer <ID_TOKEN>"   ▼
                                                            [ Spring Boot API ]
                                                                   │
                   4. Decode & Verify Token with                   │
                      Firebase Admin SDK (extracts uid/email)      ▼
                                                            [ MySQL Database ]
                                                                   │
                   5. Queries `users` table for Role               │
                      ("ADMIN" | "ACCOUNTANT" | "CONTACT")         ▼
                                                            [ React Frontend ]
                                                                   ├─► ADMIN      → /dashboard (Full ERP View)
                                                                   ├─► ACCOUNTANT → /dashboard (Accounting View)
                                                                   └─► CONTACT    → /contact/dashboard (Portal View)
```

### Authorization Header
All protected API calls automatically include the Firebase ID Token in the request header via `src/services/apiClient.ts`:
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
Content-Type: application/json
```

---

## 3. CORS Configuration Required on Spring Boot

Spring Boot must allow cross-origin requests from the Vite frontend during development:
- **Allowed Origin**: `http://localhost:3000`
- **Allowed Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `Authorization`, `Content-Type`, `Accept`, `Origin`, `X-Requested-With`
- **Allow Credentials**: `true`

---

## 4. Complete API Endpoint Specification

### 4.1. Authentication & Profile
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/auth/me` | Fetch authenticated user profile and assigned role from MySQL | Authenticated (`ADMIN`, `ACCOUNTANT`, `CONTACT`) |
| `POST` | `/auth/profile` | Synchronize new Firebase signup into MySQL `users` table | Authenticated |

#### `GET /auth/me` Response Example:
```json
{
  "id": "USR-1001",
  "firebaseUid": "98JkL09asdf890a8sdf",
  "name": "Jane Doe",
  "email": "jane@urbanfurniture.com",
  "role": "ACCOUNTANT"
}
```

---

### 4.2. Contacts Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/contacts` | List contacts with optional filters (`?search=&type=CUSTOMER/VENDOR/BOTH&status=ACTIVE/INACTIVE`) |
| `GET` | `/contacts/{id}` | Get single contact details |
| `POST` | `/contacts` | Create a new contact |
| `PUT` | `/contacts/{id}` | Update existing contact |
| `PATCH` | `/contacts/{id}/status` | Toggle contact status (`ACTIVE` / `INACTIVE`) |

#### `POST /contacts` Request Body Example:
```json
{
  "name": "Acme Timber Ltd",
  "type": "VENDOR",
  "email": "orders@acmetimber.com",
  "mobile": "+1 (555) 234-5678",
  "address": "100 Industrial Parkway",
  "city": "Portland",
  "state": "Oregon",
  "pincode": "97201",
  "status": "ACTIVE"
}
```

---

### 4.3. Products Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List all inventory / service items |
| `GET` | `/products/{id}` | Get single product details |
| `POST` | `/products` | Create a new product |
| `PUT` | `/products/{id}` | Update existing product |
| `PATCH` | `/products/{id}/status` | Update product status (`ACTIVE` / `INACTIVE`) |

#### `POST /products` Request Body Example:
```json
{
  "name": "Walnut Executive Desk",
  "sku": "DSK-WAL-001",
  "category": "Office Desks",
  "salesPrice": 1250.00,
  "costPrice": 620.00,
  "stockQuantity": 45,
  "unitOfMeasure": "Units",
  "taxRate": 10.0,
  "status": "ACTIVE"
}
```

---

### 4.4. Chart of Accounts Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/accounts` | List all ledger accounts |
| `GET` | `/accounts/{id}` | Get single account with ledger entries |
| `POST` | `/accounts` | Create a new chart of account record |
| `PUT` | `/accounts/{id}` | Update account details |
| `PATCH` | `/accounts/{id}/status` | Toggle account status |

#### Account Types:
`ASSET`, `LIABILITY`, `EQUITY`, `INCOME`, `EXPENSE`

---

### 4.5. Journals Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/journals` | List all financial journals (Sales, Purchase, Bank, Cash, General) |
| `GET` | `/journals/{id}` | Get journal details |
| `POST` | `/journals` | Create journal |
| `PUT` | `/journals/{id}` | Update journal |
| `PATCH` | `/journals/{id}/status` | Toggle status |

---

### 4.6. Sales Orders Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/sales-orders` | List sales orders |
| `GET` | `/sales-orders/{id}` | Get single order |
| `POST` | `/sales-orders` | Create quotation / order |
| `PUT` | `/sales-orders/{id}` | Update order |
| `PATCH` | `/sales-orders/{id}/status` | Update status (`DRAFT`, `CONFIRMED`, `INVOICED`, `CANCELLED`) |
| `POST` | `/sales-orders/{id}/confirm` | Confirm quotation to order |
| `POST` | `/sales-orders/{id}/invoice` | Generate customer invoice from sales order |

---

### 4.7. Purchase Orders Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/purchase-orders` | List purchase orders |
| `GET` | `/purchase-orders/{id}` | Get single order |
| `POST` | `/purchase-orders` | Create vendor order |
| `PUT` | `/purchase-orders/{id}` | Update vendor order |
| `PATCH` | `/purchase-orders/{id}/status` | Update status (`DRAFT`, `CONFIRMED`, `BILLED`, `CANCELLED`) |
| `POST` | `/purchase-orders/{id}/confirm` | Confirm vendor order |
| `POST` | `/purchase-orders/{id}/bill` | Generate vendor bill from purchase order |

---

### 4.8. Customer Invoices Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/invoices` | List invoices (Filtered by customer if `CONTACT` role) |
| `GET` | `/invoices/{id}` | Get single invoice details |
| `POST` | `/invoices` | Create invoice |
| `PUT` | `/invoices/{id}` | Update draft invoice |
| `PATCH` | `/invoices/{id}/status` | Update invoice status |
| `POST` | `/invoices/{id}/post` | Post invoice to general ledger |
| `POST` | `/invoices/{id}/cancel` | Cancel invoice |

---

### 4.9. Vendor Bills Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/bills` | List vendor bills |
| `GET` | `/bills/{id}` | Get single bill details |
| `POST` | `/bills` | Create vendor bill |
| `PUT` | `/bills/{id}` | Update draft bill |
| `PATCH` | `/bills/{id}/status` | Update status |
| `POST` | `/bills/{id}/post` | Post bill to accounts payable ledger |
| `POST` | `/bills/{id}/cancel` | Cancel bill |

---

### 4.10. Payments Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/payments` | List payment records |
| `GET` | `/payments/{id}` | Get single payment details |
| `POST` | `/payments` | Register payment against invoice/bill |

#### `POST /payments` Request Body Example:
```json
{
  "paymentNumber": "PAY-2026-0091",
  "paymentType": "INBOUND",
  "partnerId": "CNT-1002",
  "partnerName": "Urban Living Showroom",
  "invoiceId": "INV-2026-0084",
  "invoiceNumber": "INV-2026-0084",
  "journalId": "JRN-BNK",
  "journalName": "Chase Operating Bank",
  "paymentMethod": "BANK_TRANSFER",
  "amount": 4600.00,
  "paymentDate": "2026-09-05",
  "reference": "WIRE-Ref-9902",
  "notes": "Full settlement for mesh chairs"
}
```

---

### 4.11. Journal Entries (General Ledger) Module
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/journal-entries` | List general journal entries |
| `GET` | `/journal-entries/{id}` | Get journal entry with lines |
| `POST` | `/journal-entries` | Create journal entry (balanced debits and credits) |
| `POST` | `/journal-entries/{id}/post` | Post entry to ledger |
| `POST` | `/journal-entries/{id}/reverse` | Create reversal entry |

---

### 4.12. Budget & Analytic Accounts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytic-accounts` | List cost centers / projects |
| `GET` | `/analytic-accounts/{id}` | Single analytic account details |
| `POST` | `/analytic-accounts` | Create analytic account |
| `PUT` | `/analytic-accounts/{id}` | Update analytic account |
| `GET` | `/budgets` | List budget plans |
| `GET` | `/budgets/{id}` | Single budget with lines & variances |
| `POST` | `/budgets` | Create budget |
| `PUT` | `/budgets/{id}` | Update budget |
| `PATCH` | `/budgets/{id}/status` | Update budget status (`DRAFT`, `CONFIRMED`, `CLOSED`) |

---

### 4.13. Financial Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reports/balance-sheet` | Generate Balance Sheet statement (Assets, Liabilities, Equity) |
| `GET` | `/reports/profit-loss` | Generate P&L statement (Revenue, COGS, Expenses, Net Income) |
| `GET` | `/reports/budget` | Generate Budget vs Actual variance report |

---

### 4.14. Dashboard Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Top-level KPI stats (Sales, Purchases, Expenses, Profit, Receivables, Payables, Cash) |
| `GET` | `/dashboard/recent-transactions` | List of 5-10 latest transaction rows |
| `GET` | `/dashboard/sales-trend` | Monthly sales vs purchase data array |
| `GET` | `/dashboard/expense-breakdown` | Expense categories with aggregate values |
| `GET` | `/dashboard/budget-vs-actual` | Quarterly or monthly budget variance comparison |

---

## 5. Mock Data Locations & Standby Behavior

To provide a seamless developer experience when the Spring Boot backend is offline:
- All services in `src/services/*` use `apiClient` as the primary live bridge.
- If `apiClient` catches a network error (backend unreachable), services utilize isolated mock fallbacks labeled `MOCK / TEMPORARY` and log a diagnostic warning.
- As soon as Spring Boot is launched at `http://localhost:8080/api`, all requests seamlessly transition to MySQL real data.

---

## 6. How to Run Frontend & Backend Locally

1. **Start Spring Boot**:
   ```bash
   mvn spring-boot:run
   # Backend listening on http://localhost:8080
   ```
2. **Start Frontend**:
   ```bash
   npm run dev
   # Vite listening on http://localhost:3000
   ```
3. **Configure Environment**:
   Ensure `.env` in the frontend contains:
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
