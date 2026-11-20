#!/usr/bin/env python3
"""
SAMEER'S MONEY MANAGER - Personal Finance Control Center
Backend REST API Server
Built with Python standard library & SQLite3 (with MySQL compatibility)
Provides full financial calculations, atomic updates, AI assistant, and audit logging.
"""

import os
import sys
import json
import sqlite3
import datetime
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_FILE = os.path.join(os.path.dirname(__file__), "sameer_money.db")
PORT = 8000

# ----------------------------------------------------------------------------
# DATABASE INITIALIZATION & SCHEMA
# ----------------------------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL DEFAULT 'SAMEER',
        pin_code TEXT NOT NULL DEFAULT '1234',
        email TEXT,
        currency_symbol TEXT DEFAULT '₹',
        monthly_budget_limit REAL DEFAULT 120000.00,
        daily_spending_limit REAL DEFAULT 4000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_name TEXT NOT NULL,
        account_type TEXT NOT NULL, -- BANK, CASH, UPI, CREDIT_CARD, WALLET
        account_number_last4 TEXT,
        institution_name TEXT,
        balance REAL NOT NULL DEFAULT 0.00,
        credit_limit REAL DEFAULT 0.00,
        billing_cycle_day INTEGER DEFAULT 1,
        color_hex TEXT DEFAULT '#001F54',
        icon_name TEXT DEFAULT 'landmark',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- INCOME, EXPENSE
        icon TEXT DEFAULT 'tag',
        color_hex TEXT DEFAULT '#D4AF37',
        monthly_budget REAL DEFAULT 0.00,
        UNIQUE(name, type)
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        destination_account_id INTEGER,
        category_id INTEGER,
        transaction_type TEXT NOT NULL, -- INCOME, EXPENSE, TRANSFER, DEBT_GIVEN, DEBT_TAKEN, INVESTMENT
        amount REAL NOT NULL,
        transaction_date TEXT NOT NULL,
        payee_or_payer TEXT,
        notes TEXT,
        payment_mode TEXT DEFAULT 'UPI',
        reference_number TEXT,
        receipt_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (destination_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_name TEXT NOT NULL,
        phone_number TEXT,
        debt_type TEXT NOT NULL, -- GIVEN, TAKEN
        initial_amount REAL NOT NULL,
        pending_amount REAL NOT NULL,
        given_or_taken_date TEXT NOT NULL,
        due_date TEXT,
        account_id INTEGER,
        notes TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS debt_repayments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debt_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        repayment_date TEXT NOT NULL,
        payment_mode TEXT DEFAULT 'UPI',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_saved REAL NOT NULL DEFAULT 0.00,
        target_date TEXT,
        icon_name TEXT DEFAULT 'target',
        color_hex TEXT DEFAULT '#D4AF37',
        status TEXT DEFAULT 'IN_PROGRESS',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investment_name TEXT NOT NULL,
        asset_type TEXT NOT NULL, -- MUTUAL_FUND, SIP, STOCKS, GOLD, FIXED_DEPOSIT, PPF
        invested_amount REAL NOT NULL,
        current_value REAL NOT NULL,
        units_or_shares REAL DEFAULT NULL,
        buy_price_avg REAL DEFAULT NULL,
        current_nav_or_price REAL DEFAULT NULL,
        investment_date TEXT NOT NULL,
        sip_day_of_month INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recurring_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category_id INTEGER,
        amount REAL NOT NULL,
        frequency TEXT DEFAULT 'MONTHLY',
        due_day INTEGER NOT NULL,
        next_due_date TEXT NOT NULL,
        default_account_id INTEGER,
        is_auto_pay INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        last_paid_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (default_account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        module TEXT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed User
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        cur.execute("""
            INSERT INTO users (username, display_name, pin_code, email, currency_symbol, monthly_budget_limit, daily_spending_limit)
            VALUES ('sameer', 'SAMEER', '1234', 'sameer@moneymanager.local', '₹', 120000.00, 4000.00)
        """)

    # Seed Default Categories
    cur.execute("SELECT COUNT(*) FROM categories")
    if cur.fetchone()[0] == 0:
        cats = [
            ('Salary', 'INCOME', 'briefcase', '#10B981', 0),
            ('Bonus', 'INCOME', 'award', '#34D399', 0),
            ('Incentives', 'INCOME', 'trending-up', '#059669', 0),
            ('Freelancing', 'INCOME', 'laptop', '#047857', 0),
            ('Business Income', 'INCOME', 'building', '#065F46', 0),
            ('Gifts', 'INCOME', 'gift', '#6EE7B7', 0),
            ('Refunds', 'INCOME', 'rotate-ccw', '#A7F3D0', 0),
            ('Other Income', 'INCOME', 'plus-circle', '#3B82F6', 0),

            ('Food', 'EXPENSE', 'utensils', '#F59E0B', 15000.00),
            ('Travel', 'EXPENSE', 'plane', '#3B82F6', 8000.00),
            ('Petrol', 'EXPENSE', 'fuel', '#EF4444', 6000.00),
            ('Shopping', 'EXPENSE', 'shopping-bag', '#EC4899', 10000.00),
            ('Clothes', 'EXPENSE', 'shirt', '#8B5CF6', 5000.00),
            ('Gym', 'EXPENSE', 'dumbbell', '#10B981', 2500.00),
            ('Health', 'EXPENSE', 'activity', '#06B6D4', 4000.00),
            ('Education', 'EXPENSE', 'book-open', '#6366F1', 5000.00),
            ('Mobile Recharge', 'EXPENSE', 'smartphone', '#14B8A6', 1000.00),
            ('Internet', 'EXPENSE', 'wifi', '#0284C7', 1500.00),
            ('Family', 'EXPENSE', 'users', '#F97316', 15000.00),
            ('Entertainment', 'EXPENSE', 'film', '#D946EF', 4000.00),
            ('Bills', 'EXPENSE', 'file-text', '#64748B', 8000.00),
            ('Other Expenses', 'EXPENSE', 'credit-card', '#94A3B8', 5000.00)
        ]
        cur.executemany("INSERT INTO categories (name, type, icon, color_hex, monthly_budget) VALUES (?, ?, ?, ?, ?)", cats)

    # Seed Default Accounts
    cur.execute("SELECT COUNT(*) FROM accounts")
    if cur.fetchone()[0] == 0:
        accs = [
            ('HDFC Salary Account', 'BANK', '4821', 'HDFC Bank', 142500.00, 0.00, 1, '#004c8f', 'landmark'),
            ('SBI Savings Account', 'BANK', '9103', 'State Bank of India', 68200.00, 0.00, 1, '#1a365d', 'landmark'),
            ('ICICI Direct Account', 'BANK', '3341', 'ICICI Bank', 35000.00, 0.00, 1, '#7c2d12', 'landmark'),
            ('Cash Wallet', 'CASH', '', 'Physical Cash', 12400.00, 0.00, 1, '#065f46', 'wallet'),
            ('Google Pay UPI', 'UPI', '4821', 'Google Pay (HDFC)', 0.00, 0.00, 1, '#1d4ed8', 'smartphone'),
            ('PhonePe UPI', 'UPI', '9103', 'PhonePe (SBI)', 0.00, 0.00, 1, '#6d28d9', 'smartphone'),
            ('Paytm Wallet', 'WALLET', '8872', 'Paytm', 3250.00, 0.00, 1, '#0369a1', 'wallet'),
            ('HDFC Regalia Gold Credit Card', 'CREDIT_CARD', '6142', 'HDFC Bank', 18450.00, 300000.00, 20, '#854d0e', 'credit-card')
        ]
        cur.executemany("""
            INSERT INTO accounts (account_name, account_type, account_number_last4, institution_name, balance, credit_limit, billing_cycle_day, color_hex, icon_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, accs)

    # Seed Savings Goals
    cur.execute("SELECT COUNT(*) FROM savings_goals")
    if cur.fetchone()[0] == 0:
        goals = [
            ('Emergency Fund (6 Months)', 300000.00, 180000.00, '2026-12-31', 'shield', '#D4AF37'),
            ('New MacBook Pro / Laptop', 180000.00, 95000.00, '2026-08-15', 'laptop', '#3B82F6'),
            ('Bike (Royal Enfield Hunter)', 220000.00, 110000.00, '2026-11-30', 'bike', '#EF4444'),
            ('Europe Travel Trip', 250000.00, 60000.00, '2027-04-10', 'plane', '#10B981'),
            ('Personal Long-term Wealth', 1000000.00, 340000.00, '2028-12-31', 'gem', '#8B5CF6')
        ]
        cur.executemany("INSERT INTO savings_goals (goal_name, target_amount, current_saved, target_date, icon_name, color_hex) VALUES (?, ?, ?, ?, ?, ?)", goals)

    # Seed Investments
    cur.execute("SELECT COUNT(*) FROM investments")
    if cur.fetchone()[0] == 0:
        invs = [
            ('Parag Parikh Flexi Cap Fund', 'MUTUAL_FUND', 120000.00, 148500.00, 1856.25, 64.65, 80.00, '2025-01-10', 5, 'Monthly SIP on 5th'),
            ('Mirae Asset Large Cap Fund', 'MUTUAL_FUND', 80000.00, 94200.00, 897.14, 89.17, 105.00, '2025-02-15', 10, 'Monthly SIP on 10th'),
            ('HDFC Bank Shares (NSE)', 'STOCKS', 75000.00, 86400.00, 50.00, 1500.00, 1728.00, '2025-03-01', None, 'Bluechip equity holding'),
            ('TCS Shares (NSE)', 'STOCKS', 60000.00, 69800.00, 18.00, 3333.33, 3877.77, '2025-03-20', None, 'IT sector giant'),
            ('Sovereign Gold Bond (SGB 2026)', 'GOLD', 100000.00, 132000.00, 20.00, 5000.00, 6600.00, '2024-06-15', None, '2.5% semi-annual interest'),
            ('HDFC Cumulative Fixed Deposit', 'FIXED_DEPOSIT', 150000.00, 162750.00, 1.00, 150000.00, 162750.00, '2025-01-01', None, '7.25% p.a. interest'),
            ('Public Provident Fund (PPF)', 'PPF', 150000.00, 168000.00, 1.00, 150000.00, 168000.00, '2024-04-05', None, 'Tax-free sovereign guaranteed')
        ]
        cur.executemany("""
            INSERT INTO investments (investment_name, asset_type, invested_amount, current_value, units_or_shares, buy_price_avg, current_nav_or_price, investment_date, sip_day_of_month, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, invs)

    # Seed Recurring Payments
    cur.execute("SELECT COUNT(*) FROM recurring_payments")
    if cur.fetchone()[0] == 0:
        recurs = [
            ('Apartment House Rent', 21, 22000.00, 'MONTHLY', 1, '2026-12-01', 1, 1),
            ('Airtel Fiber Broadband', 18, 1179.00, 'MONTHLY', 12, '2026-12-12', 1, 1),
            ('Electricity Bill (BESCOM)', 21, 2450.00, 'MONTHLY', 18, '2026-12-18', 1, 0),
            ('Gold Gym Membership', 14, 2500.00, 'MONTHLY', 5, '2026-12-05', 1, 1),
            ('Netflix Premium 4K', 20, 649.00, 'MONTHLY', 20, '2026-12-20', 8, 1),
            ('Spotify Duo', 20, 149.00, 'MONTHLY', 24, '2026-12-24', 8, 1),
            ('Jio Mobile Postpaid', 17, 471.00, 'MONTHLY', 15, '2026-12-15', 5, 1)
        ]
        cur.executemany("""
            INSERT INTO recurring_payments (title, category_id, amount, frequency, due_day, next_due_date, default_account_id, is_auto_pay)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, recurs)

    # Seed Debts (Lending & Borrowing)
    cur.execute("SELECT COUNT(*) FROM debts")
    if cur.fetchone()[0] == 0:
        debts_data = [
            ('Rahul Sharma', '+91 98765 43210', 'GIVEN', 25000.00, 15000.00, '2026-10-15', '2026-12-15', 1, 'Emergency loan given for laptop repair; repaid 10k', 'PARTIALLY_PAID'),
            ('Amit Verma', '+91 98111 22334', 'GIVEN', 12000.00, 12000.00, '2026-11-02', '2026-12-05', 1, 'Trip advance share pending to receive', 'PENDING'),
            ('Vikram Uncle', '+91 99000 88776', 'TAKEN', 50000.00, 20000.00, '2026-08-10', '2026-12-31', 1, 'Personal short term borrowing; 30k repaid', 'PARTIALLY_PAID')
        ]
        cur.executemany("""
            INSERT INTO debts (person_name, phone_number, debt_type, initial_amount, pending_amount, given_or_taken_date, due_date, account_id, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, debts_data)

    # Seed Initial Transactions
    cur.execute("SELECT COUNT(*) FROM transactions")
    if cur.fetchone()[0] == 0:
        today_str = datetime.date.today().isoformat()
        yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        two_days_ago = (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
        three_days_ago = (datetime.date.today() - datetime.timedelta(days=3)).isoformat()

        txs = [
            (1, None, 1, 'INCOME', 125000.00, three_days_ago, 'Tech Corp India Ltd', 'Monthly Software Engineer Salary Credit', 'NetBanking', 'HDFC-TXN-99881', None),
            (1, None, 9, 'EXPENSE', 840.00, yesterday_str, 'Swiggy', 'Dinner order - Gourmet Burger & Drink', 'UPI', 'UPI-SWG-77123', None),
            (1, None, 11, 'EXPENSE', 2200.00, two_days_ago, 'Shell Petrol Pump', 'Fuel for car', 'UPI', 'UPI-PET-4411', None),
            (1, None, 10, 'EXPENSE', 3450.00, yesterday_str, 'MakeMyTrip', 'Weekend flight ticket booking', 'UPI', 'UPI-MMT-8821', None),
            (1, 4, None, 'TRANSFER', 5000.00, yesterday_str, 'ATM Withdrawal', 'Withdrew cash for emergency wallet', 'Cash', 'ATM-HDFC-91', None),
            (1, None, 4, 'INCOME', 35000.00, three_days_ago, 'Client Apex Systems', 'Freelance Frontend Dashboard Milestone', 'NetBanking', 'NEFT-APEX-101', None)
        ]
        cur.executemany("""
            INSERT INTO transactions (account_id, destination_account_id, category_id, transaction_type, amount, transaction_date, payee_or_payer, notes, payment_mode, reference_number, receipt_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, txs)

    conn.commit()
    conn.close()

# ----------------------------------------------------------------------------
# AUDIT LOGGER
# ----------------------------------------------------------------------------
def log_audit(action, module, details):
    try:
        conn = get_db()
        conn.execute("INSERT INTO audit_logs (action, module, details) VALUES (?, ?, ?)", (action, module, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging audit: {e}", file=sys.stderr)

# ----------------------------------------------------------------------------
# AI NATURAL LANGUAGE PARSER & FINANCIAL ADVISOR
# ----------------------------------------------------------------------------
def ai_parse_command(prompt):
    prompt_lower = prompt.lower().strip()
    result = {
        "success": False,
        "type": "UNKNOWN",
        "parsed_data": {},
        "message": ""
    }

    # Extract amount (handles ₹, rs, inr, numbers like 500, 1,500, 2500.50)
    amount_match = re.search(r'(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)', prompt_lower)
    amount = 0.0
    if amount_match:
        amount_str = amount_match.group(1).replace(',', '')
        try:
            amount = float(amount_str)
        except ValueError:
            pass

    # Check for Expense keywords
    expense_words = ['spent', 'paid', 'expense', 'bought', 'purchased', 'kharcha', 'diya', 'de diya']
    income_words = ['received', 'got', 'salary', 'income', 'earned', 'credited', 'aaya', 'mile', 'bonus']
    transfer_words = ['transfer', 'transferred', 'sent to', 'moved', 'bheja']

    # Match Category
    category_id = None
    category_name = None
    conn = get_db()
    cats = conn.execute("SELECT id, name, type FROM categories").fetchall()
    
    for cat in cats:
        c_name = cat['name'].lower()
        if c_name in prompt_lower:
            category_id = cat['id']
            category_name = cat['name']
            break
        # Common synonyms
        if c_name == 'petrol' and ('fuel' in prompt_lower or 'gas' in prompt_lower or 'diesel' in prompt_lower):
            category_id = cat['id']
            category_name = cat['name']
            break
        elif c_name == 'food' and ('lunch' in prompt_lower or 'dinner' in prompt_lower or 'swiggy' in prompt_lower or 'zomato' in prompt_lower or 'restaurant' in prompt_lower or 'coffee' in prompt_lower):
            category_id = cat['id']
            category_name = cat['name']
            break
        elif c_name == 'shopping' and ('amazon' in prompt_lower or 'flipkart' in prompt_lower or 'myntra' in prompt_lower):
            category_id = cat['id']
            category_name = cat['name']
            break

    # Match Account
    account_id = None
    account_name = None
    accounts = conn.execute("SELECT id, account_name, account_type FROM accounts WHERE is_active = 1").fetchall()
    for acc in accounts:
        a_name = acc['account_name'].lower()
        if 'hdfc' in prompt_lower and 'hdfc' in a_name:
            account_id = acc['id']
            account_name = acc['account_name']
            break
        elif 'sbi' in prompt_lower and 'sbi' in a_name:
            account_id = acc['id']
            account_name = acc['account_name']
            break
        elif 'phonepe' in prompt_lower and 'phonepe' in a_name:
            account_id = acc['id']
            account_name = acc['account_name']
            break
        elif 'gpay' in prompt_lower or 'google pay' in prompt_lower:
            if 'google pay' in a_name:
                account_id = acc['id']
                account_name = acc['account_name']
                break
        elif 'cash' in prompt_lower and 'cash' in a_name:
            account_id = acc['id']
            account_name = acc['account_name']
            break
        elif 'credit card' in prompt_lower and acc['account_type'] == 'CREDIT_CARD':
            account_id = acc['id']
            account_name = acc['account_name']
            break

    if not account_id and len(accounts) > 0:
        account_id = accounts[0]['id']
        account_name = accounts[0]['account_name']

    conn.close()

    is_income = any(w in prompt_lower for w in income_words)
    is_expense = any(w in prompt_lower for w in expense_words)
    is_transfer = any(w in prompt_lower for w in transfer_words)

    if amount > 0 and (is_expense or (not is_income and not is_transfer)):
        result["success"] = True
        result["type"] = "EXPENSE"
        result["parsed_data"] = {
            "amount": amount,
            "category_id": category_id or 9, # fallback to Food/Other
            "category_name": category_name or "Expense",
            "account_id": account_id,
            "account_name": account_name,
            "date": datetime.date.today().isoformat(),
            "notes": prompt
        }
        result["message"] = f"Understood! Ready to record expense of ₹{amount:,.2f} under '{result['parsed_data']['category_name']}' from '{account_name}'."
        return result

    if amount > 0 and is_income:
        result["success"] = True
        result["type"] = "INCOME"
        result["parsed_data"] = {
            "amount": amount,
            "category_id": category_id or 1, # fallback to Salary
            "category_name": category_name or "Salary/Income",
            "account_id": account_id,
            "account_name": account_name,
            "date": datetime.date.today().isoformat(),
            "notes": prompt
        }
        result["message"] = f"Understood! Ready to credit income of ₹{amount:,.2f} under '{result['parsed_data']['category_name']}' to '{account_name}'."
        return result

    # Financial analysis / Q&A response
    return ai_generate_financial_advice(prompt)

def ai_generate_financial_advice(prompt):
    conn = get_db()
    # Fetch live financial stats for Sameer
    accounts = conn.execute("SELECT * FROM accounts WHERE is_active = 1").fetchall()
    total_balance = sum(a['balance'] for a in accounts if a['account_type'] != 'CREDIT_CARD')
    cc_dues = sum(a['balance'] for a in accounts if a['account_type'] == 'CREDIT_CARD')
    
    investments = conn.execute("SELECT SUM(invested_amount) as total_inv, SUM(current_value) as total_cur FROM investments").fetchone()
    total_invested = investments['total_inv'] or 0.0
    total_inv_val = investments['total_cur'] or 0.0
    
    debts_given = conn.execute("SELECT SUM(pending_amount) as pending FROM debts WHERE debt_type = 'GIVEN' AND status != 'SETTLED'").fetchone()['pending'] or 0.0
    debts_taken = conn.execute("SELECT SUM(pending_amount) as pending FROM debts WHERE debt_type = 'TAKEN' AND status != 'SETTLED'").fetchone()['pending'] or 0.0
    
    net_worth = total_balance + total_inv_val + debts_given - debts_taken - cc_dues

    today = datetime.date.today()
    cur_month = f"{today.year:04d}-{today.month:02d}"
    month_txs = conn.execute("""
        SELECT transaction_type, SUM(amount) as total 
        FROM transactions 
        WHERE transaction_date LIKE ? 
        GROUP BY transaction_type
    """, (f"{cur_month}%",)).fetchall()
    
    month_income = sum(t['total'] for t in month_txs if t['transaction_type'] == 'INCOME')
    month_expense = sum(t['total'] for t in month_txs if t['transaction_type'] == 'EXPENSE')
    savings_rate = ((month_income - month_expense) / month_income * 100) if month_income > 0 else 0

    conn.close()

    p_low = prompt.lower()
    reply = ""

    if "net worth" in p_low or "wealth" in p_low:
        reply = f"Hello Sameer! Your total Net Worth currently stands at **₹{net_worth:,.2f}**.\n\n" \
                f"• Liquid Balances (Bank & Cash): ₹{total_balance:,.2f}\n" \
                f"• Investment Portfolio: ₹{total_inv_val:,.2f} (Total gain: ₹{(total_inv_val - total_invested):,.2f})\n" \
                f"• Receivables (Money Given): ₹{debts_given:,.2f}\n" \
                f"• Outstanding Liabilities: ₹{(debts_taken + cc_dues):,.2f} (Payables: ₹{debts_taken:,.2f}, Credit Card: ₹{cc_dues:,.2f})"
    elif "how much" in p_low or "spend" in p_low or "expense" in p_low or "saving" in p_low:
        reply = f"Hi Sameer, here is your current month snapshot ({today.strftime('%B %Y')}):\n\n" \
                f"• Total Income: ₹{month_income:,.2f}\n" \
                f"• Total Expenses: ₹{month_expense:,.2f}\n" \
                f"• Net Monthly Savings: ₹{(month_income - month_expense):,.2f}\n" \
                f"• Savings Rate: **{savings_rate:.1f}%**\n\n" \
                f"💡 **Recommendation**: Keep your emergency fund topped up to 6 months of expenses, and ensure credit card dues of ₹{cc_dues:,.2f} are cleared before billing due date."
    elif "investment" in p_low or "portfolio" in p_low or "stocks" in p_low or "mutual fund" in p_low:
        gain = total_inv_val - total_invested
        pct = (gain / total_invested * 100) if total_invested > 0 else 0
        reply = f"Sameer, your investment portfolio is performing solidly:\n\n" \
                f"• Invested Capital: ₹{total_invested:,.2f}\n" \
                f"• Current Valuation: ₹{total_inv_val:,.2f}\n" \
                f"• Overall Profit/Loss: **+₹{gain:,.2f} ({pct:+.2f}%)**\n\n" \
                f"Your portfolio is well-diversified across Flexi-Cap Mutual Funds, Bluechip Stocks, SGB Gold, and PPF."
    else:
        reply = f"Welcome Sameer! I am your AI Financial Assistant in Sameer's Money Manager.\n\n" \
                f"You can speak or type natural commands like:\n" \
                f"• *'Spent 450 on petrol via PhonePe'*\n" \
                f"• *'Paid 1200 for Swiggy food using HDFC'*\n" \
                f"• *'Received 85000 salary in HDFC Bank'*\n" \
                f"• *'What is my net worth?'*\n" \
                f"• *'How much did I spend this month?'*\n\n" \
                f"Your current Net Worth is **₹{net_worth:,.2f}** with a healthy savings rate of **{savings_rate:.1f}%**."

    return {
        "success": True,
        "type": "ADVICE",
        "message": reply,
        "parsed_data": {
            "net_worth": net_worth,
            "liquid_balance": total_balance,
            "investments": total_inv_val,
            "month_income": month_income,
            "month_expense": month_expense,
            "savings_rate": savings_rate
        }
    }

# ----------------------------------------------------------------------------
# HTTP REQUEST HANDLER
# ----------------------------------------------------------------------------
class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def _read_json(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length)
            return json.loads(body.decode('utf-8'))
        return {}

    def _send_json(self, data, status=200):
        self._set_headers(status, "application/json")
        self.wfile.write(json.dumps(data, default=str).encode('utf-8'))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Serve static frontend files if requested
        if path == "/" or path == "/index.html":
            self._serve_file(os.path.join(os.path.dirname(__file__), "..", "frontend", "index.html"), "text/html")
            return
        elif path.startswith("/css/"):
            self._serve_file(os.path.join(os.path.dirname(__file__), "..", "frontend", path.lstrip("/")), "text/css")
            return
        elif path.startswith("/js/"):
            self._serve_file(os.path.join(os.path.dirname(__file__), "..", "frontend", path.lstrip("/")), "application/javascript")
            return
        elif path == "/manifest.json":
            self._serve_file(os.path.join(os.path.dirname(__file__), "..", "frontend", "manifest.json"), "application/json")
            return
        elif path == "/sw.js":
            self._serve_file(os.path.join(os.path.dirname(__file__), "..", "frontend", "sw.js"), "application/javascript")
            return

        conn = get_db()
        cur = conn.cursor()

        try:
            if path == "/api/health":
                self._send_json({"status": "healthy", "service": "SAMEER'S MONEY MANAGER API", "time": datetime.datetime.now().isoformat()})

            elif path == "/api/user":
                user = cur.execute("SELECT * FROM users WHERE id = 1").fetchone()
                self._send_json(dict(user) if user else {})

            elif path == "/api/dashboard":
                # Master Financial Statistics Calculation
                accounts = [dict(r) for r in cur.execute("SELECT * FROM accounts WHERE is_active = 1").fetchall()]
                liquid_balance = sum(a['balance'] for a in accounts if a['account_type'] != 'CREDIT_CARD')
                credit_card_dues = sum(a['balance'] for a in accounts if a['account_type'] == 'CREDIT_CARD')
                
                # Monthly stats
                today = datetime.date.today()
                month_prefix = f"{today.year:04d}-{today.month:02d}"
                
                txs = [dict(r) for r in cur.execute("SELECT * FROM transactions WHERE transaction_date LIKE ?", (f"{month_prefix}%",)).fetchall()]
                total_income = sum(t['amount'] for t in txs if t['transaction_type'] == 'INCOME')
                total_expense = sum(t['amount'] for t in txs if t['transaction_type'] == 'EXPENSE')
                total_savings = total_income - total_expense

                # Investments
                inv_row = cur.execute("SELECT SUM(invested_amount) as total_inv, SUM(current_value) as total_cur FROM investments").fetchone()
                total_invested = inv_row['total_inv'] or 0.0
                total_investments = inv_row['total_cur'] or 0.0
                investment_profit = total_investments - total_invested

                # Receivables & Payables
                debts_given = cur.execute("SELECT SUM(pending_amount) as s FROM debts WHERE debt_type = 'GIVEN' AND status != 'SETTLED'").fetchone()['s'] or 0.0
                debts_taken = cur.execute("SELECT SUM(pending_amount) as s FROM debts WHERE debt_type = 'TAKEN' AND status != 'SETTLED'").fetchone()['s'] or 0.0

                # Strict Net Worth Formula
                net_worth = liquid_balance + total_investments + debts_given - debts_taken - credit_card_dues

                # Recent Transactions (last 10)
                recent_txs = [dict(r) for r in cur.execute("""
                    SELECT t.*, a.account_name, c.name as category_name, c.color_hex as category_color, c.icon as category_icon
                    FROM transactions t
                    LEFT JOIN accounts a ON t.account_id = a.id
                    LEFT JOIN categories c ON t.category_id = c.id
                    ORDER BY t.transaction_date DESC, t.id DESC
                    LIMIT 10
                """).fetchall()]

                # Category-wise Expense breakdown
                category_expenses = [dict(r) for r in cur.execute("""
                    SELECT c.name, c.color_hex, SUM(t.amount) as total
                    FROM transactions t
                    JOIN categories c ON t.category_id = c.id
                    WHERE t.transaction_type = 'EXPENSE' AND t.transaction_date LIKE ?
                    GROUP BY c.id
                    ORDER BY total DESC
                """, (f"{month_prefix}%",)).fetchall()]

                # Upcoming bills
                upcoming_bills = [dict(r) for r in cur.execute("""
                    SELECT * FROM recurring_payments 
                    WHERE is_active = 1 
                    ORDER BY next_due_date ASC 
                    LIMIT 5
                """).fetchall()]

                self._send_json({
                    "branding": {
                        "name": "SAMEER'S MONEY MANAGER",
                        "subtitle": "Personal Finance Control Center",
                        "tagline": "Your Money. Your Control. Your Future.",
                        "display_name": "SAMEER"
                    },
                    "summary": {
                        "total_balance": liquid_balance,
                        "available_balance": liquid_balance,
                        "total_income": total_income,
                        "total_expenses": total_expense,
                        "total_savings": total_savings,
                        "net_worth": net_worth,
                        "total_investments": total_investments,
                        "investment_profit": investment_profit,
                        "receivables": debts_given,
                        "payables": debts_taken,
                        "credit_card_dues": credit_card_dues
                    },
                    "accounts": accounts,
                    "recent_transactions": recent_txs,
                    "category_expenses": category_expenses,
                    "upcoming_bills": upcoming_bills
                })

            elif path == "/api/accounts":
                accounts = [dict(r) for r in cur.execute("SELECT * FROM accounts WHERE is_active = 1 ORDER BY id ASC").fetchall()]
                self._send_json(accounts)

            elif path == "/api/categories":
                c_type = query.get('type', [None])[0]
                if c_type:
                    cats = [dict(r) for r in cur.execute("SELECT * FROM categories WHERE type = ? ORDER BY name ASC", (c_type,)).fetchall()]
                else:
                    cats = [dict(r) for r in cur.execute("SELECT * FROM categories ORDER BY type ASC, name ASC").fetchall()]
                self._send_json(cats)

            elif path == "/api/transactions":
                # Master search & filters
                where_clauses = []
                params = []

                if 'type' in query:
                    where_clauses.append("t.transaction_type = ?")
                    params.append(query['type'][0])
                if 'account_id' in query:
                    where_clauses.append("t.account_id = ?")
                    params.append(query['account_id'][0])
                if 'category_id' in query:
                    where_clauses.append("t.category_id = ?")
                    params.append(query['category_id'][0])
                if 'search' in query:
                    q = f"%{query['search'][0]}%"
                    where_clauses.append("(t.payee_or_payer LIKE ? OR t.notes LIKE ? OR t.reference_number LIKE ?)")
                    params.extend([q, q, q])
                if 'from_date' in query:
                    where_clauses.append("t.transaction_date >= ?")
                    params.append(query['from_date'][0])
                if 'to_date' in query:
                    where_clauses.append("t.transaction_date <= ?")
                    params.append(query['to_date'][0])

                where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""
                sql = f"""
                    SELECT t.*, 
                           a.account_name, a.account_type,
                           da.account_name as destination_account_name,
                           c.name as category_name, c.color_hex as category_color, c.icon as category_icon
                    FROM transactions t
                    LEFT JOIN accounts a ON t.account_id = a.id
                    LEFT JOIN accounts da ON t.destination_account_id = da.id
                    LEFT JOIN categories c ON t.category_id = c.id
                    {where_sql}
                    ORDER BY t.transaction_date DESC, t.id DESC
                """
                txs = [dict(r) for r in cur.execute(sql, params).fetchall()]
                self._send_json(txs)

            elif path == "/api/debts":
                # Lending & Borrowing
                debts = [dict(r) for r in cur.execute("""
                    SELECT d.*, a.account_name
                    FROM debts d
                    LEFT JOIN accounts a ON d.account_id = a.id
                    ORDER BY d.due_date ASC, d.id DESC
                """).fetchall()]
                self._send_json(debts)

            elif path == "/api/savings-goals":
                goals = [dict(r) for r in cur.execute("SELECT * FROM savings_goals ORDER BY target_date ASC").fetchall()]
                self._send_json(goals)

            elif path == "/api/investments":
                invs = [dict(r) for r in cur.execute("SELECT * FROM investments ORDER BY current_value DESC").fetchall()]
                self._send_json(invs)

            elif path == "/api/recurring-payments":
                recurs = [dict(r) for r in cur.execute("""
                    SELECT r.*, c.name as category_name, a.account_name as default_account_name
                    FROM recurring_payments r
                    LEFT JOIN categories c ON r.category_id = c.id
                    LEFT JOIN accounts a ON r.default_account_id = a.id
                    ORDER BY r.next_due_date ASC
                """).fetchall()]
                self._send_json(recurs)

            elif path == "/api/calendar":
                # Returns daily totals for the requested month (or current month)
                year_month = query.get('month', [datetime.date.today().strftime('%Y-%m')])[0]
                rows = cur.execute("""
                    SELECT transaction_date,
                           SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as daily_income,
                           SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as daily_expense
                    FROM transactions
                    WHERE transaction_date LIKE ?
                    GROUP BY transaction_date
                """, (f"{year_month}%",)).fetchall()
                
                cal_data = {r['transaction_date']: {"income": r['daily_income'], "expense": r['daily_expense']} for r in rows}
                self._send_json(cal_data)

            elif path == "/api/reports":
                # Comprehensive financial report
                period = query.get('period', ['monthly'])[0]
                year = query.get('year', [str(datetime.date.today().year)])[0]
                
                # Monthly trends for given year
                trends = cur.execute("""
                    SELECT substr(transaction_date, 1, 7) as month_key,
                           SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as income,
                           SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as expense
                    FROM transactions
                    WHERE transaction_date LIKE ?
                    GROUP BY month_key
                    ORDER BY month_key ASC
                """, (f"{year}%",)).fetchall()

                # Category breakdown
                cat_summary = cur.execute("""
                    SELECT c.name, c.type, c.color_hex, SUM(t.amount) as total_amount, COUNT(t.id) as tx_count
                    FROM transactions t
                    JOIN categories c ON t.category_id = c.id
                    WHERE t.transaction_date LIKE ?
                    GROUP BY c.id
                    ORDER BY total_amount DESC
                """, (f"{year}%",)).fetchall()

                self._send_json({
                    "year": year,
                    "period": period,
                    "monthly_trends": [dict(r) for r in trends],
                    "category_summary": [dict(r) for r in cat_summary]
                })

            elif path == "/api/audit-logs":
                logs = [dict(r) for r in cur.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100").fetchall()]
                self._send_json(logs)

            elif path == "/api/backup/export":
                # Complete Database Export
                backup_data = {
                    "app": "SAMEER'S MONEY MANAGER",
                    "version": "1.0.0",
                    "exported_at": datetime.datetime.now().isoformat(),
                    "users": [dict(r) for r in cur.execute("SELECT * FROM users").fetchall()],
                    "accounts": [dict(r) for r in cur.execute("SELECT * FROM accounts").fetchall()],
                    "categories": [dict(r) for r in cur.execute("SELECT * FROM categories").fetchall()],
                    "transactions": [dict(r) for r in cur.execute("SELECT * FROM transactions").fetchall()],
                    "debts": [dict(r) for r in cur.execute("SELECT * FROM debts").fetchall()],
                    "debt_repayments": [dict(r) for r in cur.execute("SELECT * FROM debt_repayments").fetchall()],
                    "savings_goals": [dict(r) for r in cur.execute("SELECT * FROM savings_goals").fetchall()],
                    "investments": [dict(r) for r in cur.execute("SELECT * FROM investments").fetchall()],
                    "recurring_payments": [dict(r) for r in cur.execute("SELECT * FROM recurring_payments").fetchall()]
                }
                self._send_json(backup_data)

            else:
                self._send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json()

        conn = get_db()
        cur = conn.cursor()

        try:
            if path == "/api/ai/assistant":
                prompt = body.get('prompt', '')
                ai_res = ai_parse_command(prompt)
                self._send_json(ai_res)

            elif path == "/api/transactions":
                # Master Financial Rule Enforcement
                t_type = body.get('transaction_type')
                amount = float(body.get('amount', 0))
                acc_id = int(body.get('account_id'))
                dest_acc_id = body.get('destination_account_id')
                cat_id = body.get('category_id')
                t_date = body.get('transaction_date', datetime.date.today().isoformat())
                payee = body.get('payee_or_payer', '')
                notes = body.get('notes', '')
                mode = body.get('payment_mode', 'UPI')
                ref = body.get('reference_number', '')
                receipt = body.get('receipt_url', '')

                if amount <= 0:
                    self._send_json({"error": "Transaction amount must be strictly greater than zero."}, 400)
                    return

                # Atomic Balance Update based on Transaction Type
                if t_type == 'INCOME':
                    cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, acc_id))
                elif t_type == 'EXPENSE':
                    acc = cur.execute("SELECT account_type FROM accounts WHERE id = ?", (acc_id,)).fetchone()
                    if acc and acc['account_type'] == 'CREDIT_CARD':
                        # Credit card expense increases current outstanding payable
                        cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, acc_id))
                    else:
                        cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, acc_id))
                elif t_type == 'TRANSFER':
                    if not dest_acc_id or int(dest_acc_id) == acc_id:
                        self._send_json({"error": "Destination account must be selected and different from source account."}, 400)
                        return
                    cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, acc_id))
                    cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, int(dest_acc_id)))

                cur.execute("""
                    INSERT INTO transactions (account_id, destination_account_id, category_id, transaction_type, amount, transaction_date, payee_or_payer, notes, payment_mode, reference_number, receipt_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (acc_id, dest_acc_id, cat_id, t_type, amount, t_date, payee, notes, mode, ref, receipt))
                
                tx_id = cur.lastrowid
                conn.commit()

                log_audit("CREATE_TRANSACTION", "TRANSACTIONS", f"Created {t_type} tx #{tx_id} of ₹{amount:,.2f} on Account #{acc_id}")
                self._send_json({"success": True, "id": tx_id, "message": "Transaction recorded accurately with real-time balance update."})

            elif path == "/api/accounts":
                name = body.get('account_name')
                a_type = body.get('account_type', 'BANK')
                last4 = body.get('account_number_last4', '')
                inst = body.get('institution_name', '')
                bal = float(body.get('balance', 0))
                limit = float(body.get('credit_limit', 0))
                cycle = int(body.get('billing_cycle_day', 1))
                color = body.get('color_hex', '#001F54')
                icon = body.get('icon_name', 'landmark')

                cur.execute("""
                    INSERT INTO accounts (account_name, account_type, account_number_last4, institution_name, balance, credit_limit, billing_cycle_day, color_hex, icon_name)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (name, a_type, last4, inst, bal, limit, cycle, color, icon))
                acc_id = cur.lastrowid
                conn.commit()

                log_audit("CREATE_ACCOUNT", "ACCOUNTS", f"Created account '{name}' ({a_type}) with initial balance ₹{bal:,.2f}")
                self._send_json({"success": True, "id": acc_id, "message": "Account created successfully."})

            elif path == "/api/debts":
                # Create Lending or Borrowing record
                name = body.get('person_name')
                phone = body.get('phone_number', '')
                d_type = body.get('debt_type') # GIVEN or TAKEN
                amount = float(body.get('initial_amount', 0))
                g_date = body.get('given_or_taken_date', datetime.date.today().isoformat())
                due = body.get('due_date')
                acc_id = body.get('account_id')
                notes = body.get('notes', '')

                cur.execute("""
                    INSERT INTO debts (person_name, phone_number, debt_type, initial_amount, pending_amount, given_or_taken_date, due_date, account_id, notes, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
                """, (name, phone, d_type, amount, amount, g_date, due, acc_id, notes))
                debt_id = cur.lastrowid

                # Update linked account if specified
                if acc_id:
                    if d_type == 'GIVEN':
                        # Money Given reduces liquid balance
                        cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, acc_id))
                    elif d_type == 'TAKEN':
                        # Money Taken increases liquid cash/bank
                        cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, acc_id))

                conn.commit()
                log_audit("CREATE_DEBT", "DEBTS", f"Recorded {d_type} khata for {name} of ₹{amount:,.2f}")
                self._send_json({"success": True, "id": debt_id, "message": "Lending/Borrowing entry logged successfully."})

            elif path == "/api/debts/repay":
                # Repayment for debt
                debt_id = int(body.get('debt_id'))
                amount = float(body.get('amount', 0))
                acc_id = int(body.get('account_id'))
                r_date = body.get('repayment_date', datetime.date.today().isoformat())
                mode = body.get('payment_mode', 'UPI')
                notes = body.get('notes', '')

                debt = cur.execute("SELECT * FROM debts WHERE id = ?", (debt_id,)).fetchone()
                if not debt:
                    self._send_json({"error": "Debt record not found."}, 404)
                    return

                new_pending = max(0.0, debt['pending_amount'] - amount)
                new_status = 'SETTLED' if new_pending == 0 else 'PARTIALLY_PAID'

                cur.execute("UPDATE debts SET pending_amount = ?, status = ? WHERE id = ?", (new_pending, new_status, debt_id))
                cur.execute("""
                    INSERT INTO debt_repayments (debt_id, account_id, amount, repayment_date, payment_mode, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (debt_id, acc_id, amount, r_date, mode, notes))

                # Update liquid account balance
                if debt['debt_type'] == 'GIVEN':
                    # Received back money that was lent -> increases account
                    cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, acc_id))
                else:
                    # Repaid borrowed money -> decreases account
                    cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, acc_id))

                conn.commit()
                log_audit("DEBT_REPAYMENT", "DEBTS", f"Logged repayment of ₹{amount:,.2f} for debt #{debt_id} ({debt['person_name']})")
                self._send_json({"success": True, "pending_amount": new_pending, "status": new_status, "message": "Repayment recorded and balance recalculated."})

            elif path == "/api/savings-goals":
                name = body.get('goal_name')
                target = float(body.get('target_amount', 0))
                saved = float(body.get('current_saved', 0))
                t_date = body.get('target_date')
                icon = body.get('icon_name', 'target')
                color = body.get('color_hex', '#D4AF37')

                cur.execute("""
                    INSERT INTO savings_goals (goal_name, target_amount, current_saved, target_date, icon_name, color_hex)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (name, target, saved, t_date, icon, color))
                g_id = cur.lastrowid
                conn.commit()

                log_audit("CREATE_GOAL", "SAVINGS_GOALS", f"Created goal '{name}' target ₹{target:,.2f}")
                self._send_json({"success": True, "id": g_id, "message": "Savings goal registered."})

            elif path == "/api/savings-goals/deposit":
                goal_id = int(body.get('goal_id'))
                amount = float(body.get('amount', 0))
                acc_id = body.get('account_id')

                cur.execute("UPDATE savings_goals SET current_saved = current_saved + ? WHERE id = ?", (amount, goal_id))
                if acc_id:
                    cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, int(acc_id)))

                conn.commit()
                log_audit("DEPOSIT_GOAL", "SAVINGS_GOALS", f"Deposited ₹{amount:,.2f} to goal #{goal_id}")
                self._send_json({"success": True, "message": "Funds successfully deposited into savings goal."})

            elif path == "/api/investments":
                name = body.get('investment_name')
                a_type = body.get('asset_type', 'MUTUAL_FUND')
                inv_amt = float(body.get('invested_amount', 0))
                cur_val = float(body.get('current_value', inv_amt))
                units = body.get('units_or_shares')
                buy_price = body.get('buy_price_avg')
                cur_nav = body.get('current_nav_or_price')
                inv_date = body.get('investment_date', datetime.date.today().isoformat())
                sip_day = body.get('sip_day_of_month')
                notes = body.get('notes', '')

                cur.execute("""
                    INSERT INTO investments (investment_name, asset_type, invested_amount, current_value, units_or_shares, buy_price_avg, current_nav_or_price, investment_date, sip_day_of_month, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (name, a_type, inv_amt, cur_val, units, buy_price, cur_nav, inv_date, sip_day, notes))
                inv_id = cur.lastrowid
                conn.commit()

                log_audit("CREATE_INVESTMENT", "INVESTMENTS", f"Added investment '{name}' ({a_type}) invested: ₹{inv_amt:,.2f}")
                self._send_json({"success": True, "id": inv_id, "message": "Investment asset added to portfolio."})

            elif path == "/api/recurring-payments":
                title = body.get('title')
                cat_id = body.get('category_id')
                amount = float(body.get('amount', 0))
                freq = body.get('frequency', 'MONTHLY')
                due_day = int(body.get('due_day', 1))
                next_due = body.get('next_due_date')
                acc_id = body.get('default_account_id')
                auto_pay = 1 if body.get('is_auto_pay', True) else 0

                cur.execute("""
                    INSERT INTO recurring_payments (title, category_id, amount, frequency, due_day, next_due_date, default_account_id, is_auto_pay)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (title, cat_id, amount, freq, due_day, next_due, acc_id, auto_pay))
                r_id = cur.lastrowid
                conn.commit()

                log_audit("CREATE_RECURRING", "RECURRING_PAYMENTS", f"Scheduled recurring bill '{title}' ₹{amount:,.2f}")
                self._send_json({"success": True, "id": r_id, "message": "Recurring bill scheduled."})

            elif path == "/api/recurring-payments/pay":
                # Mark as paid: auto-creates an expense transaction & updates next_due_date by 1 month
                rec_id = int(body.get('id'))
                rec = cur.execute("SELECT * FROM recurring_payments WHERE id = ?", (rec_id,)).fetchone()
                if not rec:
                    self._send_json({"error": "Recurring bill not found."}, 404)
                    return

                acc_id = body.get('account_id') or rec['default_account_id'] or 1
                today_str = datetime.date.today().isoformat()

                # Deduct account & create expense
                cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (rec['amount'], acc_id))
                cur.execute("""
                    INSERT INTO transactions (account_id, category_id, transaction_type, amount, transaction_date, payee_or_payer, notes)
                    VALUES (?, ?, 'EXPENSE', ?, ?, ?, ?)
                """, (acc_id, rec['category_id'], rec['amount'], today_str, rec['title'], f"Automated recurring payment for {rec['title']}"))

                # Increment next due date by 30 days
                curr_date = datetime.datetime.strptime(rec['next_due_date'], '%Y-%m-%d').date()
                next_date = curr_date + datetime.timedelta(days=30)
                cur.execute("UPDATE recurring_payments SET next_due_date = ?, last_paid_date = ? WHERE id = ?", (next_date.isoformat(), today_str, rec_id))

                conn.commit()
                log_audit("PAY_RECURRING", "RECURRING_PAYMENTS", f"Paid recurring bill '{rec['title']}' ₹{rec['amount']:,.2f}")
                self._send_json({"success": True, "next_due_date": next_date.isoformat(), "message": "Bill marked as paid and expense logged."})

            elif path == "/api/backup/restore":
                # Restore backup data safely
                b_data = body
                if "accounts" in b_data:
                    for a in b_data["accounts"]:
                        cur.execute("INSERT OR REPLACE INTO accounts (id, account_name, account_type, account_number_last4, institution_name, balance, credit_limit, color_hex, icon_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                    (a['id'], a['account_name'], a['account_type'], a.get('account_number_last4'), a.get('institution_name'), a['balance'], a.get('credit_limit', 0), a.get('color_hex'), a.get('icon_name')))
                if "transactions" in b_data:
                    for t in b_data["transactions"]:
                        cur.execute("INSERT OR REPLACE INTO transactions (id, account_id, destination_account_id, category_id, transaction_type, amount, transaction_date, payee_or_payer, notes, payment_mode, reference_number, receipt_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                    (t['id'], t['account_id'], t.get('destination_account_id'), t.get('category_id'), t['transaction_type'], t['amount'], t['transaction_date'], t.get('payee_or_payer'), t.get('notes'), t.get('payment_mode'), t.get('reference_number'), t.get('receipt_url')))
                conn.commit()
                log_audit("RESTORE_BACKUP", "SYSTEM", "Restored database from JSON backup file.")
                self._send_json({"success": True, "message": "Database backup restored successfully."})

            else:
                self._send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        conn = get_db()
        cur = conn.cursor()

        try:
            if path == "/api/transactions":
                tx_id = int(query.get('id', [0])[0])
                tx = cur.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
                if not tx:
                    self._send_json({"error": "Transaction not found."}, 404)
                    return

                # Strict Financial Reverse Balance Update
                amt = tx['amount']
                acc_id = tx['account_id']
                t_type = tx['transaction_type']
                dest_acc_id = tx['destination_account_id']

                if t_type == 'INCOME':
                    cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amt, acc_id))
                elif t_type == 'EXPENSE':
                    acc = cur.execute("SELECT account_type FROM accounts WHERE id = ?", (acc_id,)).fetchone()
                    if acc and acc['account_type'] == 'CREDIT_CARD':
                        cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amt, acc_id))
                    else:
                        cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amt, acc_id))
                elif t_type == 'TRANSFER' and dest_acc_id:
                    cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amt, acc_id))
                    cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amt, dest_acc_id))

                cur.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
                conn.commit()
                log_audit("DELETE_TRANSACTION", "TRANSACTIONS", f"Deleted tx #{tx_id} of ₹{amt:,.2f} and reversed account balance.")
                self._send_json({"success": True, "message": "Transaction deleted and account balance recalculated accurately."})

            elif path == "/api/debts":
                debt_id = int(query.get('id', [0])[0])
                cur.execute("DELETE FROM debts WHERE id = ?", (debt_id,))
                conn.commit()
                log_audit("DELETE_DEBT", "DEBTS", f"Deleted debt #{debt_id}")
                self._send_json({"success": True, "message": "Debt record deleted."})

            elif path == "/api/savings-goals":
                goal_id = int(query.get('id', [0])[0])
                cur.execute("DELETE FROM savings_goals WHERE id = ?", (goal_id,))
                conn.commit()
                log_audit("DELETE_GOAL", "SAVINGS_GOALS", f"Deleted goal #{goal_id}")
                self._send_json({"success": True, "message": "Savings goal deleted."})

            elif path == "/api/investments":
                inv_id = int(query.get('id', [0])[0])
                cur.execute("DELETE FROM investments WHERE id = ?", (inv_id,))
                conn.commit()
                log_audit("DELETE_INVESTMENT", "INVESTMENTS", f"Deleted investment #{inv_id}")
                self._send_json({"success": True, "message": "Investment entry deleted."})

            elif path == "/api/recurring-payments":
                r_id = int(query.get('id', [0])[0])
                cur.execute("DELETE FROM recurring_payments WHERE id = ?", (r_id,))
                conn.commit()
                log_audit("DELETE_RECURRING", "RECURRING_PAYMENTS", f"Deleted recurring payment #{r_id}")
                self._send_json({"success": True, "message": "Recurring payment removed."})

            else:
                self._send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def _serve_file(self, file_path, content_type):
        if not os.path.exists(file_path):
            self._send_json({"error": "File not found"}, 404)
            return
        with open(file_path, "rb") as f:
            content = f.read()
        self._set_headers(200, content_type)
        self.wfile.write(content)

# ----------------------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------------------
def main():
    print("=" * 70)
    print("  SAMEER'S MONEY MANAGER - Personal Finance Control Center")
    print("  Your Money. Your Control. Your Future.")
    print("=" * 70)
    print("Initializing Database...")
    init_db()
    print("Database ready.")
    
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"Server online at: http://localhost:{PORT}")
    print(f"Open browser to: http://localhost:{PORT}")
    print("Press Ctrl+C to terminate.")
    print("=" * 70)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == '__main__':
    main()
