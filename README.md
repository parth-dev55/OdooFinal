# 🪑 Urban Furniture — Accounting Management System

> A centralized accounting and business management system for managing contacts, products, purchases, sales, payments, budgets, accounting entries, and financial reports.

---

## 📌 Overview

**Urban Furniture Accounting System** is designed to manage the complete business and accounting lifecycle of a furniture business.

The system connects operational transactions with accounting records and financial reporting.

```text
Master Data
    ↓
Purchase / Sales
    ↓
Orders
    ↓
Invoice / Bill
    ↓
Payment
    ↓
Double-Entry Accounting
    ↓
Financial Reports
```

---

## 🎯 Problem Statement

Furniture businesses need to manage multiple business and financial activities such as:

- Customers and Vendors
- Products
- Purchase Orders
- Sales Orders
- Vendor Bills
- Customer Invoices
- Payments
- Accounting Journals
- Budgets
- Financial Reports

Managing these activities separately can result in:

- Duplicate data
- Manual calculations
- Accounting inconsistencies
- Poor financial visibility
- Difficulty tracking business performance

The proposed system provides a centralized platform to manage these processes.

---

# ✨ Key Features

## 👥 Contact Management

Manage customers and vendors from a centralized contact master.

### Contact Fields

- Name
- Type
  - Customer
  - Vendor
  - Both
- Email
- Mobile
- Address
  - City
  - State
  - Pincode
- Profile Image

---

## 🛋️ Product Management

Manage furniture products and services.

### Product Fields

- Product Name
- Type
  - Goods
  - Service
  - Combo
- Sales Price
- Purchase Price
- Category
- Active / Inactive Status

---

# 📦 Purchase Management

The complete purchase lifecycle is:

```text
Vendor
   ↓
Purchase Order
   ↓
Confirm Purchase Order
   ↓
Goods Received
   ↓
Vendor Bill
   ↓
Payment
   ↓
Accounting Entry
```

### Purchase Order

A Purchase Order contains:

- Vendor
- Product
- Quantity
- Unit Price

### Goods Receipt

Once the products are received, the purchase order can be marked as received.

### Vendor Bill

A bill is generated for the received purchase.

### Payment

The vendor bill can be settled through:

- Cash
- Bank

---

# 🛒 Sales Management

The complete sales lifecycle is:

```text
Customer
   ↓
Sales Order
   ↓
Customer Invoice
   ↓
Payment
   ↓
Accounting Entry
```

### Sales Order

Contains:

- Customer
- Product
- Quantity
- Unit Price
- Tax

### Customer Invoice

The system generates an invoice against the sales transaction.

### Payment

Customer payments can be recorded through:

- Cash
- Bank

---

# 💳 Payment Management

Payments can be recorded through:

```text
Cash
Bank
```

Payments are linked with the corresponding business transaction and accounting entry.

---

# 📚 Accounting

The system follows the **Double-Entry Accounting** principle.

Every financial transaction contains:

```text
Debit
+
Credit
```

The fundamental accounting rule is:

```text
Total Debit = Total Credit
```

---

## Example — Sales Transaction

Suppose a product is sold for ₹10,000.

### Sales Entry

```text
Customer Receivable     Debit    ₹10,000
Sales Income            Credit   ₹10,000
```

### Payment Entry

When the customer pays:

```text
Bank / Cash             Debit    ₹10,000
Customer Receivable     Credit   ₹10,000
```

This ensures that financial transactions remain balanced.

---

# 📊 Chart of Accounts

The system supports the following account types:

| Account Type | Examples |
|--------------|----------|
| Asset | Cash, Bank, Debtors |
| Liability | Creditors |
| Expense | Purchases Expense |
| Income | Sales Income |
| Capital | Owner Capital |

---

# 📖 Journals

The system supports different journals:

- Sales Journal
- Purchase Journal
- Bank Journal
- Cash Journal

Each journal entry contains:

```text
Journal
Date
Reference
Journal Items
    ├── Account
    ├── Debit
    └── Credit
```

---

# 📒 Journal Entries

A Journal Entry represents the accounting impact of a business transaction.

