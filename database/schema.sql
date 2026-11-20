-- ============================================================================
-- SAMEER'S MONEY MANAGER - Personal Finance Control Center
-- Database Schema: MySQL 8.0+
-- Currency: Indian Rupee (INR - ₹)
-- Strict DECIMAL(15, 2) Precision for all financial amounts
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `sameer_money_manager` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `sameer_money_manager`;

-- ----------------------------------------------------------------------------
-- 1. USER PROFILE & AUTHENTICATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `display_name` VARCHAR(50) NOT NULL DEFAULT 'SAMEER',
    `pin_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100),
    `currency_symbol` VARCHAR(5) NOT NULL DEFAULT '₹',
    `currency_code` VARCHAR(5) NOT NULL DEFAULT 'INR',
    `monthly_budget_limit` DECIMAL(15, 2) DEFAULT 100000.00,
    `daily_spending_limit` DECIMAL(15, 2) DEFAULT 3000.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 2. ACCOUNTS (Bank, Cash, UPI, Cards)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `accounts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `account_name` VARCHAR(100) NOT NULL,
    `account_type` ENUM('BANK', 'CASH', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'WALLET') NOT NULL,
    `account_number_last4` VARCHAR(4),
    `institution_name` VARCHAR(100), -- e.g. HDFC, SBI, ICICI, Google Pay, PhonePe, Paytm
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `credit_limit` DECIMAL(15, 2) DEFAULT 0.00, -- For Credit Cards
    `billing_cycle_day` INT DEFAULT NULL,        -- Day of month for CC bill
    `color_hex` VARCHAR(20) DEFAULT '#001F54',
    `icon_name` VARCHAR(50) DEFAULT 'landmark',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_accounts` (`user_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES (Income & Expense)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `icon` VARCHAR(50) NOT NULL DEFAULT 'tag',
    `color_hex` VARCHAR(20) DEFAULT '#D4AF37',
    `monthly_budget` DECIMAL(15, 2) DEFAULT 0.00,
    `is_system_default` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_name_type` (`name`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 4. TRANSACTIONS (Master Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `account_id` BIGINT NOT NULL,
    `category_id` BIGINT NULL,
    `transaction_type` ENUM('INCOME', 'EXPENSE', 'TRANSFER', 'DEBT_GIVEN', 'DEBT_REPAYMENT_RECEIVED', 'DEBT_TAKEN', 'DEBT_REPAYMENT_MADE', 'INVESTMENT_BUY', 'INVESTMENT_SELL') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `transaction_date` DATE NOT NULL,
    `destination_account_id` BIGINT NULL, -- For TRANSFER type
    `payee_or_payer` VARCHAR(150),
    `notes` TEXT,
    `payment_mode` VARCHAR(50) DEFAULT 'UPI', -- UPI, NetBanking, DebitCard, CreditCard, Cash, Cheque
    `reference_number` VARCHAR(100),
    `receipt_url` VARCHAR(255),
    `is_recurring` BOOLEAN DEFAULT FALSE,
    `recurring_id` BIGINT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    INDEX `idx_tx_date` (`transaction_date`),
    INDEX `idx_tx_user_account` (`user_id`, `account_id`),
    INDEX `idx_tx_type` (`transaction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 5. LENDING & BORROWING (Khata / Receivables & Payables)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `debts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `person_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20),
    `debt_type` ENUM('GIVEN', 'TAKEN') NOT NULL, -- GIVEN = Money Given (Receivable), TAKEN = Money Taken (Payable)
    `initial_amount` DECIMAL(15, 2) NOT NULL,
    `pending_amount` DECIMAL(15, 2) NOT NULL,
    `given_or_taken_date` DATE NOT NULL,
    `due_date` DATE,
    `account_id` BIGINT, -- Linked account used for cashflow
    `notes` TEXT,
    `status` ENUM('PENDING', 'PARTIALLY_PAID', 'SETTLED', 'DEFAULTED') DEFAULT 'PENDING',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL,
    INDEX `idx_debt_status` (`status`, `debt_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `debt_repayments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `debt_id` BIGINT NOT NULL,
    `account_id` BIGINT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `repayment_date` DATE NOT NULL,
    `payment_mode` VARCHAR(50) DEFAULT 'UPI',
    `notes` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`debt_id`) REFERENCES `debts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 6. BUDGETS & CATEGORY LIMITS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `budgets` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `category_id` BIGINT NOT NULL,
    `month_year` VARCHAR(7) NOT NULL, -- YYYY-MM
    `allocated_amount` DECIMAL(15, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_category_month` (`category_id`, `month_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 7. SAVINGS GOALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `savings_goals` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `goal_name` VARCHAR(100) NOT NULL, -- e.g. Emergency Fund, Laptop, Bike, Travel, Personal
    `target_amount` DECIMAL(15, 2) NOT NULL,
    `current_saved` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `target_date` DATE,
    `icon_name` VARCHAR(50) DEFAULT 'target',
    `color_hex` VARCHAR(20) DEFAULT '#D4AF37',
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'ON_HOLD') DEFAULT 'IN_PROGRESS',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 8. INVESTMENTS PORTFOLIO
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `investments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `investment_name` VARCHAR(150) NOT NULL,
    `asset_type` ENUM('MUTUAL_FUND', 'SIP', 'STOCKS', 'GOLD', 'FIXED_DEPOSIT', 'PPF', 'CRYPTO', 'OTHER') NOT NULL,
    `invested_amount` DECIMAL(15, 2) NOT NULL,
    `current_value` DECIMAL(15, 2) NOT NULL,
    `units_or_shares` DECIMAL(15, 4) DEFAULT NULL,
    `buy_price_avg` DECIMAL(15, 2) DEFAULT NULL,
    `current_nav_or_price` DECIMAL(15, 2) DEFAULT NULL,
    `investment_date` DATE NOT NULL,
    `linked_account_id` BIGINT NULL,
    `sip_day_of_month` INT DEFAULT NULL,
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`linked_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL,
    INDEX `idx_asset_type` (`asset_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 9. RECURRING PAYMENTS & BILL REMINDERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `recurring_payments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `title` VARCHAR(150) NOT NULL, -- e.g. Rent, Electricity, Internet, Mobile Recharge, Gym, EMI, Netflix
    `category_id` BIGINT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    `due_day` INT NOT NULL, -- Day of month (1-31)
    `next_due_date` DATE NOT NULL,
    `default_account_id` BIGINT NULL,
    `is_auto_pay` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_paid_date` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`default_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 10. AUDIT LOG & ACTIVITY HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL DEFAULT 1,
    `action` VARCHAR(100) NOT NULL, -- e.g. CREATE_TRANSACTION, UPDATE_BALANCE, TRANSFER_FUNDS
    `module` VARCHAR(50) NOT NULL,  -- TRANSACTIONS, ACCOUNTS, DEBT, GOALS, INVESTMENTS
    `details` TEXT,
    `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SEED DATA FOR SAMEER'S FINANCIAL ENVIRONMENT
-- ============================================================================

INSERT INTO `users` (`id`, `username`, `display_name`, `pin_hash`, `email`, `currency_symbol`, `currency_code`, `monthly_budget_limit`, `daily_spending_limit`)
VALUES (1, 'sameer', 'SAMEER', '1234', 'sameer@moneymanager.local', '₹', 'INR', 120000.00, 4000.00)
ON DUPLICATE KEY UPDATE `display_name`='SAMEER';

-- Default Categories (Income & Expense)
INSERT INTO `categories` (`name`, `type`, `icon`, `color_hex`, `monthly_budget`) VALUES
-- Income Categories
('Salary', 'INCOME', 'briefcase', '#10B981', 0),
('Bonus', 'INCOME', 'award', '#34D399', 0),
('Incentives', 'INCOME', 'trending-up', '#059669', 0),
('Freelancing', 'INCOME', 'laptop', '#047857', 0),
('Business Income', 'INCOME', 'building', '#065F46', 0),
('Gifts', 'INCOME', 'gift', '#6EE7B7', 0),
('Refunds', 'INCOME', 'rotate-ccw', '#A7F3D0', 0),
('Other Income', 'INCOME', 'plus-circle', '#3B82F6', 0),

-- Expense Categories
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
ON DUPLICATE KEY UPDATE `icon`=VALUES(`icon`);

-- Default Accounts for SAMEER
INSERT INTO `accounts` (`id`, `user_id`, `account_name`, `account_type`, `account_number_last4`, `institution_name`, `balance`, `credit_limit`, `color_hex`, `icon_name`) VALUES
(1, 1, 'HDFC Salary Account', 'BANK', '4821', 'HDFC Bank', 142500.00, 0.00, '#004c8f', 'landmark'),
(2, 1, 'SBI Savings Account', 'BANK', '9103', 'State Bank of India', 68200.00, 0.00, '#1a365d', 'landmark'),
(3, 1, 'ICICI Direct Account', 'BANK', '3341', 'ICICI Bank', 35000.00, 0.00, '#7c2d12', 'landmark'),
(4, 1, 'Cash Wallet', 'CASH', NULL, 'Physical Cash', 12400.00, 0.00, '#065f46', 'wallet'),
(5, 1, 'Google Pay UPI', 'UPI', '4821', 'Google Pay (HDFC)', 0.00, 0.00, '#1d4ed8', 'smartphone'),
(6, 1, 'PhonePe UPI', 'UPI', '9103', 'PhonePe (SBI)', 0.00, 0.00, '#6d28d9', 'smartphone'),
(7, 1, 'Paytm Wallet', 'WALLET', '8872', 'Paytm', 3250.00, 0.00, '#0369a1', 'wallet'),
(8, 1, 'HDFC Regalia Gold Credit Card', 'CREDIT_CARD', '6142', 'HDFC Bank', 18450.00, 300000.00, '#854d0e', 'credit-card')
ON DUPLICATE KEY UPDATE `account_name`=VALUES(`account_name`);

-- Default Savings Goals for SAMEER
INSERT INTO `savings_goals` (`goal_name`, `target_amount`, `current_saved`, `target_date`, `icon_name`, `color_hex`) VALUES
('Emergency Fund (6 Months)', 300000.00, 180000.00, '2026-12-31', 'shield', '#D4AF37'),
('New MacBook Pro / Laptop', 180000.00, 95000.00, '2026-08-15', 'laptop', '#3B82F6'),
('Bike (Royal Enfield Hunter)', 220000.00, 110000.00, '2026-11-30', 'bike', '#EF4444'),
('Europe Travel Trip', 250000.00, 60000.00, '2027-04-10', 'plane', '#10B981'),
('Personal Long-term Wealth', 1000000.00, 340000.00, '2028-12-31', 'gem', '#8B5CF6');

-- Default Investments Portfolio for SAMEER
INSERT INTO `investments` (`investment_name`, `asset_type`, `invested_amount`, `current_value`, `units_or_shares`, `buy_price_avg`, `current_nav_or_price`, `investment_date`, `sip_day_of_month`, `notes`) VALUES
('Parag Parikh Flexi Cap Fund', 'MUTUAL_FUND', 120000.00, 148500.00, 1856.25, 64.65, 80.00, '2025-01-10', 5, 'Monthly SIP on 5th'),
('Mirae Asset Large Cap Fund', 'MUTUAL_FUND', 80000.00, 94200.00, 897.14, 89.17, 105.00, '2025-02-15', 10, 'Monthly SIP on 10th'),
('HDFC Bank Shares (NSE)', 'STOCKS', 75000.00, 86400.00, 50.00, 1500.00, 1728.00, '2025-03-01', NULL, 'Bluechip equity holding'),
('TCS Shares (NSE)', 'STOCKS', 60000.00, 69800.00, 18.00, 3333.33, 3877.77, '2025-03-20', NULL, 'IT sector giant'),
('Sovereign Gold Bond (SGB 2026)', 'GOLD', 100000.00, 132000.00, 20.00, 5000.00, 6600.00, '2024-06-15', NULL, '2.5% semi-annual interest'),
('HDFC Cumulative Fixed Deposit', 'FIXED_DEPOSIT', 150000.00, 162750.00, 1.00, 150000.00, 162750.00, '2025-01-01', NULL, '7.25% p.a. interest'),
('Public Provident Fund (PPF)', 'PPF', 150000.00, 168000.00, 1.00, 150000.00, 168000.00, '2024-04-05', NULL, 'Tax-free sovereign guaranteed');

-- Default Recurring Payments for SAMEER
INSERT INTO `recurring_payments` (`title`, `category_id`, `amount`, `frequency`, `due_day`, `next_due_date`, `default_account_id`, `is_auto_pay`) VALUES
('Apartment House Rent', 13, 22000.00, 'MONTHLY', 1, '2026-12-01', 1, TRUE),
('Airtel Fiber Broadband', 10, 1179.00, 'MONTHLY', 12, '2026-12-12', 1, TRUE),
('Electricity Bill (BESCOM)', 13, 2450.00, 'MONTHLY', 18, '2026-12-18', 1, FALSE),
('Gold Gym Membership', 6, 2500.00, 'MONTHLY', 5, '2026-12-05', 1, TRUE),
('Netflix Premium 4K', 12, 649.00, 'MONTHLY', 20, '2026-12-20', 8, TRUE),
('Spotify Duo', 12, 149.00, 'MONTHLY', 24, '2026-12-24', 8, TRUE),
('Jio Mobile Postpaid', 9, 471.00, 'MONTHLY', 15, '2026-12-15', 5, TRUE);

-- Lending & Borrowing (Khata)
INSERT INTO `debts` (`person_name`, `phone_number`, `debt_type`, `initial_amount`, `pending_amount`, `given_or_taken_date`, `due_date`, `notes`, `status`) VALUES
('Rahul Sharma', '+91 98765 43210', 'GIVEN', 25000.00, 15000.00, '2026-10-15', '2026-12-15', 'Emergency loan given for laptop repair; repaid 10k', 'PARTIALLY_PAID'),
('Amit Verma', '+91 98111 22334', 'GIVEN', 12000.00, 12000.00, '2026-11-02', '2026-12-05', 'Trip advance share pending to receive', 'PENDING'),
('Vikram Uncle', '+91 99000 88776', 'TAKEN', 50000.00, 20000.00, '2026-08-10', '2026-12-31', 'Personal short term borrowing; 30k repaid', 'PARTIALLY_PAID');
