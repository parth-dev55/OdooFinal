# Backend Work Log

Date: 2026-09-05
Project: Urban Furniture Accounting ERP

## Completed

### Phase 5 — Analytic account and budget integration

- Added an optional `analytic_account_id` foreign key and index to journal
  entry lines.
- Added optional `analyticAccountId` support to journal-entry line requests,
  while preserving the existing four-argument constructor/API usage.
- Validated that linked analytic accounts exist and are active.
- Preserved analytic linkage when draft entries are updated or posted entries
  are reversed.
- Included analytic account identifiers in journal-entry responses.
- Added `BudgetActualService`, which derives budget actuals from POSTED journal
  lines within the budget period using `debit - credit`.
- Excluded draft and reversed entries by querying only POSTED entries.
- Preserved legacy manually stored actuals as a compatibility fallback when no
  analytic journal lines exist.
- Updated budget APIs and budget reports to use derived actuals when available.
- Added tests for derived actuals and legacy fallback behavior.

Schema change (managed by current Hibernate `ddl-auto=update` configuration):

```text
journal_entry_lines.analytic_account_id
FK fk_journal_entry_line_analytic_account
INDEX idx_journal_entry_lines_analytic
```

### Phase 6 — Balance sheet and P&L reporting

- Changed balance-sheet data selection to include all POSTED entries through
  the requested end date, making it an as-of-date report rather than a
  date-range report.
- Added repository support for posted journal entries through an as-of date.
- Retained the existing date aliases and response shape for compatibility;
  `endDate`/`to`/`asOf` is the balance-sheet cutoff.
- Corrected P&L `netResult` to equal the calculated net profit instead of the
  total credit-minus-debit across all journal lines.
- Kept P&L period filtering and POSTED-entry filtering unchanged.
- Added tests for cumulative balance-sheet behavior and P&L net result.

### Phase 7 — Payment model consolidation

- Made `payment.Payment` the canonical payment entity for customer receipts
  and vendor payments.
- Added the legacy sales-payment fields to `Payment`: payment number,
  counterparty, party type, creator, and creation timestamp.
- Migrated `SalesService` customer-payment creation and history to
  `PaymentRepository`.
- Preserved `/api/sales/payments`, `/api/sales/payments`, and
  `/api/payments` behavior while making sales payments visible through the
  canonical payment history API.
- Removed the duplicate `SalesCustomerPayment` entity and repository.
- Preserved the existing `payments` table; no table or data deletion was
  performed.
- Added an integration assertion that sales customer payments are returned by
  `/api/payments` with `CUSTOMER_RECEIPT`.

Production migration note:

```text
The existing production payments table may contain legacy NOT NULL constraints
for party_id and created_by. A versioned migration to reconcile those
constraints and backfill legacy rows is intentionally deferred to Phase 10.
```

### Database connection

- Configured Spring Boot JPA to use MySQL in `src/main/resources/application.properties`.
- Added environment-based connection settings:
  - `DB_URL`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `DB_POOL_SIZE`
  - `DB_POOL_MIN_IDLE`
- Configured the MySQL JDBC driver and HikariCP pool.
- Enabled Hibernate schema updates with `spring.jpa.hibernate.ddl-auto=update`.
- Added MySQL database creation and startup instructions to the root `README.md`.
- Added database variables to the root `.env.example`.
- Test configuration remains isolated on an in-memory H2 database with `create-drop`.
- Added `GET /api/health/db`, which executes `SELECT 1` and returns `UP` or
  `DOWN` without exposing credentials.
- Added configurable CORS for the Vite development origins.
- Disabled CSRF checks only for `/api/**`, which is required for REST clients;
  endpoint authentication remains enabled.

### Backend startup fixes

- Set the backend Maven Java target to Java 17, matching the installed JDK.
- Added an explicit `payment_type` column mapping to the legacy `Payment` entity.
- Corrected the Spring Data query from `findByInvoiceId...` to
  `findByCustomerInvoice_Id...` for `SalesCustomerPayment`.

### Existing backend features verified