```text
Journal Entry
│
├── Date
├── Journal
├── Reference
│
└── Journal Items
      │
      ├── Account
      ├── Debit
      └── Credit
```

Before posting an entry:

```text
Debit = Credit
```

must be satisfied.

---

# 💰 Analytic Accounts

Analytic Accounts are used as financial markers for:

- Projects
- Departments
- Business Units

### Analytic Account Types

```text
Income
Expenses
```

---

# 🎯 Budget Management

Budgets are linked with Analytic Accounts.

### Budget Fields

- Budget Period
- Planned Amount
- Responsible Person
- Linked Analytic Account

Budget analysis compares planned financial activity with actual financial activity.

---

# 📈 Financial Reports

The system provides:

- Profit & Loss
- Balance Sheet
- Budget Report

---

## 📊 Profit & Loss

The basic calculation is:

```text
Net Profit = Total Income - Total Expenses
```

The report provides:

- Total Income
- Total Expenses
- Net Profit

---

## 🏦 Balance Sheet

The Balance Sheet contains:

```text
Assets
Liabilities
Capital
```

Accounting equation:

```text
Assets = Liabilities + Capital
```

---

## 📋 Budget Report

Budget reporting compares:

```text
Planned Amount
       vs
Actual Financial Activity
```

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────┐
│             FRONTEND                │
│                                     │
│             React.js                │
│                                     │
│ Dashboard                           │
│ Contacts                            │
│ Products                            │
│ Purchases                           │
│ Sales                               │
│ Payments                            │
│ Budgets                             │
│ Reports                             │
└──────────────────┬──────────────────┘
                   │
                   │ REST APIs
                   ▼
┌─────────────────────────────────────┐
│              BACKEND                │
│                                     │
│           Spring Boot               │
│                                     │
│ Controller                          │
│      ↓                              │
│ Service                             │
│      ↓                              │
│ Repository                          │
│      ↓                              │
│ MySQL                               │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│               MYSQL                 │
│                                     │
│ Master Data                         │
│ Transactions                        │
│ Accounting Entries                  │
│ Budgets                             │
└─────────────────────────────────────┘
```

---

# ⚙️ Technology Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Axios

## Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- JdbcTemplate
- Spring Security

## Database

- MySQL

## Authentication

- Firebase Authentication
- Firebase Admin SDK
- Firebase ID Token

## Development Tools

- IntelliJ IDEA
- Git
- GitHub
- Postman
- DBeaver

---

# 🧩 Backend Architecture

The backend follows a layered architecture:

```text
Controller
     ↓
Service
     ↓
Repository
     ↓
Database
```

### Controller

Responsible for:

- Handling HTTP requests
- Request validation
- Returning HTTP responses

### Service

Responsible for:

- Business logic
- Transaction processing
- Accounting logic
- Workflow management

### Repository

Responsible for:

- Database access
- CRUD operations
- Entity persistence

---

# 🔐 Authentication Architecture

The application uses Firebase Authentication.

```text
User
 ↓
React Application
 ↓
Firebase Authentication
 ↓
Firebase ID Token
 ↓
Authorization: Bearer <TOKEN>
 ↓
Spring Boot
 ↓
Firebase Admin SDK
 ↓
verifyIdToken()
 ↓
Spring Security Context
 ↓
Protected API
```

The backend independently verifies the Firebase ID token before allowing access to protected resources.

---

# 🔄 Complete Purchase Workflow

```text
                    PURCHASE
                       │
                       ▼
                    Vendor
                       │
                       ▼
               Purchase Order
                       │
                       ▼
                  Confirmation
                       │
                       ▼
                Goods Received
                       │
                       ▼
                  Vendor Bill
                       │
                       ▼
                    Payment
                       │
                       ▼
                Journal Entry
                       │
                       ▼
                    Reports
```

---

# 🔄 Complete Sales Workflow

```text
                      SALES
                        │
                        ▼
                     Customer
                        │
                        ▼
                   Sales Order
                        │
                        ▼
                     Invoice
                        │
                        ▼
                     Payment
                        │
                        ▼
                  Journal Entry
                        │
                        ▼
                     Reports
```

---

# 🧮 Accounting Engine

The Accounting Engine converts business transactions into accounting entries.

```text
Business Transaction
        ↓
