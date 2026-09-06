# 🪑 Urban Furniture — Accounting Management System

> A complete business accounting platform for managing customers, vendors, products, purchases, sales, payments, budgets and financial reports.

---

## 📌 Overview

**Urban Furniture Accounting System** is a centralized accounting and business management application designed for a furniture business.

The system connects the complete business transaction lifecycle:

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

🎯 Problem Statement

Furniture businesses need to manage multiple financial and operational activities such as:

Customers and vendors
Products and pricing
Purchase orders
Sales orders
Vendor bills
Customer invoices
Cash and bank payments
Accounting journal entries
Budgets
Financial reports

Managing these activities independently can lead to:

Duplicate data
Accounting inconsistencies
Difficult financial tracking
Manual calculations
Poor visibility into business performance

The proposed system provides a centralized platform to manage these workflows.

✨ Key Features
👥 Contact Management

Manage customers and vendors from a centralized contact master.

Contact Information
Name
Type
Customer
Vendor
Both
Email
Mobile
Address
City
State
Pincode
Profile Image
🛋️ Product Management

Manage all furniture products and services.

Product Information
Product Name
Type
Goods
Service
Combo
Sales Price
Purchase Price
Category
Active / Inactive status
📦 Purchase Management

The purchase workflow follows a complete business lifecycle.

Vendor
   ↓
Purchase Order
   ↓
Confirm Order
   ↓
Goods Received
   ↓
Vendor Bill
   ↓
Payment
   ↓
Accounting Entry
Purchase Order

A Purchase Order contains:

Vendor
Product
Quantity
Unit Price
Goods Receipt

Once the products are received, the purchase order can be marked as received.

Vendor Bill

A bill is generated for the received purchase.

Payment

The vendor bill can be settled through:

Cash
Bank
🛒 Sales Management

The sales workflow follows:

Customer
   ↓
Sales Order
   ↓
Customer Invoice
   ↓
Payment
   ↓
Accounting Entry
Sales Order

Contains:

Customer
Product
Quantity
Unit Price
Tax
Customer Invoice

The system generates an invoice against the sales transaction.

Payment

Customer payments can be recorded through:

Cash
Bank
📚 Accounting

The system follows the Double-Entry Accounting principle.

Every financial transaction generates at least:

Debit
  +
Credit

And:

Total Debit = Total Credit
Example

Suppose a product is sold for ₹10,000.

Accounting entry:

Customer Receivable     Debit   ₹10,000
Sales Income            Credit  ₹10,000

When the customer pays:

Bank / Cash             Debit   ₹10,000
Customer Receivable     Credit  ₹10,000

This ensures that financial transactions remain balanced.

📊 Chart of Accounts

The system supports the following account categories:

Account Type	Examples
Asset	Cash, Bank, Debtors
Liability	Creditors
Income	Sales Income
Expense	Purchases Expense
Capital	Owner Capital
📖 Journals

The system supports different journals for financial transactions:

Sales Journal
Purchase Journal
Bank Journal
Cash Journal

Each journal entry contains:

Journal
Date
Reference
Journal Items
    ├── Account
    ├── Debit
    └── Credit
💰 Budget Management

The system provides budget planning using Analytic Accounts.

Analytic Account

Used to track financial activities related to:

Projects
Departments
Business Units
Budget Information
Budget Period
Planned Amount
Responsible Person
Linked Analytic Account
📈 Financial Reports

The system provides important financial reports.

Profit & Loss
Net Profit = Total Income - Total Expenses

The report provides visibility into:

Sales / Income
Purchases
Expenses
Net Profit
Balance Sheet

The Balance Sheet provides:

Assets
Liabilities
Capital

Based on the accounting equation:

Assets = Liabilities + Capital
Budget Report

The Budget Report compares:

Planned Amount
        vs
Actual Financial Activity

This helps identify budget utilization and financial performance.

🏗️ System Architecture

The application follows a layered architecture.

┌──────────────────────────────┐
│       React Frontend         │
│                              │
│ Dashboard                    │
│ Contacts                     │
│ Products                     │
│ Purchases                    │
│ Sales                        │
│ Payments                     │
│ Budgets                      │
│ Reports                      │
└──────────────┬───────────────┘
               │
               │ REST APIs
               ▼
┌──────────────────────────────┐
│       Spring Boot API        │
│                              │
│ Controllers                  │
│      ↓                       │
│ Services                     │
│      ↓                       │
│ Repositories                 │
│      ↓                       │
│ Accounting Engine            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           MySQL              │
│                              │
│ Master Data                  │
│ Transactions                 │
│ Accounting Entries           │
│ Budgets                      │
│ Reports Data                 │
└──────────────────────────────┘
🧩 Backend Architecture

The Spring Boot backend follows:

Controller
     ↓
Service
     ↓
Repository
     ↓
Database
Controller

Handles:

HTTP requests
Request validation
API responses
Service

Contains:

Business logic
Transaction processing
Accounting rules
Workflow management
Repository

Handles:

