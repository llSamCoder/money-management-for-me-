# SAMEER'S MONEY MANAGER
### Personal Finance Control Center
> *"Your Money. Your Control. Your Future."*

---

## 🏛️ Executive Overview

**SAMEER'S MONEY MANAGER** is an exclusive, private-wealth personal financial control terminal engineered specifically for **SAMEER**. 

Built with enterprise financial rigor and high-net-worth fintech aesthetics (Dark Navy Blue, Black, White, and Elegant Gold accents), this platform allows Sameer to track, control, and project every single rupee across liquid bank accounts, cash, UPI apps, credit cards, investments, receivables (money lent), borrowings (debt), recurring subscriptions, and savings goals.

---

## 💎 Branding & Identity System

The branding is prominently embedded throughout:
- **Application Name:** `SAMEER'S MONEY MANAGER`
- **Subtitle:** `Personal Finance Control Center`
- **Tagline:** `Your Money. Your Control. Your Future.`
- **Display Name:** `SAMEER` (Exclusive personal use, no surname)
- **On Launch Welcome:** High-end animated welcome splash: **"WELCOME SAMEER"** with a direct portal into the command center.
- **Header, Sidebar & Browser Title:** Integrated gold monogram emblem `S` and live status indicator.

---

## 🚀 Quick Start Guide (1-Click Launch)

### Option 1: Double-Click Launcher (Windows)
Double-click `run.bat` in the project root:
```cmd
run.bat
```
This automatically launches the backend REST server and opens your browser directly to:
👉 **`http://localhost:8000`**

### Option 2: Standalone Browser Launch
Open `frontend/index.html` directly in any web browser (Chrome, Edge, Brave, Firefox). The frontend features a reactive offline-first persistence engine that functions 100% locally with immediate LocalStorage and seamless backend sync!

### Option 3: Java Spring Boot + MySQL
If you want to run the enterprise Java Spring Boot backend:
1. Import `database/schema.sql` into MySQL Server 8.0:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
2. Run the Spring Boot application from `backend-spring-boot/`:
   ```bash
   mvn clean spring-boot:run
   ```

---

## 📐 Strict Financial Rules & Math Enforced

1. **Strict Net Worth Precision**:
   $$\text{Net Worth} = \text{Liquid Cash \& Bank Balances} + \text{Total Investments} + \text{Receivables (Money Given)} - \text{Payables (Money Taken)} - \text{Credit Card Dues}$$
2. **Zero Double-Counting on Transfers**:
   - Internal transfers (e.g. HDFC $\rightarrow$ Cash Wallet or SBI $\rightarrow$ PhonePe) adjust source and destination balances atomically without registering as income or expense.
3. **Credit Card Financial Liability Handling**:
   - A credit card purchase registers as an expense and increases the card's outstanding payable balance.
   - Paying the credit card bill reduces the bank balance and clears the credit card balance without recording a duplicate expense.
4. **Lending & Borrowing (Khata / Udhaar)**:
   - **Money Given (Receivables):** Deducts liquid cash/bank and adds to receivables. Repayments received credit the bank account and reduce pending receivables.
   - **Money Taken (Payables):** Adds to liquid balance and records a liability. Repayments made reduce the bank balance and settle the debt.
5. **Decimal Precision**:
   - Stored in MySQL as `DECIMAL(15, 2)` and computed with precise 2-decimal arithmetic in JavaScript/Python to prevent floating-point inaccuracies.
6. **Atomic Recalculations**:
   - Deleting or editing a transaction instantly reverses the previous amount from the account balance and applies the new state.

---

## 🗂️ Project Directory Structure

```text
sameers-money-manager/
├── run.bat                          # 1-Click Windows Batch Launcher
├── run.ps1                          # PowerShell Launcher
├── README.md                        # Documentation & Financial Guide
├── database/
│   └── schema.sql                   # MySQL 8.0 DDL Schema + Seed Data
├── backend/
│   ├── server.py                    # Python REST API Server (Zero pip install required)
│   └── sameer_money.db              # SQLite Database file with live financial tables
├── backend-spring-boot/
│   ├── pom.xml                      # Maven Build Configuration
│   └── src/
│       ├── main/resources/
│       │   └── application.properties # Spring Boot & MySQL DB properties
│       └── main/java/com/sameer/moneymanager/
│           ├── SameerMoneyManagerApplication.java
│           ├── config/SecurityConfig.java
│           └── model/
│               ├── Account.java
│               ├── Transaction.java
│               ├── Category.java
│               ├── Debt.java
│               ├── SavingsGoal.java
│               ├── Investment.java
│               └── RecurringPayment.java
└── frontend/
    ├── index.html                   # High-performance SPA HTML entry point
    ├── css/
    │   └── styles.css               # Dark Navy, White, Black & Gold styles + Print CSS
    └── js/
        └── app.js                   # React 18 Application (All 16 Sidebar Modules)
```

---

## 🤖 AI Money Assistant Capabilities

Sameer can converse with the built-in AI assistant using natural language:
- **Expense Logging:** *"Spent 450 on petrol via PhonePe"* $\rightarrow$ Automatically categorized as Petrol, charged to PhonePe, balance updated.
- **Income Logging:** *"Received 85000 salary into HDFC"* $\rightarrow$ Automatically credited to HDFC Salary Account.
- **Net Worth Inquiries:** *"What is my current net worth?"* $\rightarrow$ Computes live net worth breakdown across liquid cash, investments, and debts.
- **Budget Pacing:** *"How much can I spend today?"* $\rightarrow$ Calculates dynamic safe daily spending allowance based on remaining days in the month.

---

## 📊 Modules Included (Full 16 Sections)

1. **Dashboard** — Total Balance, Income, Expense, Savings Rate %, Net Worth, Portfolio Value, Receivables, Payables, Recent Transactions.
2. **Financial Calendar** — Interactive calendar with daily income, expenses, and upcoming bill reminders.
3. **All Transactions** — Filterable master ledger with keyword search, date filtering, and Excel export.
4. **Income Management** — Salary, Bonus, Incentives, Freelance, Business, Gifts, and Refunds.
5. **Expense Management** — Food, Travel, Petrol, Shopping, Clothes, Gym, Health, Education, Recharge, Internet, Family, Entertainment, Bills.
6. **My Accounts** — HDFC Bank, SBI, ICICI, Cash Wallet, Google Pay, PhonePe, Paytm, and Credit Cards.
7. **Transfers** — Internal movement of money with zero double counting.
8. **Budget Management** — Monthly budget ceiling, category-wise limits, and overspending warnings.
9. **Savings Goals** — Emergency Fund, MacBook, Bike, Travel, and Wealth targets with direct deposit capability.
10. **Money Given (Receivables)** — Personal loans lent to others with repayment tracker.
11. **Money Taken (Payables)** — Liabilities and borrowings with settlement tracking.
12. **Investments** — Mutual Funds, SIPs, Stocks, SGB Gold, Fixed Deposits, and PPF with live P&L.
13. **Bills & Reminders** — Recurring monthly utilities and subscriptions with one-click "Mark as Paid".
14. **Reports & Analytics** — Annual/monthly statement generation, category share, and printable PDF reports.
15. **AI Assistant** — Interactive chat and natural language transaction recording.
16. **Settings & Audit Log** — Profile parameters, JSON backup export/restore, and activity logs.