Accounting Service
        ↓
Generate Journal Entry
        ↓
Generate Journal Lines
        ↓
Validate Debit = Credit
        ↓
Save Transaction
        ↓
Financial Reports
```

If:

```text
Debit != Credit
```

the transaction should not be posted.

---

# 🔁 Transaction Management

Financial operations may update multiple database records.

For example:

```text
Payment
   +
Journal Entry
   +
Journal Entry Lines
```

These operations should be executed atomically.

Spring Boot provides:

```java
@Transactional
```

Transaction flow:

```text
Operation Starts
      ↓
Multiple DB Operations
      ↓
      ├── Success → COMMIT
      │
      └── Failure → ROLLBACK
```

This prevents inconsistent accounting data.

---

# 🗃️ Core Entities

Major entities include:

```text
Contact
Product

ChartOfAccount
Journal
JournalEntry
JournalEntryLine

PurchaseOrder
PurchaseOrderItem

SalesOrder
SalesOrderItem

Invoice
Payment

AnalyticAccount
Budget
```

---

# 🔗 Entity Relationships

## Purchase

```text
PurchaseOrder
      │
      │ 1 : N
      ▼
PurchaseOrderItem
      │
      │ N : 1
      ▼
Product
```

## Sales

```text
SalesOrder
      │
      │ 1 : N
      ▼
SalesOrderItem
      │
      │ N : 1
      ▼
Product
```

## Accounting

```text
JournalEntry
      │
      │ 1 : N
      ▼
JournalEntryLine
      │
      │ N : 1
      ▼
ChartOfAccount
```

---

# 🌐 REST API

## Base URL

```text
http://localhost:8081/api
```

---

## Product APIs

```http
GET    /api/products
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}
```

---

## Contact APIs

```http
GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/{id}
PUT    /api/contacts/{id}
DELETE /api/contacts/{id}
```

---

## Purchase APIs

```http
POST /api/purchase-orders
POST /api/purchase-orders/{id}/confirm
POST /api/purchase-orders/{id}/receive
```

---

## Sales APIs

```http
POST /api/sales-orders
POST /api/sales-orders/{id}/confirm
```

---

## Payment APIs

```http
GET  /api/payments
POST /api/payments
GET  /api/payments/{id}
```

---

## Accounting APIs

```http
GET  /api/accounts
POST /api/accounts

GET  /api/journals
POST /api/journals

GET  /api/journal-entries
POST /api/journal-entries
```

---

## Budget APIs

```http
GET  /api/budgets
POST /api/budgets
PUT  /api/budgets/{id}
```

---

## Report APIs

```http
GET /api/reports/profit-loss
GET /api/reports/balance-sheet
GET /api/reports/budget
```

---

# 🖥️ Application Modules

```text
Dashboard
│
├── Contacts
│   ├── Customers
│   └── Vendors
│
├── Products
│
├── Purchases
│   ├── Purchase Orders
│   ├── Goods Receipt
│   └── Vendor Bills
│
├── Sales
│   ├── Sales Orders
│   └── Customer Invoices
│
├── Payments
│   ├── Cash
│   └── Bank
│
├── Accounting
│   ├── Chart of Accounts
│   ├── Journals
│   └── Journal Entries
│
├── Budgets
│   └── Analytic Accounts
│
└── Reports
    ├── Profit & Loss
    ├── Balance Sheet
    └── Budget Report
```

---

# 🗄️ Database Setup

Create the MySQL database:

```sql
CREATE DATABASE urban_furniture;
```

Configure Spring Boot:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/urban_furniture?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8081
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

- Java 21+
- Node.js
- npm
- MySQL
- Git
- IntelliJ IDEA

---

## 1. Clone Repository

```bash
git clone <repository-url>
cd urban-furniture
```

---

## 2. Setup Database

```sql
CREATE DATABASE urban_furniture;
```

Update your database credentials in:

```text
backend/src/main/resources/application.properties
```

---

## 3. Run Backend

Navigate to the backend directory:

```bash
cd backend
```

Run the application:

```bash
mvnw.cmd spring-boot:run
```

Or:

```bash
mvn spring-boot:run
```

Backend will run on:

```text
http://localhost:8081
```

---

## 4. Run Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will generally run on:

```text
http://localhost:5173
```

---

# 🔗 Frontend → Backend Communication

The frontend communicates with Spring Boot using REST APIs.

```text
React
  │
  │ Axios
  ▼