Database operations
Entity persistence
CRUD operations
⚙️ Technology Stack
Frontend
React.js
JavaScript
HTML5
CSS3
Axios
Backend
Java
Spring Boot
Spring Web
Spring Data JPA
Hibernate
JdbcTemplate
Spring Security
Database
MySQL
Authentication
Firebase Authentication
Firebase Admin SDK
Firebase ID Token verification
Development Tools
IntelliJ IDEA
Git
GitHub
Postman
DBeaver
🔐 Authentication Flow

The application uses Firebase Authentication.

User
 ↓
React Application
 ↓
Firebase Login
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

The backend independently verifies the Firebase ID token before allowing access to protected resources.

🔄 Complete Business Workflow
Purchase Workflow
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
Journal Entry
   ↓
Reports
Sales Workflow
Customer
   ↓
Sales Order
   ↓
Customer Invoice
   ↓
Payment
   ↓
Journal Entry
   ↓
Reports
🧮 Accounting Engine

The accounting engine converts business transactions into double-entry journal entries.

Business Event
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

The system prevents an accounting transaction from being posted if:

Debit ≠ Credit

This maintains accounting consistency.

🗃️ Core Data Model

Major entities include:

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
Important Relationships
PurchaseOrder
      │
      └── 1 : N
             │
             ▼
      PurchaseOrderItem
             │
             ▼
          Product
JournalEntry
      │
      └── 1 : N
             │
             ▼
      JournalEntryLine
             │
             ▼
       ChartOfAccount
🌐 API Structure

Example API structure:

/api/products
/api/contacts
/api/purchase-orders
/api/sales-orders
/api/payments
/api/accounts
/api/journals
/api/budgets
/api/reports

Example:

GET /api/products

Create a purchase order:

POST /api/purchase-orders

Confirm purchase order:

POST /api/purchase-orders/{id}/confirm

Receive purchase order:

POST /api/purchase-orders/{id}/receive
🖥️ Application Modules
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
🚀 Getting Started
Prerequisites

Make sure the following are installed:

Java 21+
Node.js
npm
MySQL
Git
IntelliJ IDEA
🗄️ Database Setup

Create the MySQL database:

CREATE DATABASE urban_furniture;

Update the Spring Boot configuration:

spring.datasource.url=jdbc:mysql://localhost:3306/urban_furniture?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8081
▶️ Running the Backend

Navigate to the backend directory:

cd backend

Run the application:

./mvnw spring-boot:run

On Windows:

mvnw.cmd spring-boot:run

Backend will run on:

http://localhost:8081
▶️ Running the Frontend

Navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend will generally run on:

http://localhost:5173
🔗 Frontend → Backend Communication

The frontend communicates with Spring Boot through REST APIs.

React
  │
  │ Axios
  ▼
Spring Boot :8081
  │
  ▼
MySQL :3306

Example Axios configuration:

const api = axios.create({
    baseURL: "http://localhost:8081/api"
});
🔒 Security

Security considerations include:

Firebase Authentication
Firebase ID Token verification
Bearer token authentication
Protected backend APIs
Request validation
Role-based authorization where required
Transactional database operations
🔁 Transaction Management

Financial operations may update multiple database records.

For example:

Payment
  +
Journal Entry
  +
Journal Lines

These operations should behave as one database transaction.

Spring's @Transactional is used to maintain consistency.

Success
  ↓
Commit

Failure
  ↓
Rollback

This prevents situations such as a payment being saved while its accounting entry fails.

📊 Reporting Strategy

Operational CRUD operations are handled using:

Spring Data JPA / Hibernate

Complex financial reporting and aggregation can use:

JdbcTemplate

This allows optimized SQL queries for reports such as:

Profit & Loss
Balance Sheet
Ledger
Budget Analysis
🎯 Design Principles

The system is designed around the following principles:

1. Centralized Master Data

Customers, vendors and products are maintained in one place.

2. Transaction Traceability

Every major business transaction follows a traceable lifecycle.

3. Double-Entry Accounting

Every financial transaction maintains:

Debit = Credit
4. Data Consistency

Transactional operations are handled atomically.

5. Separation of Responsibilities
Controller → Service → Repository

keeps business logic separated from API and database concerns.

🏆 Hackathon Focus

The project focuses on demonstrating the complete accounting lifecycle rather than isolated CRUD screens.

The core demonstration flow is:

Master Data
     ↓
Purchase / Sales
     ↓
Invoice / Bill
     ↓
Payment
     ↓
Accounting Entry
     ↓
Financial Reports

This demonstrates how a business transaction eventually impacts the company's financial statements.

🔮 Future Enhancements

Potential future improvements include:

Advanced role-based access control
Automated invoice generation
PDF invoice export
GST automation
Payment gateway integration
Inventory stock tracking
Low-stock alerts
Advanced analytics
Financial forecasting
Cloud deployment
Audit logs
Multi-branch accounting
Automated recurring transactions
👨‍💻 Team

Built for the Odoo Hackathon 2026.

Project

Urban Furniture — Accounting Management System

Objective

Build a centralized accounting solution connecting:

Business Operations
        +
Accounting
        +
Financial Reporting
📜 License

This project was developed as a hackathon project for educational and demonstration purposes.