- Contact CRUD and deactivate endpoints.
- Product CRUD, pagination, and deactivate endpoints.
- User CRUD and deactivate endpoints.
- Journal entry create/list/detail endpoints.
- Sales order, confirmation, cancellation, invoice, and customer payment endpoints.
- Vendor/customer payment endpoints.
- Global validation, not-found, duplicate, accounting validation, and database error handling.
- Health endpoint: `GET /api/health`.
- Added a non-destructive startup check in `DemoApplication` that runs
  `SELECT 1` and logs all discovered `@Service` beans.
- Ordered the startup database/service verification before later runners.
- Startup database failures now stop startup with a clear
  `Database connection check failed` message.
- Removed the previously exposed database password from `.env.example`.

## Verification

Command:

```powershell
$env:JAVA_HOME = "C:\Users\Sneha\AppData\Local\Java\jdk-17"
.\backend\mvnw.cmd -f backend\pom.xml test -q
```

Result:

```text
BUILD SUCCESS
Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
```

The complete Maven test output is available at:

```text
backend\target\backend-test.log
```

Tests currently use H2. A live MySQL connection has not been tested because no
MySQL server credentials were provided in this environment.

The startup check discovered 10 services:

```text
accountingService
balanceSheetReportService
budgetReportService
contactService
ledgerService
paymentService
productService
profitAndLossReportService
salesService
userService
```

## Phase 2 database/configuration validation

- Main runtime profile targets MySQL through environment-based credentials.
- Test profile targets isolated in-memory H2 with `create-drop`.
- Clean test result: 10 tests passed, 0 failures.
- Live MySQL verification remains dependent on supplying valid local MySQL
  credentials through `DB_PASSWORD`.

## Phase 3 purchase module

Implemented:

- Purchase order and purchase order item persistence.
- Vendor bill and vendor bill item persistence.
- Vendor, product, and creating-user foreign-key relationships.
- Draft, approved, billed, received, and cancelled purchase order statuses.
- Purchase order creation with quantity, price, tax, and total calculation.
- Purchase order approval and cancellation endpoints.
- Vendor bill creation from an approved purchase order.
- Outstanding vendor bill balance compatible with the existing payment service.
- Purchase order and vendor bill retrieval endpoints.

Endpoints:

```text
POST /api/purchases/orders
GET  /api/purchases/orders
GET  /api/purchases/orders/{id}
POST /api/purchases/orders/{id}/approve
POST /api/purchases/orders/{id}/cancel
POST /api/purchases/bills
GET  /api/purchases/bills
GET  /api/purchases/bills/{id}
```

Purchase integration tests cover order creation, totals, approval, bill
creation, persistence, and invalid bill dates. Full test suite result:
12 tests passed, 0 failures.

## Phase 4 inventory module

Implemented an auditable stock-movement ledger instead of adding a duplicate
stock quantity column to `Product`.

Features:

- Purchase, sale, return, adjustment, and transfer movement types.
- Product validation and inactive-product protection.
- Signed stock movement storage.
- No-negative-stock enforcement.
- Movement history filtered by product.
- Current stock summary calculated from persisted movements.
- Reference, source, destination, notes, and movement timestamp support.

Endpoints:

```text
POST /api/inventory/movements
GET  /api/inventory/movements
GET  /api/inventory/movements?productId={id}
GET  /api/inventory/products/{id}/summary
```

Inventory integration tests cover stock increases, stock decreases, summary
calculation, and insufficient-stock rejection. Full test suite result:
13 tests passed, 0 failures.

## Phase 5 budget module

Implemented:

- Analytic account creation and listing.
- Budget creation, retrieval, listing, and update.
- Budget start/end period validation.
- Planned and actual amounts using `BigDecimal`.
- Remaining amount calculation.
- Draft, active, and closed budget statuses.
- Budget close endpoint.
- Foreign-key relationship from budgets to analytic accounts.

Endpoints:

```text
POST /api/budgets/analytic-accounts
GET  /api/budgets/analytic-accounts
POST /api/budgets
GET  /api/budgets
GET  /api/budgets/{id}
PUT  /api/budgets/{id}
POST /api/budgets/{id}/close
```