Spring Boot :8081
  │
  │ JPA / JdbcTemplate
  ▼
MySQL :3306
```

Example Axios configuration:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081/api"
});

export default api;
```

---

# 📊 Reporting Strategy

Normal CRUD operations are handled using:

```text
Spring Data JPA
        +
Hibernate
```

Complex financial reporting and aggregation can use:

```text
JdbcTemplate
        ↓
Optimized SQL Queries
```

Suitable for:

```text
Profit & Loss
Balance Sheet
Budget Analysis
Ledger
Dashboard Aggregations
```

---

# 🔒 Security

Security features include:

- Firebase Authentication
- Firebase ID Token verification
- Bearer Token Authentication
- Spring Security
- Protected APIs
- Request validation
- Transaction management

---

# 🎯 Design Principles

## 1. Centralized Master Data

Customers, vendors and products are maintained centrally.

## 2. Transaction Traceability

Every major business transaction follows a defined lifecycle.

## 3. Double-Entry Accounting

```text
Debit = Credit
```

## 4. Data Consistency

Critical financial operations are handled transactionally.

## 5. Separation of Responsibilities

```text
Controller
    ↓
Service
    ↓
Repository
```

## 6. Business Logic First

The system focuses on connecting:

```text
Business Transactions
        ↓
Accounting
        ↓
Financial Reporting
```

---

# 🏆 Hackathon Demonstration Flow

The recommended demonstration flow is:

```text
1. Dashboard
       ↓
2. Contacts
       ↓
3. Products
       ↓
4. Purchase Order
       ↓
5. Goods Received
       ↓
6. Vendor Bill
       ↓
7. Payment
       ↓
8. Accounting Entry
       ↓
9. Sales Transaction
       ↓
10. Customer Invoice
       ↓
11. Customer Payment
       ↓
12. Profit & Loss
       ↓
13. Balance Sheet
       ↓
14. Budget Report
```

---

# 💡 Core Business Logic

The key concept of the system is:

```text
Operational Transaction
          ↓
       Accounting
          ↓
        Reporting
```

### Example — Sale

```text
Sale
 ↓
Customer Invoice
 ↓
Payment
 ↓
Journal Entry
 ↓
Income increases
 ↓
Cash / Receivable changes
 ↓
P&L changes
 ↓
Balance Sheet changes
```

### Example — Purchase

```text
Purchase
 ↓
Vendor Bill
 ↓
Payment
 ↓
Journal Entry
 ↓
Expense increases
 ↓
Cash / Payable changes
 ↓
P&L changes
 ↓
Balance Sheet changes
```

---

# 🔮 Future Enhancements

Potential future improvements include:

- GST Automation
- PDF Invoice Generation
- Advanced Inventory Management
- Stock Alerts
- Payment Gateway Integration
- Audit Logs
- Advanced Role-Based Access Control
- Financial Forecasting
- Multi-Branch Accounting
- Cloud Deployment
- Advanced Analytics
- Recurring Transactions

---

# 🎯 Project Objective

The objective is to provide a centralized accounting system where:

```text
Master Data
     +
Business Transactions
     +
Accounting
     +
Budgeting
     +
Financial Reporting
```

are connected into a single workflow.

---

# 🏁 Conclusion

Urban Furniture Accounting System provides a structured approach to managing the financial operations of a furniture business.

The system connects:

```text
Customers
   +
Vendors
   +
Products
   +
Purchases
   +
Sales
   +
Payments
   +
Accounting
   +
Budgets
   +
Reports
```

into one centralized business management platform.

---

# 🏆 Built For

**Odoo Hackathon 2026**

### Project

**Urban Furniture — Accounting Management System**

### Objective

```text
Business Operations
        +
Accounting
        +
Financial Reporting
```

---

# 📜 License

This project was developed as a hackathon project for educational and demonstration purposes.
