


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7823b315-16df-47e7-bedf-b4b776815e87

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# OdooFinal
We are here to win
![Uploading image.png…]()

## Backend database setup

The backend uses Spring Boot JPA with MySQL. Create the database once, then set
`DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in the backend process environment
before starting the application:

```sql
CREATE DATABASE urban_furniture_erp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/urban_furniture_erp?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-mysql-password"
.\backend\mvnw.cmd -f backend\pom.xml spring-boot:run
```

For Firebase bearer-token verification, configure the backend separately:

```powershell
$env:FIREBASE_ENABLED = "true"
$env:FIREBASE_PROJECT_ID = "your-firebase-project-id"
$env:FIREBASE_SERVICE_ACCOUNT_JSON = (Get-Content .\firebase-service-account.json -Raw)
```

Never commit the service-account JSON or database password. When Firebase is
disabled, the backend retains its development Spring Security authentication;
when enabled, Firebase bearer tokens are verified and `/api/auth/me` plus
`/api/auth/profile` are available for the frontend.

On startup, Hibernate uses `spring.jpa.hibernate.ddl-auto=update` to create or
update the entity tables. Do not commit real database credentials.

SCREEN :

/login
/dashboard
/contacts
/products
/accounts
/journals
/purchases
/sales
/invoices
/bills
/payments
/budgets
/reports

PHASE 2 — Backend API ready hote hi

Tum frontend ko connect karoge:

Next.js
    ↓
REST API
    ↓
Spring Boot
    ↓
PostgreSQL


Example:

Products Page
     ↓
GET /api/products
     ↓
Spring Boot
     ↓
PostgreSQL
     ↓
Products JSON
     ↓
Next.js Table

PHASE 3 — Sabse pehle integration kiski?

Dashboard se start mat karna.

Pehle ye golden demo flow working karo:

1. Login
   ↓
2. Create Contact
   ↓
3. Create Product
   ↓
4. Create Sales Order
   ↓
5. Generate Customer Invoice
   ↓
6. Record Payment
   ↓
7. Generate Journal Entry
   ↓
8. Update Ledger
   ↓
9. P&L / Balance Sheet


Uske baad:
Purchase Flow
      ↓
Budget
      ↓
Stock
      ↓
Reports
      ↓
UI Polish


🏆 Tumhare next 3 hours ka order
NOW
 ↓
3 members → Database schema + migrations
 ↓
You → Google AI Studio → Complete UI
 ↓
Database/API contract finalize
 ↓
Spring Boot endpoints
 ↓
Frontend API integration
 ↓
Sales end-to-end flow
 ↓
Purchase flow
 ↓
Accounting engine
 ↓
Reports

Frontend:
Forms
Tables
Buttons
Filters
Dashboard
Charts
Reports UI
Validation messages
Backend:
Authentication
Permissions
Tax calculation
Debit/Credit
Ledger updates
Stock updates
Journal creation
Report calculations
Database

                    PROBLEM
                       ↓
    Accounting process ko end-to-end
    accurately manage karna
                       ↓
              WHO HAS PROBLEM?
                       ↓
      Business Owner + Accountant
          + Customers/Contacts
                       ↓
                 WHY?
                       ↓
   Sales, purchases, payments, taxes,
   ledgers aur reports interconnected hain
                       ↓
            WHO WILL USE IT?
                       ↓
       Admin / Accountant / Contact
                       ↓
        WHAT ARE WE SOLVING?
                       ↓
 Master Data → Transaction → Payment
 → Accounting Entry → Reporting
                       ↓
          UNIQUE SOLUTION
                       ↓
     Integrated Accounting Automation