Actual amounts are currently explicitly maintained through the budget update
API; automatic accounting-derived actuals were not invented because the
existing accounting model has no analytic-account linkage.

Budget integration tests cover creation, remaining amount calculation, status
updates, closing, and invalid periods. Full test suite result:
15 tests passed, 0 failures.

## Phase 6 reports APIs

Implemented report DTOs, services, and controller endpoints:

```text
GET /api/reports/balance-sheet?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/profit-loss?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/budget?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

Balance sheet and profit/loss reports aggregate posted journal entries by
account and return debit, credit, and net totals. The current accounting model
does not classify accounts as assets, liabilities, equity, income, or expense,
so the reports do not fabricate those classifications.

Budget reports return overlapping budgets with planned, actual, and remaining
amounts. Invalid date ranges return a client error. Full test suite result:
17 tests passed, 0 failures.

## Phase 7 console Factory Pattern

Added:

- `ConsoleMenu` interface.
- Spring-discovered `MenuFactory`.
- `MainConsoleRunner` with invalid-input and exception handling.
- Menus for accounting, contacts, products, sales, payments, users, purchase,
  inventory, budget, and reports.
- `app.console.enabled=false` by default so tests and normal REST startup never
  block on console input.
- `APP_CONSOLE_ENABLED` environment configuration.

The menus call existing service read methods and do not duplicate business
logic. Factory tests verify dynamic menu discovery, case-insensitive lookup,
and unknown-menu rejection. Full test suite result:
19 tests passed, 0 failures.

The local MySQL server is listening on port 3306, but the configured `root`
account rejected a connection without a password. Set `DB_PASSWORD` before
starting the backend and verify:

```text
GET http://localhost:8080/api/health/db
```

## Phase 8 integration validation

Implemented transactional inventory integration at the existing business
operation boundaries:

- Added `POST /api/purchases/orders/{id}/receive`.
- Receiving an approved purchase order records one `PURCHASE` stock movement
  per order line and changes the order status to `RECEIVED`.
- Vendor bills can be created from approved or received purchase orders.
- Sales invoicing records one `SALE` stock movement per invoice line.
- Existing inventory validation prevents inactive products and insufficient
  stock; a failed movement rolls back the surrounding purchase or sales
  transaction.
- Duplicate vendor bills and duplicate sales invoices remain rejected.

Added end-to-end tests for purchase receipt stock increases and sales invoice
stock decreases. Full Maven suite result: 21 tests passed, 0 failures.

## Phase 9 final verification

- `mvn clean compile`: passed.
- `mvn test`: passed.
- Full automated suite: 21 tests passed, 0 failures, 0 errors.
- Spring Boot test contexts started successfully with database verification
  and service discovery enabled.
- Automated validation uses isolated H2; live MySQL startup still requires
  valid `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` values.

## Entity mapping and JDBC connection work

- Validated all 20 JPA entities, their tables, keys, enum mappings, financial
  types, and relationships.
- Added explicit foreign-key names to the sales customer payment mappings.
- Added `database.DBConnection`, a Spring-managed utility that reuses the
  configured datasource properties and opens direct connections with
  `DriverManager`.
- Added safe connection validation with try-with-resources and non-sensitive
  error logging.
- Added an H2-backed `DBConnectionTest` covering connection validity and
  resource closure.
- The existing `Payment` and `SalesCustomerPayment` entities intentionally
  remain mapped to the legacy shared `payments` table; separating them would
  require a data migration decision.

## Phase 1 chart of accounts

Implemented the existing `Account` module without replacing its entity or
repository:

- Added `AccountType`: `ASSET`, `LIABILITY`, `EXPENSE`, `INCOME`, and `CAPITAL`.
- Added the account type column in a backward-compatible form so Hibernate
  schema updates do not fail on legacy account rows; new API requests still
  require an account type.
- Added validated account create, update, and response DTOs.
- Added transactional account CRUD and archive service operations.
- Added case-insensitive duplicate account-code checks.
- Added the required `/api/accounts` endpoints:

```text
POST  /api/accounts
GET   /api/accounts
GET   /api/accounts/{id}
PUT   /api/accounts/{id}
PATCH /api/accounts/{id}/archive
```

- Added unit tests for creation, code normalization, duplicate detection,
  update, archive, and missing-account handling.
- Full Maven suite result: 28 tests passed, 0 failures, 0 errors.

## Phase 2 journal master

Implemented the existing `Journal` module:

- Added `JournalType`: `SALES`, `PURCHASE`, `BANK`, `CASH`, and `GENERAL`.
- Added optional default debit and credit account relationships.
- Added validated journal create, update, and response DTOs.
- Added transactional journal CRUD and archive service operations.
- Added active-account validation for configured default accounts.
- Added case-insensitive duplicate journal-name checks.
- Added the required `/api/journals` endpoints:

```text
POST  /api/journals
GET   /api/journals
GET   /api/journals/{id}
PUT   /api/journals/{id}
PATCH /api/journals/{id}/archive
```

- Added unit tests for creation, default-account configuration, duplicate
  names, inactive accounts, update, and archive.
- Full Maven suite result: 32 tests passed, 0 failures, 0 errors.

## Phase 3 journal entry validation

Strengthened the existing `AccountingService`:

- Preserved balanced-entry validation.
- Preserved the minimum two-line rule.
- Preserved nonnegative debit/credit validation.
- Preserved the one-sided line rule and active-account validation.
- Added duplicate protection for posted journal entries using their normalized
  business reference.
- Added tests for duplicate posted references and inactive accounts.
- Full Maven suite result: 34 tests passed, 0 failures, 0 errors.

## Phase 8 budget and analytic reporting

Added consistent budget variance metrics:

- Added `variance` to budget responses and budget report lines.
- Added `variancePercentage` using:
  `((plannedAmount - actualAmount) / plannedAmount) * 100`.
- Zero planned amounts return `0.00%` without division by zero.
- Centralized the calculation in `BudgetCalculation`.
- Preserved the existing manually maintained actual-amount model because
  analytic-account linkage to journal lines is not yet available.
- Added unit and integration coverage for variance and zero-value handling.
- Full Maven suite result: 36 tests passed, 0 failures, 0 errors.

## Phase 9 classified financial reports

Updated posted-entry reports to use the `AccountType` classification:

- Account detail rows now include their account type.
- Balance sheet reports now expose:
  - Assets
  - Liabilities
  - Capital
  - Current-period profit
  - Accounting-equation validation
- Profit and loss reports now expose:
  - Income
  - Expenses
  - Net profit
- Asset balances use debit minus credit; liability, capital, and income
  balances use credit minus debit; expense balances use debit minus credit.
- Legacy accounts without a type remain visible in detail rows but are not
  silently classified.
- Added classification and accounting-equation tests.
- Full Maven suite result: 38 tests passed, 0 failures, 0 errors.

## Phase 10 RBAC and contact ownership security

Implemented backend authorization and ownership enforcement:

- Added the `CONTACT_USER` role while retaining `CUSTOMER` compatibility.
- Firebase role claims now normalize to supported roles; legacy `CUSTOMER`
  claims map to `CONTACT_USER`.
- Added an optional `User` to `Contact` relationship and user API support for
  `contactId`.
- Restricted administrative and business-management endpoints to `ADMIN` and
  `ACCOUNTANT`.
- Allowed contact users to access only invoice, bill, and payment surfaces
  intended for them.
- Added service-layer ownership checks for customer invoices, vendor bills,
  and customer payments.
- Added explicit `403 Forbidden` handling for ownership failures.
- Added RBAC and ownership unit/integration tests.
- Full Maven suite result: 42 tests passed, 0 failures, 0 errors.

## Phase 12 final backend verification

- Clean Maven test run passed.
- Full suite: 42 tests passed, 0 failures, 0 errors.
- Spring contexts initialized successfully with H2 database verification,
  JDBC verification, and service discovery.
- Production package build passed with tests skipped after the clean test run.
- Generated artifact:
  `backend/target/demo-0.0.1-SNAPSHOT.jar`.

## Phase 11 database and code quality hardening

Applied non-destructive hardening:

- Mapped service-level `IllegalArgumentException` failures to HTTP 400
  validation responses instead of generic server errors.
- Added targeted indexes for:
  - Posted journal-entry status/date and reference lookups.
  - Journal-entry account and parent-entry lookups.
  - Stock product/date and related-transaction idempotency lookups.
- Kept the shared payment table unchanged pending a reviewed migration.
- Full Maven suite result: 42 tests passed, 0 failures, 0 errors.

## Phase 7 inventory idempotency and transaction references

Improved the existing stock-movement ledger without changing its movement
type enum:

- Added optional `relatedTransactionType` and `relatedTransactionId` fields
  to stock movement requests, entities, and responses.
- Purchase receipts now record their purchase-order relationship.
- Sales stock issues now record their customer-invoice relationship.
- Added service-level duplicate detection per product, movement type, and
  related transaction.
- Preserved compatibility for existing inventory requests without related
  transaction fields.
- Added integration coverage for duplicate related stock movements.
- Full Maven suite result: 34 tests passed, 0 failures, 0 errors.

## Phase 6 payment cleanup and accounting integration

Handled the duplicate payment implementations conservatively:

- Preserved `Payment` and `SalesCustomerPayment` entities and existing APIs
  because both map to the legacy `payments` table and require a reviewed
  migration before consolidation.
- Updated the legacy sales customer-payment flow to create its own balanced
  posted journal entry instead of accepting an externally prepared entry.
- Sales payments now resolve an active `CASH` or `BANK` journal and use its
  configured default debit and credit accounts.
- Added optional `journalId` support to the sales payment request; the
  existing `journalEntryId` field remains accepted for compatibility.
- Added positive amount validation and consistent accounting validation errors.
- Added integration coverage for invoice partial payment and payment posting.
- Full Maven suite result: 34 tests passed, 0 failures, 0 errors.

## Phase 5 sales accounting flow

Integrated customer-invoice posting with the existing sales transaction:

- Added optional `journalId` support to invoice requests.
- If omitted, the first active `SALES` journal is selected.
- Customer invoices require configured active default debit and credit accounts.
- Invoice creation posts a balanced `POSTED` journal entry atomically:

```text
Debit  Sales journal default debit account
Credit Sales journal default credit account
```

- The invoice number is used as the journal-entry reference for duplicate
  posting protection.
- Existing sales order confirmation, stock validation, stock reduction, and
  duplicate-invoice checks remain intact.
- Sales integration coverage now configures a sales journal and verifies the
  generated journal entry.
- Full Maven suite result: 34 tests passed, 0 failures, 0 errors.

## Phase 4 purchase accounting flow

Integrated vendor-bill posting with the existing purchase transaction:

- Added an optional `journalId` to vendor-bill requests.
- If omitted, the first active `PURCHASE` journal is selected.
- Vendor bills require configured active default debit and credit accounts.
- Bill creation posts a balanced `POSTED` journal entry atomically:

```text
Debit  Purchase journal default debit account
Credit Purchase journal default credit account
```

- The bill number is used as the journal-entry reference for duplicate-posting
  protection.
- Existing duplicate vendor-bill prevention, purchase status validation, and
  inventory receipt behavior remain intact.
- Purchase integration coverage now configures a purchase journal and verifies
  the generated journal entry.
- Full Maven suite result: 34 tests passed, 0 failures, 0 errors.

## JDBC database inspector

- Added `database.DatabaseInspector`.
- Uses `DatabaseMetaData` through `DBConnection` and `DriverManager`.
- Supports table listing, table existence checks, column metadata, primary-key
  inspection, and imported-foreign-key inspection.
- Added H2 integration coverage for Hibernate-created tables and relationships.
- No manual table creation or destructive SQL is performed.

## Startup database verification

- Extended the existing ordered startup runner instead of adding a duplicate
  runner.
- Startup now verifies the Spring/JPA connection, direct DriverManager
  connection, expected Hibernate tables, and discovered services.
- Missing expected tables fail startup with an actionable error.
- Startup logs report JDBC success, Hibernate table verification success, total
  metadata tables discovered, and service discovery.

## Final database verification

- `mvn clean compile`: passed.

## Phase 13 account ledger queries

Implemented posted account-ledger retrieval:

- Added `GET /api/ledger/accounts/{accountId}` with required `startDate` and
  `endDate` query parameters.
- Ledger results include account identity/type, date range, debit and credit
  totals, net balance, journal-entry metadata, and line descriptions.
- Only `POSTED` journal entries within the inclusive date range are included.
- Invalid date ranges return a business validation error.
- Missing accounts return a not-found error.
- Ledger access is restricted to `ADMIN` and `ACCOUNTANT`.
- Added unit coverage for aggregation, posted-entry filtering, date validation,
  and missing-account handling.
- Full Maven suite result: 46 tests passed, 0 failures, 0 errors.

## Phase 14 report date compatibility

Added compatible date aliases to balance-sheet, profit-loss, and budget
reports:

- Existing `startDate` and `endDate` parameters remain supported.
- `from` and `to` can be used as equivalent range parameters.
- `asOf` can be used for a single-day report range.
- Requests without a complete date range now return a clear client error.
- Added integration coverage for aliases and missing-date validation.
- Full Maven suite result: 48 tests passed, 0 failures, 0 errors.

## Phase 1 tax system

Implemented server-side tax configuration and calculation without changing
the later accounting-posting phase:

- Added `TaxConfiguration` with active status, tax type, rate, and timestamps.
- Added `SALES_TAX` and `PURCHASE_TAX` tax types.
- Added tax configuration CRUD and deactivate endpoints under
  `/api/tax-configurations`.
- Added optional sales and purchase tax relationships to products.
- Product responses now expose the configured tax IDs.
- Added server-side subtotal, tax, and total calculation using
  `BigDecimal` and `HALF_UP` rounding at two decimal places.
- Existing client `taxAmount` fields remain accepted for compatibility but
  are ignored as calculation sources.
- Missing product tax configuration means zero tax.
- Inactive or wrong-type product tax configurations are rejected.
- Sales orders and purchase orders now persist server-calculated tax amounts
  and totals; invoices and vendor bills inherit those calculated values.
- Tax-account journal posting is intentionally deferred to Phase 2.
- Hibernate discovered 35 tables after the new tax table was added.
- Full Maven suite result: 56 tests passed, 0 failures, 0 errors.

## Phase 2 accounting configuration and posting rules

Added business-aware tax posting while preserving existing payment and
inventory behavior:

- Tax configurations can now reference an optional Chart of Accounts tax
  account.
- Sales tax accounts must be liability accounts when classified.
- Purchase tax accounts must be asset accounts when classified.
- Added dedicated `SalesPostingService` and `PurchasePostingService`.
- Customer invoice postings now use:

```text
Debit  Receivable       total
Credit Revenue          subtotal
Credit Sales tax        tax
```

- Vendor bill postings now use:

```text
Debit  Purchase/Expense subtotal
Debit  Input tax        tax
Credit Payable          total
```

- Multiple tax configurations on one document are aggregated by tax account.
- Missing, inactive, or invalid tax accounts are rejected before posting.
- Existing zero-tax two-line postings remain unchanged.
- Existing payment posting logic remains unchanged.
- Full Maven suite result: 58 tests passed, 0 failures, 0 errors.

## Phase 3 journal entry lifecycle and integrity

Implemented journal-entry lifecycle controls:

- Added `REVERSED` journal-entry status.
- Draft entries can be updated through `PUT /api/journal-entries/{id}`.
- Draft entries can be posted through
  `POST /api/journal-entries/{id}/post`.
- Posted entries cannot be edited or reposted.
- Posted entries can be reversed through
  `POST /api/journal-entries/{id}/reverse`.
- Reversal creates a balanced opposite posted entry and marks the original
  entry as `REVERSED`.
- Existing balanced-entry, line validation, active-account, and duplicate
  reference rules remain centralized in `AccountingService`.
- Reports continue to include only `POSTED` entries.
- Full Maven suite result: 62 tests passed, 0 failures, 0 errors.

## Phase 4 inventory valuation

Added minimum safe weighted-average inventory valuation:

- Stock movements now support nullable `unitCost` and signed `totalCost`.
- Purchase receipts use the purchase-order unit price as movement cost.
- Outbound movements use the current weighted-average cost.
- Positive adjustments use the supplied unit cost or product purchase price.
- Inventory summaries now expose:
  - quantity
  - inventory value
  - average cost
- Existing quantity validation, negative-stock protection, movement history,
  and idempotency behavior remain intact.
- Existing movements without cost values remain readable and contribute zero
  historical value for compatibility.
- COGS and inventory journal posting are deferred because inventory, COGS,
  and valuation accounts are not yet part of the accounting configuration.
- Full Maven suite result: 63 tests passed, 0 failures, 0 errors.
- `mvn test`: passed with 23 tests, 0 failures, and 0 errors.
- Live `mvn spring-boot:run` successfully connected to MySQL 8.0.44.
- Hibernate initialized successfully using MySQL and verified 19 application
  tables.
- DriverManager JDBC verification succeeded against the same MySQL database.
- Database metadata inspection and service discovery completed successfully.
- The application started on port 8080 with console mode disabled.
- The live test process was stopped after startup verification.
- Hibernate emitted only a non-blocking warning that explicit `MySQLDialect`
  configuration is unnecessary in the current Hibernate version.

## Remaining backend work

### 1. Complete authentication

- Add Firebase Admin SDK to the backend.
- Verify Firebase bearer tokens in a Spring Security filter.
- Map the Firebase UID to the local `User` record.
- Implement the frontend-required endpoints:
  - `GET /api/auth/me`
  - `POST /api/auth/profile`
- Replace Spring Security's generated development user with application authentication.
- Add role-based authorization for admin, accountant, and contact users.

### 2. Connect and validate real MySQL

- Create the `urban_furniture_erp` database.
- Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
- Start the backend and verify Hibernate creates all tables.
- Validate foreign keys, indexes, unique constraints, and enum column compatibility.
- Replace `ddl-auto=update` with versioned Flyway or Liquibase migrations before production.

### 3. Finish API coverage

- Add dashboard summary endpoints required by the frontend.

### 4. Frontend/backend integration

- Connect contacts, products, sales, invoices, payments, journals, budgets, and reports pages to the REST API.
- Configure backend CORS for the Vite development origin and production frontend origin.
- Replace placeholder auth profile behavior after Firebase token verification is available.
- Standardize API error response handling on the frontend.

### 5. Testing and production hardening

- Add integration tests for the complete sales-to-payment-to-journal flow.
- Add purchase-to-bill-to-payment tests.
- Add broader report calculation tests with classified account metadata once
  the accounting model supports account types.
- Add a MySQL integration profile using Testcontainers or a dedicated CI database.
- Add pagination/filtering limits to collection endpoints.
- Add structured logging, request correlation IDs, and database migration checks.
- Move credentials to deployment secret storage and remove default production credentials.

## Production-readiness follow-up

- Added optional Firebase Admin authentication controlled by `FIREBASE_ENABLED`.
- Added Firebase bearer-token verification and profile endpoints: `GET /api/auth/me` and `POST /api/auth/profile`.
- Added `GET /api/dashboard/summary` for master-data counts, transaction counts, receivables, payables, and signed inventory quantity.
- Removed the exposed database password from `.env.example`.
- Documented Firebase service-account environment configuration in `README.md`.
- The frontend production build passes. The current frontend contains authentication and a landing-page dashboard preview, but no implemented domain dashboard pages or CRUD service clients beyond authentication.
- Flyway/Liquibase was not introduced automatically because the existing database requires a baseline migration review before enabling production migrations.

## Schema migration assessment

- MySQL client tooling is installed, but no reusable non-interactive credential source is configured in the shell.
- The live schema is already managed by Hibernate and contains existing data.
- A Flyway/Liquibase baseline was not enabled automatically because generating or applying an unreviewed baseline could alter production schema behavior.
- Migration tooling should be enabled only after capturing and reviewing a schema-only dump from the target database.
