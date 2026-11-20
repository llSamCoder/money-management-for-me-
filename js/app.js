/**
 * SAMEER'S MONEY MANAGER - Personal Finance Control Center
 * Single-Page React Application
 * Branding: SAMEER'S MONEY MANAGER | Personal Finance Control Center | "Your Money. Your Control. Your Future."
 */

const { useState, useEffect, useMemo, useRef } = React;

// ----------------------------------------------------------------------------
// UTILITY HELPERS & INDIAN FINANCIAL FORMATTING
// ----------------------------------------------------------------------------
const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian Rupee grouping (last 3 digits, then pairs of 2)
  if (integerPart.length > 3) {
    const last3 = integerPart.substring(integerPart.length - 3);
    const rest = integerPart.substring(0, integerPart.length - 3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = withCommas + ',' + last3;
  }
  return (isNegative ? '-₹' : '₹') + integerPart + '.' + decimalPart;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// ----------------------------------------------------------------------------
// INITIAL SEED DATA FOR OFFLINE-FIRST RELIABILITY
// ----------------------------------------------------------------------------
const SEED_DATA = {
  user: {
    displayName: 'SAMEER',
    currency: '₹',
    monthlyBudgetLimit: 120000,
    dailySpendingLimit: 4000
  },
  accounts: [
    { id: 1, name: 'HDFC Salary Account', type: 'BANK', last4: '4821', institution: 'HDFC Bank', balance: 142500, creditLimit: 0, color: '#004c8f', icon: 'landmark' },
    { id: 2, name: 'SBI Savings Account', type: 'BANK', last4: '9103', institution: 'State Bank of India', balance: 68200, creditLimit: 0, color: '#1a365d', icon: 'landmark' },
    { id: 3, name: 'ICICI Direct Account', type: 'BANK', last4: '3341', institution: 'ICICI Bank', balance: 35000, creditLimit: 0, color: '#7c2d12', icon: 'landmark' },
    { id: 4, name: 'Cash Wallet', type: 'CASH', last4: '', institution: 'Physical Cash', balance: 12400, creditLimit: 0, color: '#065f46', icon: 'wallet' },
    { id: 5, name: 'Google Pay UPI', type: 'UPI', last4: '4821', institution: 'Google Pay (HDFC)', balance: 0, creditLimit: 0, color: '#1d4ed8', icon: 'smartphone' },
    { id: 6, name: 'PhonePe UPI', type: 'UPI', last4: '9103', institution: 'PhonePe (SBI)', balance: 0, creditLimit: 0, color: '#6d28d9', icon: 'smartphone' },
    { id: 7, name: 'Paytm Wallet', type: 'WALLET', last4: '8872', institution: 'Paytm', balance: 3250, creditLimit: 0, color: '#0369a1', icon: 'wallet' },
    { id: 8, name: 'HDFC Regalia Gold Credit Card', type: 'CREDIT_CARD', last4: '6142', institution: 'HDFC Bank', balance: 18450, creditLimit: 300000, color: '#854d0e', icon: 'credit-card', billingDay: 20 }
  ],
  categories: [
    { id: 1, name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#10B981', budget: 0 },
    { id: 2, name: 'Bonus', type: 'INCOME', icon: 'award', color: '#34D399', budget: 0 },
    { id: 3, name: 'Incentives', type: 'INCOME', icon: 'trending-up', color: '#059669', budget: 0 },
    { id: 4, name: 'Freelancing', type: 'INCOME', icon: 'laptop', color: '#047857', budget: 0 },
    { id: 5, name: 'Business Income', type: 'INCOME', icon: 'building', color: '#065F46', budget: 0 },
    { id: 6, name: 'Gifts', type: 'INCOME', icon: 'gift', color: '#6EE7B7', budget: 0 },
    { id: 7, name: 'Refunds', type: 'INCOME', icon: 'rotate-ccw', color: '#A7F3D0', budget: 0 },
    { id: 8, name: 'Other Income', type: 'INCOME', icon: 'plus-circle', color: '#3B82F6', budget: 0 },

    { id: 9, name: 'Food', type: 'EXPENSE', icon: 'utensils', color: '#F59E0B', budget: 15000 },
    { id: 10, name: 'Travel', type: 'EXPENSE', icon: 'plane', color: '#3B82F6', budget: 8000 },
    { id: 11, name: 'Petrol', type: 'EXPENSE', icon: 'fuel', color: '#EF4444', budget: 6000 },
    { id: 12, name: 'Shopping', type: 'EXPENSE', icon: 'shopping-bag', color: '#EC4899', budget: 10000 },
    { id: 13, name: 'Clothes', type: 'EXPENSE', icon: 'shirt', color: '#8B5CF6', budget: 5000 },
    { id: 14, name: 'Gym', type: 'EXPENSE', icon: 'dumbbell', color: '#10B981', budget: 2500 },
    { id: 15, name: 'Health', type: 'EXPENSE', icon: 'activity', color: '#06B6D4', budget: 4000 },
    { id: 16, name: 'Education', type: 'EXPENSE', icon: 'book-open', color: '#6366F1', budget: 5000 },
    { id: 17, name: 'Mobile Recharge', type: 'EXPENSE', icon: 'smartphone', color: '#14B8A6', budget: 1000 },
    { id: 18, name: 'Internet', type: 'EXPENSE', icon: 'wifi', color: '#0284C7', budget: 1500 },
    { id: 19, name: 'Family', type: 'EXPENSE', icon: 'users', color: '#F97316', budget: 15000 },
    { id: 20, name: 'Entertainment', type: 'EXPENSE', icon: 'film', color: '#D946EF', budget: 4000 },
    { id: 21, name: 'Bills', type: 'EXPENSE', icon: 'file-text', color: '#64748B', budget: 8000 },
    { id: 22, name: 'Other Expenses', type: 'EXPENSE', icon: 'credit-card', color: '#94A3B8', budget: 5000 }
  ],
  transactions: [
    { id: 1, accountId: 1, destAccountId: null, categoryId: 1, type: 'INCOME', amount: 125000, date: '2026-11-18', payee: 'Tech Corp India Ltd', notes: 'Monthly Software Engineer Salary Credit', mode: 'NetBanking', ref: 'HDFC-TXN-99881' },
    { id: 2, accountId: 1, destAccountId: null, categoryId: 9, type: 'EXPENSE', amount: 840, date: '2026-11-19', payee: 'Swiggy', notes: 'Dinner order - Gourmet Burger & Drink', mode: 'UPI', ref: 'UPI-SWG-77123' },
    { id: 3, accountId: 1, destAccountId: null, categoryId: 11, type: 'EXPENSE', amount: 2200, date: '2026-11-18', payee: 'Shell Petrol Pump', notes: 'Fuel refill for car', mode: 'UPI', ref: 'UPI-PET-4411' },
    { id: 4, accountId: 1, destAccountId: null, categoryId: 10, type: 'EXPENSE', amount: 3450, date: '2026-11-19', payee: 'MakeMyTrip', notes: 'Weekend flight ticket booking', mode: 'UPI', ref: 'UPI-MMT-8821' },
    { id: 5, accountId: 1, destAccountId: 4, categoryId: null, type: 'TRANSFER', amount: 5000, date: '2026-11-19', payee: 'ATM Withdrawal', notes: 'Withdrew cash for emergency wallet', mode: 'Cash', ref: 'ATM-HDFC-91' },
    { id: 6, accountId: 1, destAccountId: null, categoryId: 4, type: 'INCOME', amount: 35000, date: '2026-11-17', payee: 'Client Apex Systems', notes: 'Freelance Frontend Dashboard Milestone', mode: 'NetBanking', ref: 'NEFT-APEX-101' },
    { id: 7, accountId: 8, destAccountId: null, categoryId: 12, type: 'EXPENSE', amount: 4890, date: '2026-11-16', payee: 'Amazon India', notes: 'Ergonomic Desk Accessories & Cable Organizers', mode: 'CreditCard', ref: 'AMZN-9921' }
  ],
  debts: [
    { id: 1, person: 'Rahul Sharma', phone: '+91 98765 43210', type: 'GIVEN', initialAmount: 25000, pendingAmount: 15000, date: '2026-10-15', dueDate: '2026-12-15', accountId: 1, notes: 'Emergency loan given for laptop repair; repaid 10k', status: 'PARTIALLY_PAID' },
    { id: 2, person: 'Amit Verma', phone: '+91 98111 22334', type: 'GIVEN', initialAmount: 12000, pendingAmount: 12000, date: '2026-11-02', dueDate: '2026-12-05', accountId: 1, notes: 'Trip advance share pending to receive', status: 'PENDING' },
    { id: 3, person: 'Vikram Uncle', phone: '+91 99000 88776', type: 'TAKEN', initialAmount: 50000, pendingAmount: 20000, date: '2026-08-10', dueDate: '2026-12-31', accountId: 1, notes: 'Personal short term borrowing; 30k repaid', status: 'PARTIALLY_PAID' }
  ],
  savingsGoals: [
    { id: 1, name: 'Emergency Fund (6 Months)', target: 300000, saved: 180000, date: '2026-12-31', icon: 'shield', color: '#D4AF37' },
    { id: 2, name: 'New MacBook Pro / Laptop', target: 180000, saved: 95000, date: '2026-08-15', icon: 'laptop', color: '#3B82F6' },
    { id: 3, name: 'Bike (Royal Enfield Hunter)', target: 220000, saved: 110000, date: '2026-11-30', icon: 'bike', color: '#EF4444' },
    { id: 4, name: 'Europe Travel Trip', target: 250000, saved: 60000, date: '2027-04-10', icon: 'plane', color: '#10B981' },
    { id: 5, name: 'Personal Long-term Wealth', target: 1000000, saved: 340000, date: '2028-12-31', icon: 'gem', color: '#8B5CF6' }
  ],
  investments: [
    { id: 1, name: 'Parag Parikh Flexi Cap Fund', type: 'MUTUAL_FUND', invested: 120000, current: 148500, units: 1856.25, buyPrice: 64.65, nav: 80.00, date: '2025-01-10', sipDay: 5, notes: 'Monthly SIP on 5th' },
    { id: 2, name: 'Mirae Asset Large Cap Fund', type: 'MUTUAL_FUND', invested: 80000, current: 94200, units: 897.14, buyPrice: 89.17, nav: 105.00, date: '2025-02-15', sipDay: 10, notes: 'Monthly SIP on 10th' },
    { id: 3, name: 'HDFC Bank Shares (NSE)', type: 'STOCKS', invested: 75000, current: 86400, units: 50, buyPrice: 1500, nav: 1728, date: '2025-03-01', notes: 'Bluechip equity holding' },
    { id: 4, name: 'TCS Shares (NSE)', type: 'STOCKS', invested: 60000, current: 69800, units: 18, buyPrice: 3333.33, nav: 3877.77, date: '2025-03-20', notes: 'IT sector giant' },
    { id: 5, name: 'Sovereign Gold Bond (SGB 2026)', type: 'GOLD', invested: 100000, current: 132000, units: 20, buyPrice: 5000, nav: 6600, date: '2024-06-15', notes: '2.5% semi-annual interest' },
    { id: 6, name: 'HDFC Cumulative Fixed Deposit', type: 'FIXED_DEPOSIT', invested: 150000, current: 162750, units: 1, buyPrice: 150000, nav: 162750, date: '2025-01-01', notes: '7.25% p.a. interest' },
    { id: 7, name: 'Public Provident Fund (PPF)', type: 'PPF', invested: 150000, current: 168000, units: 1, buyPrice: 150000, nav: 168000, date: '2024-04-05', notes: 'Tax-free sovereign guaranteed' }
  ],
  recurring: [
    { id: 1, title: 'Apartment House Rent', categoryId: 21, amount: 22000, dueDay: 1, nextDueDate: '2026-12-01', accountId: 1, isAutoPay: true },
    { id: 2, title: 'Airtel Fiber Broadband', categoryId: 18, amount: 1179, dueDay: 12, nextDueDate: '2026-12-12', accountId: 1, isAutoPay: true },
    { id: 3, title: 'Electricity Bill (BESCOM)', categoryId: 21, amount: 2450, dueDay: 18, nextDueDate: '2026-12-18', accountId: 1, isAutoPay: false },
    { id: 4, title: 'Gold Gym Membership', categoryId: 14, amount: 2500, dueDay: 5, nextDueDate: '2026-12-05', accountId: 1, isAutoPay: true },
    { id: 5, title: 'Netflix Premium 4K', categoryId: 20, amount: 649, dueDay: 20, nextDueDate: '2026-12-20', accountId: 8, isAutoPay: true },
    { id: 6, title: 'Spotify Duo', categoryId: 20, amount: 149, dueDay: 24, nextDueDate: '2026-12-24', accountId: 8, isAutoPay: true },
    { id: 7, title: 'Jio Mobile Postpaid', categoryId: 17, amount: 471, dueDay: 15, nextDueDate: '2026-12-15', accountId: 5, isAutoPay: true }
  ]
};

// ----------------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------------
function App() {
  // Master State with LocalStorage Persistence
  const [user] = useState(() => {
    const saved = localStorage.getItem('smm_user');
    return saved ? JSON.parse(saved) : SEED_DATA.user;
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('smm_accounts');
    return saved ? JSON.parse(saved) : SEED_DATA.accounts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('smm_categories');
    return saved ? JSON.parse(saved) : SEED_DATA.categories;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('smm_transactions');
    return saved ? JSON.parse(saved) : SEED_DATA.transactions;
  });

  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('smm_debts');
    return saved ? JSON.parse(saved) : SEED_DATA.debts;
  });

  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('smm_goals');
    return saved ? JSON.parse(saved) : SEED_DATA.savingsGoals;
  });

  const [investments, setInvestments] = useState(() => {
    const saved = localStorage.getItem('smm_investments');
    return saved ? JSON.parse(saved) : SEED_DATA.investments;
  });

  const [recurring, setRecurring] = useState(() => {
    const saved = localStorage.getItem('smm_recurring');
    return saved ? JSON.parse(saved) : SEED_DATA.recurring;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('smm_audit');
    return saved ? JSON.parse(saved) : [
      { id: 1, action: 'SESSION_INIT', module: 'SECURITY', details: 'Sameer authenticated into Personal Finance Terminal', timestamp: new Date().toISOString() }
    ];
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Online / Offline Status Detection
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Welcome Screen Requirement: "application open karte hi mera naam aaye welcome sameer"
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(true);

  // Modals
  const [modalType, setModalType] = useState(null); // 'add-tx', 'add-account', 'add-debt', 'repay-debt', 'add-goal', 'deposit-goal', 'add-investment', 'add-recurring', 'ai-entry'
  const [activeModalData, setActiveModalData] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterAccount, setFilterAccount] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // AI Assistant Chat Messages
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      sender: 'ai',
      text: "Welcome Sameer! I am your AI Money Assistant. You can speak or type your natural expense/income entries (e.g., 'Spent 650 on petrol via PhonePe' or 'Received 45000 freelance in HDFC') or ask me any question about your net worth, savings, and portfolio performance."
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Notifications Bell
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Save to LocalStorage on updates
  useEffect(() => { localStorage.setItem('smm_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('smm_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('smm_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('smm_debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('smm_goals', JSON.stringify(savingsGoals)); }, [savingsGoals]);
  useEffect(() => { localStorage.setItem('smm_investments', JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem('smm_recurring', JSON.stringify(recurring)); }, [recurring]);
  useEffect(() => { localStorage.setItem('smm_audit', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Try syncing with backend API if running
  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data && data.accounts) {
          // Connected to live Python REST API
          console.log("Connected to Sameer's REST API backend.");
        }
      })
      .catch(() => {
        // Runs cleanly on local storage engine
      });
  }, []);

  // Initialize Lucide icons on DOM updates
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // --------------------------------------------------------------------------
  // MASTER FINANCIAL CALCULATIONS & STRICT RULE ENFORCEMENT
  // --------------------------------------------------------------------------
  const financials = useMemo(() => {
    // 1. Liquid Balances (Bank Accounts + Cash + Wallets)
    const liquidBalance = accounts
      .filter(a => a.type !== 'CREDIT_CARD')
      .reduce((acc, curr) => acc + Number(curr.balance), 0);

    // 2. Credit Card Outstanding Dues
    const creditCardDues = accounts
      .filter(a => a.type === 'CREDIT_CARD')
      .reduce((acc, curr) => acc + Number(curr.balance), 0);

    // 3. Investments Total Value & Profit
    const totalInvested = investments.reduce((acc, curr) => acc + Number(curr.invested), 0);
    const totalInvestments = investments.reduce((acc, curr) => acc + Number(curr.current), 0);
    const investmentProfit = totalInvestments - totalInvested;

    // 4. Receivables (Money Given) & Payables (Money Taken)
    const receivables = debts
      .filter(d => d.type === 'GIVEN' && d.status !== 'SETTLED')
      .reduce((acc, curr) => acc + Number(curr.pendingAmount), 0);

    const payables = debts
      .filter(d => d.type === 'TAKEN' && d.status !== 'SETTLED')
      .reduce((acc, curr) => acc + Number(curr.pendingAmount), 0);

    // 5. Total Net Worth
    // Strict Net Worth Formula: Liquid + Investments + Receivables - Payables - Credit Card Dues
    const netWorth = liquidBalance + totalInvestments + receivables - payables - creditCardDues;

    // 6. Current Month Income, Expenses & Savings
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthTxs = transactions.filter(t => t.date && t.date.startsWith(currentMonthKey));
    const totalIncome = monthTxs
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const totalExpenses = monthTxs
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;

    // 7. Budget & Daily Spending Limit Calculation
    const monthlyBudget = user.monthlyBudgetLimit || 120000;
    const remainingBudget = Math.max(0, monthlyBudget - totalExpenses);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);
    const dynamicDailyLimit = remainingBudget / daysRemaining;

    // Overspending Alert Flag
    const budgetUsedPercent = (totalExpenses / monthlyBudget) * 100;
    const isOverBudget = totalExpenses > monthlyBudget;
    const isNearBudgetLimit = budgetUsedPercent >= 85 && !isOverBudget;

    return {
      liquidBalance,
      creditCardDues,
      totalInvested,
      totalInvestments,
      investmentProfit,
      receivables,
      payables,
      netWorth,
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      monthlyBudget,
      remainingBudget,
      dynamicDailyLimit,
      budgetUsedPercent,
      isOverBudget,
      isNearBudgetLimit
    };
  }, [accounts, transactions, debts, investments, user]);

  // --------------------------------------------------------------------------
  // AUDIT LOG RECORDER
  // --------------------------------------------------------------------------
  const logAudit = (action, module, details) => {
    const entry = {
      id: Date.now(),
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [entry, ...prev].slice(0, 100));
  };

  // --------------------------------------------------------------------------
  // TRANSACTION CREATION (ATOMIC BALANCES & ZERO DOUBLE-COUNTING)
  // --------------------------------------------------------------------------
  const handleAddTransaction = (txData) => {
    const amount = Number(txData.amount);
    if (!amount || amount <= 0) return alert('Please enter a valid positive amount.');

    const newTx = {
      id: Date.now(),
      accountId: Number(txData.accountId),
      destAccountId: txData.destAccountId ? Number(txData.destAccountId) : null,
      categoryId: txData.categoryId ? Number(txData.categoryId) : null,
      type: txData.type,
      amount: amount,
      date: txData.date || new Date().toISOString().split('T')[0],
      payee: txData.payee || '',
      notes: txData.notes || '',
      mode: txData.mode || 'UPI',
      ref: txData.ref || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      receiptUrl: txData.receiptUrl || null
    };

    // Apply strict balance updates to accounts
    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        // Income adds to account
        if (newTx.type === 'INCOME' && acc.id === newTx.accountId) {
          return { ...acc, balance: Number(acc.balance) + amount };
        }
        // Expense handling
        if (newTx.type === 'EXPENSE' && acc.id === newTx.accountId) {
          if (acc.type === 'CREDIT_CARD') {
            // Increases credit card balance (payable debt)
            return { ...acc, balance: Number(acc.balance) + amount };
          } else {
            // Decreases liquid account balance
            return { ...acc, balance: Number(acc.balance) - amount };
          }
        }
        // Transfer handling (atomic)
        if (newTx.type === 'TRANSFER') {
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: Number(acc.balance) - amount };
          }
          if (acc.id === newTx.destAccountId) {
            return { ...acc, balance: Number(acc.balance) + amount };
          }
        }
        return acc;
      });
    });

    setTransactions(prev => [newTx, ...prev]);
    logAudit('CREATE_TRANSACTION', 'TRANSACTIONS', `Created ${newTx.type} transaction of ${formatINR(amount)} on Account #${newTx.accountId}`);
    setModalType(null);
  };

  // --------------------------------------------------------------------------
  // TRANSACTION DELETION (REVERSES BALANCES ACCURATELY)
  // --------------------------------------------------------------------------
  const handleDeleteTransaction = (txId) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    if (!confirm(`Are you sure you want to delete this transaction of ${formatINR(tx.amount)}? Account balance will be reversed.`)) return;

    const amount = Number(tx.amount);

    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        // Reverse income
        if (tx.type === 'INCOME' && acc.id === tx.accountId) {
          return { ...acc, balance: Number(acc.balance) - amount };
        }
        // Reverse expense
        if (tx.type === 'EXPENSE' && acc.id === tx.accountId) {
          if (acc.type === 'CREDIT_CARD') {
            return { ...acc, balance: Number(acc.balance) - amount };
          } else {
            return { ...acc, balance: Number(acc.balance) + amount };
          }
        }
        // Reverse transfer
        if (tx.type === 'TRANSFER') {
          if (acc.id === tx.accountId) {
            return { ...acc, balance: Number(acc.balance) + amount };
          }
          if (acc.id === tx.destAccountId) {
            return { ...acc, balance: Number(acc.balance) - amount };
          }
        }
        return acc;
      });
    });

    setTransactions(prev => prev.filter(t => t.id !== txId));
    logAudit('DELETE_TRANSACTION', 'TRANSACTIONS', `Deleted tx #${txId} of ${formatINR(amount)} and reversed balance.`);
  };

  // --------------------------------------------------------------------------
  // LENDING & BORROWING (KHATA ACTIONS)
  // --------------------------------------------------------------------------
  const handleAddDebt = (debtData) => {
    const amount = Number(debtData.amount);
    const newDebt = {
      id: Date.now(),
      person: debtData.person,
      phone: debtData.phone || '',
      type: debtData.type, // GIVEN or TAKEN
      initialAmount: amount,
      pendingAmount: amount,
      date: debtData.date || new Date().toISOString().split('T')[0],
      dueDate: debtData.dueDate || '',
      accountId: debtData.accountId ? Number(debtData.accountId) : 1,
      notes: debtData.notes || '',
      status: 'PENDING'
    };

    // Update account
    if (debtData.accountId) {
      setAccounts(prev => prev.map(a => {
        if (a.id === Number(debtData.accountId)) {
          if (newDebt.type === 'GIVEN') return { ...a, balance: Number(a.balance) - amount };
          if (newDebt.type === 'TAKEN') return { ...a, balance: Number(a.balance) + amount };
        }
        return a;
      }));
    }

    setDebts(prev => [newDebt, ...prev]);
    logAudit('CREATE_DEBT', 'DEBTS', `Logged ${newDebt.type} debt of ${formatINR(amount)} for ${newDebt.person}`);
    setModalType(null);
  };

  const handleRepayDebt = (debtId, repayAmount, accountId) => {
    const amount = Number(repayAmount);
    if (!amount || amount <= 0) return alert('Invalid repayment amount');

    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        const remaining = Math.max(0, Number(d.pendingAmount) - amount);
        const newStatus = remaining === 0 ? 'SETTLED' : 'PARTIALLY_PAID';
        return { ...d, pendingAmount: remaining, status: newStatus };
      }
      return d;
    }));

    const debt = debts.find(d => d.id === debtId);
    if (debt && accountId) {
      setAccounts(prev => prev.map(a => {
        if (a.id === Number(accountId)) {
          // If money was given, receiving it back increases account balance
          if (debt.type === 'GIVEN') return { ...a, balance: Number(a.balance) + amount };
          // If money was taken, repaying it decreases account balance
          if (debt.type === 'TAKEN') return { ...a, balance: Number(a.balance) - amount };
        }
        return a;
      }));
    }

    logAudit('REPAY_DEBT', 'DEBTS', `Logged repayment of ${formatINR(amount)} for debt #${debtId}`);
    setModalType(null);
  };

  // --------------------------------------------------------------------------
  // RECURRING BILLS - "MARK AS PAID" ACTION
  // --------------------------------------------------------------------------
  const handlePayRecurringBill = (billId) => {
    const bill = recurring.find(b => b.id === billId);
    if (!bill) return;

    const accId = bill.accountId || 1;
    const catId = bill.categoryId || 21;
    const todayStr = new Date().toISOString().split('T')[0];

    // Create Expense
    handleAddTransaction({
      accountId: accId,
      categoryId: catId,
      type: 'EXPENSE',
      amount: bill.amount,
      date: todayStr,
      payee: bill.title,
      notes: `Recurring payment for ${bill.title}`,
      mode: 'AutoPay'
    });

    // Advance next due date by 1 month
    const nextDate = new Date(bill.nextDueDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    setRecurring(prev => prev.map(b => b.id === billId ? { ...b, nextDueDate: nextDateStr } : b));
    logAudit('PAY_RECURRING', 'RECURRING', `Marked bill '${bill.title}' (${formatINR(bill.amount)}) as paid.`);
  };

  // --------------------------------------------------------------------------
  // SAVINGS GOAL DEPOSIT
  // --------------------------------------------------------------------------
  const handleDepositToGoal = (goalId, amount, accountId) => {
    const depAmt = Number(amount);
    if (!depAmt || depAmt <= 0) return alert('Enter valid amount');

    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newSaved = Number(g.saved) + depAmt;
        return { ...g, saved: newSaved };
      }
      return g;
    }));

    if (accountId) {
      setAccounts(prev => prev.map(a => {
        if (a.id === Number(accountId)) {
          return { ...a, balance: Number(a.balance) - depAmt };
        }
        return a;
      }));
    }

    logAudit('DEPOSIT_GOAL', 'GOALS', `Deposited ${formatINR(depAmt)} into Goal #${goalId}`);
    setModalType(null);
  };

  // --------------------------------------------------------------------------
  // EXPORT TOOLS (EXCEL & CSV VIA SHEETJS)
  // --------------------------------------------------------------------------
  const handleExportExcel = () => {
    if (!window.XLSX) return alert('Export library loading, please try again.');
    const dataToExport = transactions.map(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const cat = categories.find(c => c.id === t.categoryId);
      return {
        'Transaction ID': t.id,
        'Date': t.date,
        'Type': t.type,
        'Category': cat ? cat.name : 'Transfer/General',
        'Amount (INR)': t.amount,
        'Account': acc ? acc.name : 'Unknown',
        'Payee / Payer': t.payee,
        'Notes': t.notes,
        'Payment Mode': t.mode,
        'Reference No': t.ref
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `SAMEER_MONEY_MANAGER_TRANSACTIONS_${new Date().toISOString().split('T')[0]}.xlsx`);
    logAudit('EXPORT_DATA', 'REPORTS', 'Exported transactions to Excel XLSX format.');
  };

  // --------------------------------------------------------------------------
  // AI NATURAL LANGUAGE PARSER & INTERACTIVE ADVISOR
  // --------------------------------------------------------------------------
  const handleSendMessageToAI = () => {
    if (!aiInputText.trim()) return;
    const prompt = aiInputText.trim();
    const promptLower = prompt.toLowerCase();
    setAiInputText('');

    const newMessages = [...aiChatMessages, { sender: 'user', text: prompt }];
    setAiChatMessages(newMessages);
    setAiLoading(true);

    setTimeout(() => {
      // Natural Language Transaction Detection
      // e.g. "Spent 450 on petrol via PhonePe" or "Paid 1200 for food"
      const amountMatch = promptLower.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

      const expenseKeywords = ['spent', 'paid', 'expense', 'bought', 'purchased', 'kharcha', 'diya'];
      const incomeKeywords = ['received', 'got', 'salary', 'income', 'earned', 'credited', 'aaya', 'bonus'];

      const isExpense = expenseKeywords.some(w => promptLower.includes(w));
      const isIncome = incomeKeywords.some(w => promptLower.includes(w));

      if (amount > 0 && (isExpense || isIncome)) {
        // Find matching category
        let matchedCat = categories.find(c => promptLower.includes(c.name.toLowerCase()));
        if (!matchedCat && isExpense) {
          if (promptLower.includes('fuel') || promptLower.includes('diesel')) matchedCat = categories.find(c => c.name === 'Petrol');
          else if (promptLower.includes('swiggy') || promptLower.includes('zomato') || promptLower.includes('dinner') || promptLower.includes('lunch') || promptLower.includes('coffee')) matchedCat = categories.find(c => c.name === 'Food');
          else if (promptLower.includes('amazon') || promptLower.includes('flipkart')) matchedCat = categories.find(c => c.name === 'Shopping');
          else matchedCat = categories.find(c => c.name === 'Other Expenses');
        } else if (!matchedCat && isIncome) {
          matchedCat = categories.find(c => c.name === 'Salary') || categories.find(c => c.type === 'INCOME');
        }

        // Find matching account
        let matchedAcc = accounts.find(a => promptLower.includes(a.name.toLowerCase()));
        if (!matchedAcc) {
          if (promptLower.includes('hdfc')) matchedAcc = accounts.find(a => a.name.includes('HDFC'));
          else if (promptLower.includes('sbi')) matchedAcc = accounts.find(a => a.name.includes('SBI'));
          else if (promptLower.includes('phonepe')) matchedAcc = accounts.find(a => a.name.includes('PhonePe'));
          else if (promptLower.includes('gpay') || promptLower.includes('google pay')) matchedAcc = accounts.find(a => a.name.includes('Google Pay'));
          else if (promptLower.includes('cash')) matchedAcc = accounts.find(a => a.name.includes('Cash'));
          else matchedAcc = accounts[0];
        }

        const txType = isIncome ? 'INCOME' : 'EXPENSE';
        handleAddTransaction({
          accountId: matchedAcc.id,
          categoryId: matchedCat ? matchedCat.id : null,
          type: txType,
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          payee: matchedCat ? matchedCat.name : 'AI Recorded',
          notes: prompt,
          mode: matchedAcc.type === 'UPI' ? 'UPI' : 'NetBanking'
        });

        setAiChatMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `✅ **Transaction Recorded Automatically!**\n\n• **Type:** ${txType}\n• **Amount:** ${formatINR(amount)}\n• **Category:** ${matchedCat ? matchedCat.name : 'General'}\n• **Account:** ${matchedAcc.name}\n\nYour balances and net worth have been updated in real time.`
          }
        ]);
        setAiLoading(false);
        return;
      }

      // Intelligent Financial Advice & Q&A
      let aiReply = "";
      if (promptLower.includes('net worth') || promptLower.includes('wealth')) {
        aiReply = `Sameer, your current Net Worth stands at **${formatINR(financials.netWorth)}**.\n\n• Liquid Capital: ${formatINR(financials.liquidBalance)}\n• Investment Portfolio: ${formatINR(financials.totalInvestments)} (Unrealized gain: ${formatINR(financials.investmentProfit)})\n• Money Lent (Receivables): ${formatINR(financials.receivables)}\n• Liabilities: ${formatINR(financials.payables + financials.creditCardDues)}`;
      } else if (promptLower.includes('spending') || promptLower.includes('budget') || promptLower.includes('kharcha')) {
        aiReply = `Sameer, your monthly budget status:\n\n• Monthly Allocated Budget: ${formatINR(financials.monthlyBudget)}\n• Total Spent So Far: ${formatINR(financials.totalExpenses)} (${financials.budgetUsedPercent.toFixed(1)}%)\n• Remaining Budget: ${formatINR(financials.remainingBudget)}\n• Recommended Safe Daily Spend: **${formatINR(financials.dynamicDailyLimit)} / day**`;
      } else if (promptLower.includes('investment') || promptLower.includes('portfolio') || promptLower.includes('stocks') || promptLower.includes('mutual fund')) {
        const gainPct = financials.totalInvested > 0 ? ((financials.investmentProfit / financials.totalInvested) * 100).toFixed(2) : 0;
        aiReply = `Sameer, your investment summary:\n\n• Total Invested: ${formatINR(financials.totalInvested)}\n• Current Market Value: ${formatINR(financials.totalInvestments)}\n• Total P&L: **+${formatINR(financials.investmentProfit)} (+${gainPct}%)**\n\nYour portfolio is nicely balanced across Flexi-cap equities, large caps, SGB gold bonds, and fixed deposits.`;
      } else {
        aiReply = `Hello Sameer! I am here to assist you with tracking your finances. You can ask me about:\n\n1. *"What is my net worth?"*\n2. *"How much can I spend today?"*\n3. *"Give me a summary of my investments"*\n4. Or simply say: *"Spent 350 for lunch at Swiggy using PhonePe"* to automatically add an entry!`;
      }

      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
      setAiLoading(false);
    }, 600);
  };

  // --------------------------------------------------------------------------
  // FILTERED TRANSACTIONS
  // --------------------------------------------------------------------------
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      if (filterAccount !== 'ALL' && t.accountId !== Number(filterAccount)) return false;
      if (filterCategory !== 'ALL' && t.categoryId !== Number(filterCategory)) return false;
      if (dateRange.from && t.date < dateRange.from) return false;
      if (dateRange.to && t.date > dateRange.to) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const payeeMatch = t.payee && t.payee.toLowerCase().includes(q);
        const notesMatch = t.notes && t.notes.toLowerCase().includes(q);
        const refMatch = t.ref && t.ref.toLowerCase().includes(q);
        if (!payeeMatch && !notesMatch && !refMatch) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterAccount, filterCategory, dateRange, searchQuery]);

  // Upcoming Bills for alerts
  const upcomingBills = useMemo(() => {
    return recurring.slice().sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  }, [recurring]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy-950 text-slate-100">
      
      {/* ----------------------------------------------------------------------
          1. LUXURY WELCOME SPLASH SCREEN (application open karte hi mera naam aaye welcome sameer)
          ---------------------------------------------------------------------- */}
      {showWelcomeSplash && (
        <div className="fixed inset-0 z-50 bg-navy-950 flex flex-col items-center justify-center p-6 transition-all duration-700 animate-fadeIn">
          {/* Decorative luxury radial background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-800/60 via-navy-950 to-black pointer-events-none"></div>

          <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
            {/* Monogram Badge */}
            <div className="relative w-28 h-28 mb-6 group">
              <div className="absolute inset-0 rounded-3xl bg-gold-500/20 blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 border-2 border-gold-500/80 flex items-center justify-center shadow-2xl">
                <span className="font-heading text-5xl font-extrabold text-gold-gradient tracking-tight">S</span>
              </div>
            </div>

            {/* Prominent Welcome Branding */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online & Offline Ready • Personal Finance Control Center
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase mb-2">
              WELCOME <span className="text-gold-gradient">SAMEER</span>
            </h1>

            <h2 className="font-heading text-xl font-bold tracking-wide text-slate-200 uppercase mb-1">
              SAMEER'S MONEY MANAGER
            </h2>
            <p className="text-sm font-medium uppercase tracking-widest text-slate-400 mb-3">
              Personal Finance Control Center
            </p>
            <p className="text-sm italic font-medium text-gold-300/90 mb-8">
              "Your Money. Your Control. Your Future."
            </p>

            {/* Quick Metrics preview inside welcome card */}
            <div className="w-full bg-navy-900/80 border border-navy-700/80 rounded-2xl p-4 mb-8 grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Net Worth</p>
                <p className="text-lg font-bold text-white mt-0.5">{formatINR(financials.netWorth)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Available Balance</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatINR(financials.liquidBalance)}</p>
              </div>
            </div>

            {/* Enter Control Center CTA */}
            <button
              onClick={() => setShowWelcomeSplash(false)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-base uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-lg shadow-gold-500/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
            >
              <span>Enter Control Center</span>
              <i data-lucide="arrow-right" className="w-5 h-5"></i>
            </button>
            <p className="text-[11px] text-slate-500 mt-4">Authorized for personal financial management of Sameer</p>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          2. APPLICATION SIDEBAR
          ---------------------------------------------------------------------- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-navy-900/95 border-r border-navy-700/80 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-navy-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-800 border border-gold-500/60 flex items-center justify-center shadow-md">
              <span className="font-heading text-xl font-black text-gold-gradient">S</span>
            </div>
            <div>
              <h2 className="font-heading text-sm font-bold tracking-wider text-gold-gradient uppercase leading-tight">
                SAMEER'S MONEY MANAGER
              </h2>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Finance Control Center
              </p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        {/* User Identity Pill */}
        <div className="px-5 py-3 bg-navy-950/60 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-xs font-bold text-gold-400">
              SM
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">SAMEER</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Control Session
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowWelcomeSplash(true)}
            title="Replay Welcome Greeting" 
            className="p-1.5 text-slate-400 hover:text-gold-400 hover:bg-navy-800 rounded-lg transition"
          >
            <i data-lucide="sparkles" className="w-4 h-4"></i>
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">Overview</p>
          
          <SidebarItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} icon="layout-dashboard" label="Dashboard" />
          <SidebarItem active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setMobileMenuOpen(false); }} icon="calendar" label="Financial Calendar" />
          <SidebarItem active={activeTab === 'transactions'} onClick={() => { setActiveTab('transactions'); setMobileMenuOpen(false); }} icon="receipt" label="All Transactions" badge={transactions.length} />

          <p className="px-3 pt-4 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">Cash Flow</p>
          <SidebarItem active={activeTab === 'income'} onClick={() => { setActiveTab('income'); setMobileMenuOpen(false); }} icon="arrow-down-left" label="Income" />
          <SidebarItem active={activeTab === 'expenses'} onClick={() => { setActiveTab('expenses'); setMobileMenuOpen(false); }} icon="arrow-up-right" label="Expenses" />
          <SidebarItem active={activeTab === 'accounts'} onClick={() => { setActiveTab('accounts'); setMobileMenuOpen(false); }} icon="wallet" label="My Accounts" badge={accounts.length} />
          <SidebarItem active={activeTab === 'transfers'} onClick={() => { setActiveTab('transfers'); setMobileMenuOpen(false); }} icon="arrow-left-right" label="Transfers" />

          <p className="px-3 pt-4 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">Planning & Wealth</p>
          <SidebarItem active={activeTab === 'budget'} onClick={() => { setActiveTab('budget'); setMobileMenuOpen(false); }} icon="pie-chart" label="Budget Management" />
          <SidebarItem active={activeTab === 'goals'} onClick={() => { setActiveTab('goals'); setMobileMenuOpen(false); }} icon="target" label="Savings Goals" badge={savingsGoals.length} />
          <SidebarItem active={activeTab === 'money-given'} onClick={() => { setActiveTab('money-given'); setMobileMenuOpen(false); }} icon="hand-coins" label="Money Given (Lent)" />
          <SidebarItem active={activeTab === 'money-taken'} onClick={() => { setActiveTab('money-taken'); setMobileMenuOpen(false); }} icon="landmark" label="Money Taken (Debt)" />
          <SidebarItem active={activeTab === 'investments'} onClick={() => { setActiveTab('investments'); setMobileMenuOpen(false); }} icon="trending-up" label="Investments" badge={investments.length} />
          <SidebarItem active={activeTab === 'recurring'} onClick={() => { setActiveTab('recurring'); setMobileMenuOpen(false); }} icon="repeat" label="Bills & Reminders" badge={recurring.length} />

          <p className="px-3 pt-4 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">Intelligence & System</p>
          <SidebarItem active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }} icon="file-bar-chart" label="Reports & Analytics" />
          <SidebarItem active={activeTab === 'ai-assistant'} onClick={() => { setActiveTab('ai-assistant'); setMobileMenuOpen(false); }} icon="bot" label="AI Money Assistant" isNew />
          <SidebarItem active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} icon="settings" label="Settings & Audit" />
        </nav>

        {/* Sidebar Footer Branding Tagline */}
        <div className="p-4 border-t border-navy-700/80 bg-navy-950/80 text-center">
          <p className="text-[11px] font-semibold text-gold-400/90 tracking-wide">
            "Your Money. Your Control. Your Future."
          </p>
          <p className="text-[9px] text-slate-500 mt-1 uppercase">Exclusively for SAMEER</p>
        </div>
      </aside>

      {/* ----------------------------------------------------------------------
          3. MAIN APPLICATION CONTENT AREA
          ---------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 bg-navy-900/90 border-b border-navy-700/80 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-white p-1.5">
              <i data-lucide="menu" className="w-5 h-5"></i>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-white uppercase tracking-wider hidden sm:inline">
                  SAMEER'S MONEY MANAGER
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-xs font-medium text-gold-400">
                  {activeTab.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">
                Personal Finance Control Center & Wealth Terminal
              </p>
            </div>
          </div>

          {/* Quick Action Buttons & User Header */}
          <div className="flex items-center gap-3">
            {/* Online / Offline Status Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
            </div>

            {/* Quick Add Transaction Button */}
            <button
              onClick={() => { setActiveModalData(null); setModalType('add-tx'); }}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md shadow-gold-500/20 transition flex items-center gap-1.5"
            >
              <i data-lucide="plus-circle" className="w-4 h-4"></i>
              <span>Add Entry</span>
            </button>

            {/* Quick AI Voice/Text Entry */}
            <button
              onClick={() => setActiveTab('ai-assistant')}
              title="AI Money Assistant"
              className="p-2 rounded-lg bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <i data-lucide="sparkles" className="w-4 h-4"></i>
              <span className="hidden lg:inline">AI Assistant</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition"
              >
                <i data-lucide="bell" className="w-4 h-4"></i>
                {(financials.isNearBudgetLimit || financials.isOverBudget || upcomingBills.length > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-dropdown rounded-xl shadow-2xl p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-navy-700 mb-3">
                    <p className="font-heading font-bold text-xs uppercase text-gold-400">Financial Alerts</p>
                    <span className="text-[10px] text-slate-400">Live Status</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {financials.isOverBudget && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                        ⚠️ <strong>Budget Overspent:</strong> Monthly expenses exceed budget by {formatINR(financials.totalExpenses - financials.monthlyBudget)}.
                      </div>
                    )}
                    {financials.isNearBudgetLimit && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        ⚡ <strong>Budget Warning:</strong> You have utilized {financials.budgetUsedPercent.toFixed(0)}% of your monthly limit.
                      </div>
                    )}
                    {upcomingBills.slice(0, 3).map(b => (
                      <div key={b.id} className="p-2 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{b.title}</p>
                          <p className="text-[10px] text-slate-400">Due on {b.nextDueDate}</p>
                        </div>
                        <span className="font-bold text-gold-400">{formatINR(b.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sameer Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-navy-700">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-navy-800 to-navy-700 border border-gold-500/60 flex items-center justify-center font-heading font-bold text-gold-400 text-xs shadow">
                S
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white uppercase leading-none">SAMEER</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Control Center</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-navy-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              financials={financials}
              accounts={accounts}
              transactions={transactions}
              categories={categories}
              upcomingBills={upcomingBills}
              onNavigate={setActiveTab}
              onOpenAddTx={() => { setActiveModalData(null); setModalType('add-tx'); }}
              onPayBill={handlePayRecurringBill}
            />
          )}

          {activeTab === 'calendar' && (
            <FinancialCalendarView
              transactions={transactions}
              upcomingBills={upcomingBills}
              onOpenAddTx={() => { setActiveModalData(null); setModalType('add-tx'); }}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={filteredTransactions}
              accounts={accounts}
              categories={categories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterType={filterType}
              setFilterType={setFilterType}
              filterAccount={filterAccount}
              setFilterAccount={setFilterAccount}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onDelete={handleDeleteTransaction}
              onExportExcel={handleExportExcel}
              onOpenAddTx={() => { setActiveModalData(null); setModalType('add-tx'); }}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              transactions={transactions.filter(t => t.type === 'INCOME')}
              categories={categories.filter(c => c.type === 'INCOME')}
              accounts={accounts}
              onOpenAddIncome={() => { setActiveModalData({ type: 'INCOME' }); setModalType('add-tx'); }}
              onDelete={handleDeleteTransaction}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseView
              transactions={transactions.filter(t => t.type === 'EXPENSE')}
              categories={categories.filter(c => c.type === 'EXPENSE')}
              accounts={accounts}
              financials={financials}
              onOpenAddExpense={() => { setActiveModalData({ type: 'EXPENSE' }); setModalType('add-tx'); }}
              onDelete={handleDeleteTransaction}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              transactions={transactions}
              onOpenAddAccount={() => setModalType('add-account')}
              onOpenTransfer={() => setActiveTab('transfers')}
            />
          )}

          {activeTab === 'transfers' && (
            <TransfersView
              accounts={accounts}
              transactions={transactions.filter(t => t.type === 'TRANSFER')}
              onTransfer={handleAddTransaction}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              financials={financials}
              categories={categories.filter(c => c.type === 'EXPENSE')}
              transactions={transactions.filter(t => t.type === 'EXPENSE')}
              onUpdateBudgetLimit={(newLimit) => {
                // update budget
              }}
            />
          )}

          {activeTab === 'goals' && (
            <SavingsGoalsView
              goals={savingsGoals}
              accounts={accounts}
              onOpenAddGoal={() => setModalType('add-goal')}
              onOpenDeposit={(goal) => { setActiveModalData(goal); setModalType('deposit-goal'); }}
            />
          )}

          {activeTab === 'money-given' && (
            <DebtView
              type="GIVEN"
              title="Money Given (Receivables / Lendings)"
              subtitle="Track money lent to friends, relatives, and colleagues"
              debts={debts.filter(d => d.type === 'GIVEN')}
              accounts={accounts}
              onOpenAddDebt={() => { setActiveModalData({ type: 'GIVEN' }); setModalType('add-debt'); }}
              onRepay={(debt) => { setActiveModalData(debt); setModalType('repay-debt'); }}
            />
          )}

          {activeTab === 'money-taken' && (
            <DebtView
              type="TAKEN"
              title="Money Taken (Borrowings / Liabilities)"
              subtitle="Track personal loans and amounts you owe"
              debts={debts.filter(d => d.type === 'TAKEN')}
              accounts={accounts}
              onOpenAddDebt={() => { setActiveModalData({ type: 'TAKEN' }); setModalType('add-debt'); }}
              onRepay={(debt) => { setActiveModalData(debt); setModalType('repay-debt'); }}
            />
          )}

          {activeTab === 'investments' && (
            <InvestmentsView
              investments={investments}
              accounts={accounts}
              financials={financials}
              onOpenAddInvestment={() => setModalType('add-investment')}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringBillsView
              recurring={recurring}
              accounts={accounts}
              categories={categories}
              onOpenAddRecurring={() => setModalType('add-recurring')}
              onPay={handlePayRecurringBill}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              financials={financials}
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              onExportExcel={handleExportExcel}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIAssistantView
              messages={aiChatMessages}
              inputText={aiInputText}
              setInputText={setAiInputText}
              onSend={handleSendMessageToAI}
              loading={aiLoading}
              financials={financials}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              auditLogs={auditLogs}
              onExportExcel={handleExportExcel}
              onResetData={() => {
                if (confirm("Reset to default demonstration dataset for Sameer?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            />
          )}
        </main>
      </div>

      {/* ----------------------------------------------------------------------
          4. MODALS (Add Transaction, Add Account, Khata, Goals, etc.)
          ---------------------------------------------------------------------- */}
      {modalType === 'add-tx' && (
        <AddTransactionModal
          initialData={activeModalData}
          accounts={accounts}
          categories={categories}
          onClose={() => setModalType(null)}
          onSubmit={handleAddTransaction}
        />
      )}

      {modalType === 'add-account' && (
        <AddAccountModal
          onClose={() => setModalType(null)}
          onSubmit={(accData) => {
            const newAcc = {
              id: Date.now(),
              name: accData.name,
              type: accData.type,
              last4: accData.last4 || '',
              institution: accData.institution || accData.name,
              balance: Number(accData.balance || 0),
              creditLimit: Number(accData.creditLimit || 0),
              color: accData.color || '#001F54',
              icon: accData.icon || 'landmark'
            };
            setAccounts(prev => [...prev, newAcc]);
            logAudit('CREATE_ACCOUNT', 'ACCOUNTS', `Added new account '${newAcc.name}' with balance ${formatINR(newAcc.balance)}`);
            setModalType(null);
          }}
        />
      )}

      {modalType === 'add-debt' && (
        <AddDebtModal
          initialType={activeModalData ? activeModalData.type : 'GIVEN'}
          accounts={accounts}
          onClose={() => setModalType(null)}
          onSubmit={handleAddDebt}
        />
      )}

      {modalType === 'repay-debt' && activeModalData && (
        <RepayDebtModal
          debt={activeModalData}
          accounts={accounts}
          onClose={() => setModalType(null)}
          onSubmit={(repayAmt, accId) => handleRepayDebt(activeModalData.id, repayAmt, accId)}
        />
      )}

      {modalType === 'add-goal' && (
        <AddGoalModal
          onClose={() => setModalType(null)}
          onSubmit={(goalData) => {
            const newG = {
              id: Date.now(),
              name: goalData.name,
              target: Number(goalData.target),
              saved: Number(goalData.saved || 0),
              date: goalData.date,
              icon: goalData.icon || 'target',
              color: goalData.color || '#D4AF37'
            };
            setSavingsGoals(prev => [...prev, newG]);
            logAudit('CREATE_GOAL', 'GOALS', `Created savings goal '${newG.name}' target ${formatINR(newG.target)}`);
            setModalType(null);
          }}
        />
      )}

      {modalType === 'deposit-goal' && activeModalData && (
        <DepositGoalModal
          goal={activeModalData}
          accounts={accounts}
          onClose={() => setModalType(null)}
          onSubmit={(amt, accId) => handleDepositToGoal(activeModalData.id, amt, accId)}
        />
      )}

      {modalType === 'add-investment' && (
        <AddInvestmentModal
          onClose={() => setModalType(null)}
          onSubmit={(invData) => {
            const newInv = {
              id: Date.now(),
              name: invData.name,
              type: invData.type,
              invested: Number(invData.invested),
              current: Number(invData.current || invData.invested),
              units: Number(invData.units || 1),
              buyPrice: Number(invData.buyPrice || 0),
              nav: Number(invData.nav || 0),
              date: invData.date || new Date().toISOString().split('T')[0],
              sipDay: invData.sipDay ? Number(invData.sipDay) : null,
              notes: invData.notes || ''
            };
            setInvestments(prev => [...prev, newInv]);
            logAudit('CREATE_INVESTMENT', 'INVESTMENTS', `Added investment '${newInv.name}' (${formatINR(newInv.invested)})`);
            setModalType(null);
          }}
        />
      )}

      {modalType === 'add-recurring' && (
        <AddRecurringModal
          accounts={accounts}
          categories={categories.filter(c => c.type === 'EXPENSE')}
          onClose={() => setModalType(null)}
          onSubmit={(recData) => {
            const newR = {
              id: Date.now(),
              title: recData.title,
              categoryId: recData.categoryId ? Number(recData.categoryId) : 21,
              amount: Number(recData.amount),
              dueDay: Number(recData.dueDay || 1),
              nextDueDate: recData.nextDueDate,
              accountId: recData.accountId ? Number(recData.accountId) : 1,
              isAutoPay: recData.isAutoPay
            };
            setRecurring(prev => [...prev, newR]);
            logAudit('CREATE_RECURRING', 'RECURRING', `Scheduled recurring payment '${newR.title}' (${formatINR(newR.amount)})`);
            setModalType(null);
          }}
        />
      )}

    </div>
  );
}

// ----------------------------------------------------------------------------
// SIDEBAR ITEM HELPER COMPONENT
// ----------------------------------------------------------------------------
function SidebarItem({ active, onClick, icon, label, badge, isNew }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-300 border-l-4 border-gold-500 font-bold'
          : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <i data-lucide={icon} className={`w-4 h-4 ${active ? 'text-gold-400' : 'text-slate-400'}`}></i>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
          active ? 'bg-gold-500/30 text-gold-300' : 'bg-navy-800 text-slate-400'
        }`}>
          {badge}
        </span>
      )}
      {isNew && (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gold-500 text-navy-950 uppercase">
          AI
        </span>
      )}
    </button>
  );
}

// ----------------------------------------------------------------------------
// MODULE 1: DASHBOARD VIEW
// ----------------------------------------------------------------------------
function DashboardView({ financials, accounts, transactions, categories, upcomingBills, onNavigate, onOpenAddTx, onPayBill }) {
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner (application open karte hi mera naam aaye welcome sameer) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SAMEER'S FINANCIAL CONTROL CENTER
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {greeting}, <span className="text-gold-gradient">SAMEER</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              "Your Money. Your Control. Your Future." — Every rupee of your wealth, liquid cash, investments and liabilities under strict command.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddTx}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-lg shadow-gold-500/20 transition flex items-center gap-2"
            >
              <i data-lucide="plus-circle" className="w-4 h-4"></i>
              <span>Log Transaction</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 rounded-xl bg-navy-800 text-slate-200 border border-navy-700 hover:bg-navy-750 font-heading font-semibold text-xs transition flex items-center gap-2"
            >
              <i data-lucide="file-text" className="w-4 h-4"></i>
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards (8 Core Dimensions) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-gold-500/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gold-400 font-semibold mb-1">
            <span>TOTAL NET WORTH</span>
            <i data-lucide="shield-check" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.netWorth)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Liquid + Portfolio + Receivables - Debts</p>
        </div>

        {/* Available / Liquid Balance */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>AVAILABLE BALANCE</span>
            <i data-lucide="wallet" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.liquidBalance)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">In Bank Accounts, Wallets & Cash</p>
        </div>

        {/* Total Income this Month */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1">
            <span>MONTHLY INCOME</span>
            <i data-lucide="trending-up" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.totalIncome)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Salary, Freelance & Credits</p>
        </div>

        {/* Total Expenses this Month */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-1">
            <span>MONTHLY EXPENSES</span>
            <i data-lucide="trending-down" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.totalExpenses)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            Budget used: <span className="font-bold text-white">{financials.budgetUsedPercent.toFixed(1)}%</span>
          </p>
        </div>

        {/* Net Monthly Savings */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-teal-400 font-semibold mb-1">
            <span>MONTHLY SAVINGS</span>
            <i data-lucide="piggy-bank" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.totalSavings)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Savings Rate: <strong className="text-teal-400">{financials.savingsRate}%</strong></p>
        </div>

        {/* Total Investments Portfolio */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
            <span>INVESTMENT PORTFOLIO</span>
            <i data-lucide="gem" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.totalInvestments)}
          </p>
          <p className="text-[10px] text-emerald-400 mt-2">
            Gain: +{formatINR(financials.investmentProfit)}
          </p>
        </div>

        {/* Money Given (Receivables) */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>RECEIVABLES (LENT)</span>
            <i data-lucide="hand-coins" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.receivables)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">To be received back from others</p>
        </div>

        {/* Payables & Credit Card Dues */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-red-400 font-semibold mb-1">
            <span>PAYABLES & CC DUES</span>
            <i data-lucide="credit-card" className="w-4 h-4"></i>
          </div>
          <p className="font-heading text-xl sm:text-2xl font-extrabold text-white mt-1">
            {formatINR(financials.payables + financials.creditCardDues)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            CC: {formatINR(financials.creditCardDues)} | Khata: {formatINR(financials.payables)}
          </p>
        </div>
      </div>

      {/* Two Column Section: Accounts Glance & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sameer's Key Accounts Glance */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-navy-700/80 mb-4">
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                Sameer's Primary Accounts
              </h3>
              <p className="text-[11px] text-slate-400">Real-time liquid cash, bank balances and cards</p>
            </div>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-xs text-gold-400 hover:text-gold-300 font-semibold"
            >
              View All ({accounts.length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accounts.slice(0, 4).map(acc => (
              <div key={acc.id} className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-700 hover:border-gold-500/40 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-gold-400">
                      <i data-lucide={acc.icon || 'landmark'} className="w-4 h-4"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{acc.name}</p>
                      <p className="text-[10px] text-slate-400">{acc.institution} {acc.last4 ? `••${acc.last4}` : ''}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    acc.type === 'CREDIT_CARD' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {acc.type}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-navy-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {acc.type === 'CREDIT_CARD' ? 'Current Payable' : 'Balance'}
                  </span>
                  <span className="font-heading text-base font-bold text-white">
                    {formatINR(acc.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bills & Reminders */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-navy-700/80 mb-4">
              <div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  Upcoming Bills
                </h3>
                <p className="text-[11px] text-slate-400">Due in next 30 days</p>
              </div>
              <button
                onClick={() => onNavigate('recurring')}
                className="text-xs text-gold-400 hover:text-gold-300 font-semibold"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBills.slice(0, 4).map(bill => (
                <div key={bill.id} className="p-3 rounded-xl bg-navy-850/80 border border-navy-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{bill.title}</p>
                    <p className="text-[10px] text-slate-400">Due: <strong className="text-gold-400">{bill.nextDueDate}</strong></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{formatINR(bill.amount)}</p>
                    <button
                      onClick={() => onPayBill(bill.id)}
                      className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Daily Spending Limit Alert */}
          <div className="mt-4 p-3 rounded-xl bg-navy-800 border border-gold-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Daily Spending Limit:</span>
              <span className="font-heading text-sm font-bold text-gold-400">
                {formatINR(financials.dynamicDailyLimit)} / day
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Calculated from remaining budget of {formatINR(financials.remainingBudget)}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700/80 mb-4">
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Recent Transactions
            </h3>
            <p className="text-[11px] text-slate-400">Latest activity across all accounts</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-gold-400 hover:text-gold-300 font-semibold"
          >
            Full Ledger ({transactions.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-700 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Payee / Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Account</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/80">
              {transactions.slice(0, 6).map(tx => {
                const acc = accounts.find(a => a.id === tx.accountId);
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                  <tr key={tx.id} className="hover:bg-navy-800/40 transition">
                    <td className="py-3 text-slate-300 font-mono">{tx.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-white">{tx.payee || 'Transaction'}</p>
                      {tx.notes && <p className="text-[10px] text-slate-400 truncate max-w-xs">{tx.notes}</p>}
                    </td>
                    <td className="py-3 text-slate-300">{cat ? cat.name : 'Transfer'}</td>
                    <td className="py-3 text-slate-300">{acc ? acc.name : 'Account'}</td>
                    <td className={`py-3 text-right font-bold font-mono text-sm ${
                      tx.type === 'INCOME' ? 'text-emerald-400' :
                      tx.type === 'EXPENSE' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}{formatINR(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 2: ALL TRANSACTIONS & MASTER LEDGER
// ----------------------------------------------------------------------------
function TransactionsView({ transactions, accounts, categories, searchQuery, setSearchQuery, filterType, setFilterType, filterAccount, setFilterAccount, filterCategory, setFilterCategory, dateRange, setDateRange, onDelete, onExportExcel, onOpenAddTx }) {
  return (
    <div className="space-y-5">
      {/* Header with Search and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Master Transaction Ledger
          </h2>
          <p className="text-xs text-slate-400">Total {transactions.length} records matching current criteria</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <i data-lucide="file-spreadsheet" className="w-4 h-4 text-emerald-400"></i>
            <span>Export Excel</span>
          </button>
          <button
            onClick={onOpenAddTx}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md shadow-gold-500/20 transition flex items-center gap-1.5"
          >
            <i data-lucide="plus" className="w-4 h-4"></i>
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Search Keyword</label>
          <div className="relative">
            <i data-lucide="search" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
            <input
              type="text"
              placeholder="Payee, notes, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Transaction Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income (+)</option>
            <option value="EXPENSE">Expense (-)</option>
            <option value="TRANSFER">Transfer (⇄)</option>
          </select>
        </div>

        {/* Account Filter */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Account</label>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
          >
            <option value="ALL">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Date (From)</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Master Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/80 border-b border-navy-700 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-4">Payee / Description</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Account</th>
                <th className="py-3.5 px-3">Mode</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const destAcc = tx.destAccountId ? accounts.find(a => a.id === tx.destAccountId) : null;
                  const cat = categories.find(c => c.id === tx.categoryId);
                  return (
                    <tr key={tx.id} className="hover:bg-navy-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-300">{tx.date}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' :
                          tx.type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{tx.payee || 'Transaction'}</p>
                        {tx.notes && <p className="text-[10px] text-slate-400 truncate max-w-xs">{tx.notes}</p>}
                        {tx.ref && <p className="text-[9px] font-mono text-slate-500">Ref: {tx.ref}</p>}
                      </td>
                      <td className="py-3.5 px-3">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-navy-800 border border-navy-700 text-slate-200">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            {cat.name}
                          </span>
                        ) : 'Transfer'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {acc ? acc.name : 'Unknown'}
                        {destAcc && <span className="block text-[10px] text-slate-400">→ {destAcc.name}</span>}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">{tx.mode || 'UPI'}</td>
                      <td className={`py-3.5 px-4 text-right font-bold font-mono text-sm ${
                        tx.type === 'INCOME' ? 'text-emerald-400' :
                        tx.type === 'EXPENSE' ? 'text-rose-400' : 'text-blue-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}{formatINR(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onDelete(tx.id)}
                          title="Delete and reverse account balance"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <i data-lucide="trash-2" className="w-4 h-4"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 3: INCOME MANAGEMENT
// ----------------------------------------------------------------------------
function IncomeView({ transactions, categories, accounts, onOpenAddIncome, onDelete }) {
  const total = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Income Management
          </h2>
          <p className="text-xs text-slate-400">Track salary, bonuses, incentives, freelance and business cashflow</p>
        </div>

        <button
          onClick={onOpenAddIncome}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-heading font-bold text-xs uppercase tracking-wider hover:from-emerald-400 hover:to-emerald-500 shadow-md transition flex items-center gap-1.5"
        >
          <i data-lucide="plus" className="w-4 h-4"></i>
          <span>Add Income</span>
        </button>
      </div>

      {/* Income Summary Banner */}
      <div className="glass-panel rounded-2xl p-5 border-emerald-500/30 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">TOTAL RECORDED INCOME</p>
          <p className="font-heading text-3xl font-extrabold text-white mt-1">{formatINR(total)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across {transactions.length} recorded credit entries</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <i data-lucide="arrow-down-left" className="w-6 h-6"></i>
        </div>
      </div>

      {/* Income Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(cat => {
          const catTotal = transactions
            .filter(t => t.categoryId === cat.id)
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
          return (
            <div key={cat.id} className="glass-panel rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center" style={{ color: cat.color }}>
                  <i data-lucide={cat.icon || 'tag'} className="w-3.5 h-3.5"></i>
                </div>
                <p className="text-xs font-bold text-white truncate">{cat.name}</p>
              </div>
              <p className="font-heading text-base font-bold text-emerald-400">{formatINR(catTotal)}</p>
            </div>
          );
        })}
      </div>

      {/* Income Transactions Table */}
      <div className="glass-panel rounded-2xl overflow-hidden p-4">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Income Transaction History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-navy-700 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Source / Payee</th>
                <th className="pb-2.5">Account Credited</th>
                <th className="pb-2.5 text-right">Amount</th>
                <th className="pb-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {transactions.map(t => {
                const acc = accounts.find(a => a.id === t.accountId);
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <tr key={t.id} className="hover:bg-navy-800/40">
                    <td className="py-3 font-mono text-slate-300">{t.date}</td>
                    <td className="py-3 font-semibold text-white">{cat ? cat.name : 'Income'}</td>
                    <td className="py-3 text-slate-200">{t.payee}</td>
                    <td className="py-3 text-slate-300">{acc ? acc.name : ''}</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400 text-sm">+{formatINR(t.amount)}</td>
                    <td className="py-3 text-center">
                      <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-rose-400">
                        <i data-lucide="trash-2" className="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 4: EXPENSE MANAGEMENT
// ----------------------------------------------------------------------------
function ExpenseView({ transactions, categories, accounts, financials, onOpenAddExpense, onDelete }) {
  const total = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Expense Management
          </h2>
          <p className="text-xs text-slate-400">Categorized tracking: Food, Fuel, Shopping, Bills, Fitness, Travel</p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-heading font-bold text-xs uppercase tracking-wider hover:from-rose-400 hover:to-rose-500 shadow-md transition flex items-center gap-1.5"
        >
          <i data-lucide="plus" className="w-4 h-4"></i>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border-rose-500/30">
          <p className="text-xs uppercase tracking-wider text-rose-400 font-bold">TOTAL EXPENSES</p>
          <p className="font-heading text-2xl font-extrabold text-white mt-1">{formatINR(total)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{transactions.length} total debit entries</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-gold-400 font-bold">REMAINING BUDGET</p>
          <p className="font-heading text-2xl font-extrabold text-white mt-1">{formatINR(financials.remainingBudget)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Out of {formatINR(financials.monthlyBudget)} limit</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-blue-400 font-bold">SAFE DAILY SPEND</p>
          <p className="font-heading text-2xl font-extrabold text-white mt-1">{formatINR(financials.dynamicDailyLimit)}</p>
          <p className="text-[10px] text-slate-400 mt-1">To stay within monthly limit</p>
        </div>
      </div>

      {/* Expense Categories Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(cat => {
          const catTotal = transactions
            .filter(t => t.categoryId === cat.id)
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
          const budgetPercent = cat.budget > 0 ? (catTotal / cat.budget) * 100 : 0;
          return (
            <div key={cat.id} className="glass-panel rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center" style={{ color: cat.color }}>
                    <i data-lucide={cat.icon || 'tag'} className="w-3.5 h-3.5"></i>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{cat.name}</p>
                </div>
              </div>
              <p className="font-heading text-base font-bold text-white">{formatINR(catTotal)}</p>
              {cat.budget > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${budgetPercent > 90 ? 'bg-rose-500' : 'bg-gold-500'}`}
                      style={{ width: `${Math.min(100, budgetPercent)}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {budgetPercent.toFixed(0)}% of {formatINR(cat.budget)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expenses List */}
      <div className="glass-panel rounded-2xl p-4 overflow-hidden">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Expense Transaction Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-navy-700 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Payee / Purpose</th>
                <th className="pb-2.5">Account / Card</th>
                <th className="pb-2.5 text-right">Amount</th>
                <th className="pb-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {transactions.map(t => {
                const acc = accounts.find(a => a.id === t.accountId);
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <tr key={t.id} className="hover:bg-navy-800/40">
                    <td className="py-3 font-mono text-slate-300">{t.date}</td>
                    <td className="py-3 font-semibold text-white">{cat ? cat.name : 'Expense'}</td>
                    <td className="py-3 text-slate-200">
                      <p className="font-bold">{t.payee}</p>
                      {t.notes && <p className="text-[10px] text-slate-400">{t.notes}</p>}
                    </td>
                    <td className="py-3 text-slate-300">{acc ? acc.name : ''}</td>
                    <td className="py-3 text-right font-mono font-bold text-rose-400 text-sm">-{formatINR(t.amount)}</td>
                    <td className="py-3 text-center">
                      <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-rose-400">
                        <i data-lucide="trash-2" className="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 5: ACCOUNT MANAGEMENT & CARDS
// ----------------------------------------------------------------------------
function AccountsView({ accounts, transactions, onOpenAddAccount, onOpenTransfer }) {
  const liquidTotal = accounts
    .filter(a => a.type !== 'CREDIT_CARD')
    .reduce((acc, curr) => acc + Number(curr.balance), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            My Financial Accounts
          </h2>
          <p className="text-xs text-slate-400">Bank Accounts, Cash, UPI (GPay, PhonePe, Paytm), Debit & Credit Cards</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransfer}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <i data-lucide="arrow-left-right" className="w-4 h-4 text-gold-400"></i>
            <span>Transfer Funds</span>
          </button>
          <button
            onClick={onOpenAddAccount}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md transition flex items-center gap-1.5"
          >
            <i data-lucide="plus" className="w-4 h-4"></i>
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Liquid Total Header */}
      <div className="glass-panel rounded-2xl p-5 border-gold-500/30 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gold-400 font-bold">TOTAL LIQUID CAPITAL</p>
          <p className="font-heading text-3xl font-extrabold text-white mt-1">{formatINR(liquidTotal)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Available across all active checking, savings, and wallets</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
          <i data-lucide="landmark" className="w-6 h-6"></i>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const isCC = acc.type === 'CREDIT_CARD';
          return (
            <div key={acc.id} className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-gold-500/60 transition">
              {/* Account Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center text-gold-400">
                    <i data-lucide={acc.icon || 'landmark'} className="w-5 h-5"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{acc.name}</h3>
                    <p className="text-[11px] text-slate-400">{acc.institution} {acc.last4 ? `(••${acc.last4})` : ''}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isCC ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {acc.type}
                </span>
              </div>

              {/* Balance & Limits */}
              <div className="mt-4 pt-3 border-t border-navy-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {isCC ? 'Current Outstanding Payable' : 'Available Balance'}
                </p>
                <p className={`font-heading text-2xl font-extrabold mt-0.5 ${isCC ? 'text-amber-400' : 'text-white'}`}>
                  {formatINR(acc.balance)}
                </p>
                {isCC && acc.creditLimit > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Limit: {formatINR(acc.creditLimit)}</span>
                      <span>Available: {formatINR(acc.creditLimit - acc.balance)}</span>
                    </div>
                    <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (acc.balance / acc.creditLimit) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 6: ACCOUNT TRANSFERS
// ----------------------------------------------------------------------------
function TransfersView({ accounts, transactions, onTransfer }) {
  const [sourceId, setSourceId] = useState(accounts[0] ? accounts[0].id : '');
  const [destId, setDestId] = useState(accounts[1] ? accounts[1].id : '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Enter a valid amount');
    if (sourceId === destId) return alert('Source and destination accounts must be distinct');

    onTransfer({
      accountId: Number(sourceId),
      destAccountId: Number(destId),
      type: 'TRANSFER',
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      payee: 'Account Transfer',
      notes: notes || 'Internal account transfer',
      mode: 'Transfer'
    });

    setAmount('');
    setNotes('');
    alert('Internal transfer completed successfully with zero double counting!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
          Account Transfers
        </h2>
        <p className="text-xs text-slate-400">
          Strict financial rule: Internal transfers move funds between accounts without altering net worth or income/expenses.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1.5">Transfer From (Source)</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({formatINR(a.balance)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1.5">Transfer To (Destination)</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({formatINR(a.balance)})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-300 block mb-1.5">Amount (INR ₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-sm font-mono text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-300 block mb-1.5">Transfer Notes / Reason</label>
            <input
              type="text"
              placeholder="e.g. ATM withdrawal, moving to savings"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md transition"
          >
            Execute Internal Transfer
          </button>
        </form>
      </div>

      {/* Transfer History */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="font-heading text-xs font-bold uppercase text-slate-300 tracking-wider mb-3">
          Transfer History
        </h3>
        <div className="space-y-2">
          {transactions.map(t => {
            const src = accounts.find(a => a.id === t.accountId);
            const dst = accounts.find(a => a.id === t.destAccountId);
            return (
              <div key={t.id} className="p-3 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">
                    {src ? src.name : 'Unknown'} → {dst ? dst.name : 'Unknown'}
                  </p>
                  <p className="text-[10px] text-slate-400">{t.date} • {t.notes}</p>
                </div>
                <span className="font-heading font-bold text-blue-400 font-mono text-sm">{formatINR(t.amount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 7: BUDGET MANAGEMENT
// ----------------------------------------------------------------------------
function BudgetView({ financials, categories, transactions }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
          Budget Control Center
        </h2>
        <p className="text-xs text-slate-400">Monthly limits, category thresholds & dynamic safe spending pace</p>
      </div>

      {/* Main Budget Bar */}
      <div className="glass-panel rounded-2xl p-6 border-gold-500/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase font-bold text-gold-400">MONTHLY OVERALL BUDGET</p>
            <h3 className="font-heading text-2xl font-extrabold text-white mt-1">
              {formatINR(financials.totalExpenses)} / {formatINR(financials.monthlyBudget)}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Remaining Budget</p>
            <p className="font-heading text-2xl font-extrabold text-emerald-400 mt-1">
              {formatINR(financials.remainingBudget)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-navy-800 h-3 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              financials.isOverBudget ? 'bg-rose-500' :
              financials.budgetUsedPercent > 80 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, financials.budgetUsedPercent)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
          <span>0%</span>
          <span>{financials.budgetUsedPercent.toFixed(1)}% Spent</span>
          <span>100%</span>
        </div>
      </div>

      {/* Category Wise Budget Bars */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="font-heading text-sm font-bold uppercase text-white tracking-wider mb-4">
          Category-Wise Budgets & Spending
        </h3>

        <div className="space-y-4">
          {categories.filter(c => c.budget > 0).map(cat => {
            const spent = transactions
              .filter(t => t.categoryId === cat.id)
              .reduce((acc, curr) => acc + Number(curr.amount), 0);
            const pct = (spent / cat.budget) * 100;
            const remaining = Math.max(0, cat.budget - spent);

            return (
              <div key={cat.id} className="p-3.5 rounded-xl bg-navy-900 border border-navy-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-bold text-white">{cat.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-300 font-bold">{formatINR(spent)}</span>
                    <span className="text-slate-500"> / {formatINR(cat.budget)}</span>
                  </div>
                </div>

                <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 100 ? 'bg-rose-500' : pct > 85 ? 'bg-amber-400' : 'bg-gold-500'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>{pct.toFixed(0)}% Utilized</span>
                  <span className={pct > 100 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {pct > 100 ? `Overspent by ${formatINR(spent - cat.budget)}` : `Remaining: ${formatINR(remaining)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 8: SAVINGS GOALS
// ----------------------------------------------------------------------------
function SavingsGoalsView({ goals, accounts, onOpenAddGoal, onOpenDeposit }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Savings Goals
          </h2>
          <p className="text-xs text-slate-400">Emergency Fund, Laptop, Bike, Travel & Wealth Milestones</p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md transition flex items-center gap-1.5"
        >
          <i data-lucide="plus" className="w-4 h-4"></i>
          <span>Create New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(g => {
          const pct = Math.min(100, (g.saved / g.target) * 100);
          const remaining = Math.max(0, g.target - g.saved);

          return (
            <div key={g.id} className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-navy-800 border border-gold-500/40 flex items-center justify-center text-gold-400">
                      <i data-lucide={g.icon || 'target'} className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{g.name}</h3>
                      <p className="text-[10px] text-slate-400">Target Date: {g.date || 'Open'}</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-gold-400">{pct.toFixed(0)}%</span>
                </div>

                <div className="my-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Saved:</span>
                    <span className="font-bold text-white font-mono">{formatINR(g.saved)}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Target:</span>
                    <span className="font-bold text-slate-300 font-mono">{formatINR(g.target)}</span>
                  </div>

                  <div className="w-full bg-navy-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-right">
                    Remaining: <strong className="text-gold-400">{formatINR(remaining)}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenDeposit(g)}
                className="w-full py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
              >
                <i data-lucide="arrow-down-circle" className="w-4 h-4"></i>
                <span>Deposit Funds</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 9: LENDING & BORROWING (KHATA / UDHAAR)
// ----------------------------------------------------------------------------
function DebtView({ type, title, subtitle, debts, accounts, onOpenAddDebt, onRepay }) {
  const isGiven = type === 'GIVEN';
  const totalPending = debts.reduce((acc, curr) => acc + Number(curr.pendingAmount), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            {title}
          </h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        <button
          onClick={onOpenAddDebt}
          className={`px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5 ${
            isGiven
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950'
              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white'
          }`}
        >
          <i data-lucide="plus" className="w-4 h-4"></i>
          <span>{isGiven ? 'Record Money Given' : 'Record Money Taken'}</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="glass-panel rounded-2xl p-5 border-gold-500/30 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gold-400 font-bold">
            {isGiven ? 'TOTAL PENDING RECEIVABLES' : 'TOTAL PENDING LIABILITIES'}
          </p>
          <p className="font-heading text-3xl font-extrabold text-white mt-1">{formatINR(totalPending)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across {debts.length} active person contacts</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
          <i data-lucide={isGiven ? "hand-coins" : "landmark"} className="w-6 h-6"></i>
        </div>
      </div>

      {/* Khata Ledger List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debts.map(d => (
          <div key={d.id} className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{d.person}</h3>
                  {d.phone && <p className="text-[10px] text-slate-400 font-mono">{d.phone}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  d.status === 'SETTLED' ? 'bg-emerald-500/20 text-emerald-400' :
                  d.status === 'PARTIALLY_PAID' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {d.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 my-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Initial:</span>
                  <span className="text-slate-300 font-bold">{formatINR(d.initialAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pending:</span>
                  <span className="text-gold-400 font-bold text-sm">{formatINR(d.pendingAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-navy-800">
                  <span>Given on {d.date}</span>
                  {d.dueDate && <span className="text-amber-400">Due: {d.dueDate}</span>}
                </div>
              </div>

              {d.notes && <p className="text-[11px] text-slate-400 italic mb-4">"{d.notes}"</p>}
            </div>

            {d.status !== 'SETTLED' && (
              <button
                onClick={() => onRepay(d)}
                className="w-full py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/30 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
              >
                <i data-lucide="check-circle" className="w-4 h-4"></i>
                <span>{isGiven ? 'Log Received Repayment' : 'Log Debt Repayment'}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 10: INVESTMENT MANAGEMENT & PORTFOLIO
// ----------------------------------------------------------------------------
function InvestmentsView({ investments, accounts, financials, onOpenAddInvestment }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Investment Portfolio
          </h2>
          <p className="text-xs text-slate-400">Mutual Funds, SIPs, Equities, Gold Bonds, FDs & PPF</p>
        </div>

        <button
          onClick={onOpenAddInvestment}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md transition flex items-center gap-1.5"
        >
          <i data-lucide="plus" className="w-4 h-4"></i>
          <span>Add Investment</span>
        </button>
      </div>

      {/* Portfolio Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">TOTAL CAPITAL INVESTED</p>
          <p className="font-heading text-2xl font-extrabold text-white mt-1">{formatINR(financials.totalInvested)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Cost basis across all asset holdings</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-purple-500/30">
          <p className="text-xs uppercase tracking-wider text-purple-400 font-bold">CURRENT PORTFOLIO VALUATION</p>
          <p className="font-heading text-2xl font-extrabold text-white mt-1">{formatINR(financials.totalInvestments)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Market valuation updated regularly</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-emerald-500/30">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">TOTAL UNREALIZED P&L</p>
          <p className="font-heading text-2xl font-extrabold text-emerald-400 mt-1">
            +{formatINR(financials.investmentProfit)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Return on Capital: +{financials.totalInvested > 0 ? ((financials.investmentProfit / financials.totalInvested) * 100).toFixed(2) : 0}%
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel rounded-2xl overflow-hidden p-4">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Asset Holdings Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-navy-700 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="pb-2.5">Asset Name</th>
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">SIP Day</th>
                <th className="pb-2.5 text-right">Invested</th>
                <th className="pb-2.5 text-right">Current Value</th>
                <th className="pb-2.5 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {investments.map(inv => {
                const profit = inv.current - inv.invested;
                const pct = (profit / inv.invested) * 100;
                return (
                  <tr key={inv.id} className="hover:bg-navy-800/40">
                    <td className="py-3">
                      <p className="font-bold text-white">{inv.name}</p>
                      {inv.notes && <p className="text-[10px] text-slate-400">{inv.notes}</p>}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-purple-300 border border-navy-700">
                        {inv.type}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-300">{inv.sipDay ? `${inv.sipDay}th of month` : 'Lump-sum'}</td>
                    <td className="py-3 text-right font-mono text-slate-300">{formatINR(inv.invested)}</td>
                    <td className="py-3 text-right font-mono font-bold text-white">{formatINR(inv.current)}</td>
                    <td className={`py-3 text-right font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profit >= 0 ? '+' : ''}{formatINR(profit)} ({pct.toFixed(1)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 11: RECURRING BILLS & REMINDERS
// ----------------------------------------------------------------------------
function RecurringBillsView({ recurring, accounts, categories, onOpenAddRecurring, onPay }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Recurring Payments & Bills
          </h2>
          <p className="text-xs text-slate-400">Rent, Broadband, Electricity, Gym, Netflix, Postpaid & EMI Subscriptions</p>
        </div>

        <button
          onClick={onOpenAddRecurring}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md transition flex items-center gap-1.5"
        >
          <i data-lucide="plus" className="w-4 h-4"></i>
          <span>Add Recurring Bill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurring.map(b => {
          const acc = accounts.find(a => a.id === b.accountId);
          return (
            <div key={b.id} className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-white">{b.title}</h3>
                  <span className="font-heading text-base font-bold text-gold-400 font-mono">
                    {formatINR(b.amount)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 my-3 text-xs space-y-1">
                  <p className="text-slate-400">Next Due Date: <strong className="text-white font-mono">{b.nextDueDate}</strong></p>
                  <p className="text-slate-400">Linked Account: <strong className="text-slate-300">{acc ? acc.name : 'Default'}</strong></p>
                  <p className="text-slate-400">Auto-Pay: <span className={b.isAutoPay ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{b.isAutoPay ? 'Enabled' : 'Manual'}</span></p>
                </div>
              </div>

              <button
                onClick={() => onPay(b.id)}
                className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <i data-lucide="check" className="w-4 h-4"></i>
                <span>Mark as Paid</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 12: FINANCIAL CALENDAR
// ----------------------------------------------------------------------------
function FinancialCalendarView({ transactions, upcomingBills, onOpenAddTx }) {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map transactions by day
  const dailyData = useMemo(() => {
    const map = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTxs = transactions.filter(t => t.date === dayStr);
      const income = dayTxs.filter(t => t.type === 'INCOME').reduce((a, c) => a + Number(c.amount), 0);
      const expense = dayTxs.filter(t => t.type === 'EXPENSE').reduce((a, c) => a + Number(c.amount), 0);
      const bills = upcomingBills.filter(b => b.nextDueDate === dayStr);
      map[d] = { income, expense, bills, count: dayTxs.length };
    }
    return map;
  }, [transactions, upcomingBills, year, month, daysInMonth]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Financial Calendar — {monthName}
          </h2>
          <p className="text-xs text-slate-400">Daily income, expense velocity and scheduled bills</p>
        </div>
        <button
          onClick={onOpenAddTx}
          className="px-3.5 py-1.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs uppercase"
        >
          Add Entry
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center font-bold text-[10px] uppercase text-slate-400 pb-1">
              {d}
            </div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const data = dailyData[dayNum] || { income: 0, expense: 0, bills: [] };
            const isToday = dayNum === currentDate.getDate();

            return (
              <div
                key={dayNum}
                className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-xl border flex flex-col justify-between ${
                  isToday
                    ? 'bg-navy-800/90 border-gold-500/80 shadow-md'
                    : 'bg-navy-900/60 border-navy-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${isToday ? 'text-gold-400' : 'text-slate-300'}`}>
                    {dayNum}
                  </span>
                  {data.bills.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Bill Due"></span>
                  )}
                </div>

                <div className="space-y-0.5 text-[10px] font-mono">
                  {data.income > 0 && (
                    <p className="text-emerald-400 font-bold truncate">+{formatINR(data.income)}</p>
                  )}
                  {data.expense > 0 && (
                    <p className="text-rose-400 font-bold truncate">-{formatINR(data.expense)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 13: REPORTS & ANALYTICS
// ----------------------------------------------------------------------------
function ReportsView({ financials, transactions, categories, accounts, onExportExcel }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
            Financial Reports & Wealth Statements
          </h2>
          <p className="text-xs text-slate-400">Printable monthly and annual audits for SAMEER</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <i data-lucide="file-spreadsheet" className="w-4 h-4 text-emerald-400"></i>
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 shadow-md transition flex items-center gap-2"
          >
            <i data-lucide="printer" className="w-4 h-4"></i>
            <span>Print PDF Statement</span>
          </button>
        </div>
      </div>

      {/* Printable Financial Statement Container */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Statement Header */}
        <div className="border-b border-navy-700 pb-5 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-black text-gold-gradient uppercase tracking-tight">
              SAMEER'S MONEY MANAGER
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 mt-0.5">
              Personal Finance Control Center • Comprehensive Financial Statement
            </p>
            <p className="text-xs italic text-gold-400/80 mt-1">"Your Money. Your Control. Your Future."</p>
          </div>
          <div className="text-right text-xs">
            <p className="text-slate-400">Prepared for: <strong className="text-white">SAMEER</strong></p>
            <p className="text-slate-400">Generated: <span className="font-mono">{new Date().toLocaleString()}</span></p>
          </div>
        </div>

        {/* Master Balance Sheet Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-navy-900 border border-navy-800">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Net Worth</p>
            <p className="font-heading text-xl font-bold text-white mt-1">{formatINR(financials.netWorth)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Liquid Balances</p>
            <p className="font-heading text-xl font-bold text-emerald-400 mt-1">{formatINR(financials.liquidBalance)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Investment Portfolio</p>
            <p className="font-heading text-xl font-bold text-purple-400 mt-1">{formatINR(financials.totalInvestments)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Liabilities</p>
            <p className="font-heading text-xl font-bold text-rose-400 mt-1">{formatINR(financials.payables + financials.creditCardDues)}</p>
          </div>
        </div>

        {/* Category Share Breakdown */}
        <div>
          <h3 className="font-heading text-xs font-bold uppercase text-slate-300 tracking-wider mb-3">
            Expense Allocation by Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.filter(c => c.type === 'EXPENSE').map(cat => {
              const spent = transactions
                .filter(t => t.categoryId === cat.id)
                .reduce((a, c) => a + Number(c.amount), 0);
              if (spent === 0) return null;
              const share = ((spent / financials.totalExpenses) * 100).toFixed(1);
              return (
                <div key={cat.id} className="p-3 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-semibold text-white">{cat.name}</span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="text-white font-bold">{formatINR(spent)}</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">({share}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 14: AI MONEY ASSISTANT
// ----------------------------------------------------------------------------
function AIAssistantView({ messages, inputText, setInputText, onSend, loading, financials }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-panel rounded-2xl overflow-hidden">
      {/* AI Assistant Header */}
      <div className="p-4 bg-navy-900/90 border-b border-navy-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <i data-lucide="bot" className="w-5 h-5"></i>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold uppercase text-white tracking-wider">
              Sameer's AI Money Assistant
            </h3>
            <p className="text-[11px] text-slate-400">
              Natural Language Expense/Income Entry & Personal Financial Strategy
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400">Safe Daily Spend:</span>
          <span className="text-xs font-bold text-gold-400 font-mono">{formatINR(financials.dynamicDailyLimit)}</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-semibold shadow-md'
                : 'bg-navy-900 border border-navy-700/80 text-slate-200 shadow-xl whitespace-pre-wrap'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 text-xs text-gold-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span>
              <span>Sameer's financial advisor is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-navy-950/60 border-t border-navy-800 flex gap-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => { setInputText("What is my current net worth?"); }}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-navy-800 text-slate-300 hover:text-white hover:border-gold-500 border border-navy-700 transition"
        >
          💎 What is my net worth?
        </button>
        <button
          onClick={() => { setInputText("Spent 450 on petrol via PhonePe"); }}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-navy-800 text-slate-300 hover:text-white hover:border-gold-500 border border-navy-700 transition"
        >
          ⛽ Spent 450 on petrol via PhonePe
        </button>
        <button
          onClick={() => { setInputText("Paid 1200 for Swiggy dinner using HDFC"); }}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-navy-800 text-slate-300 hover:text-white hover:border-gold-500 border border-navy-700 transition"
        >
          🍔 Paid 1200 for Swiggy dinner
        </button>
        <button
          onClick={() => { setInputText("Received 45000 freelance bonus in HDFC"); }}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-navy-800 text-slate-300 hover:text-white hover:border-gold-500 border border-navy-700 transition"
        >
          💵 Received 45000 freelance bonus
        </button>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-navy-900 border-t border-navy-700/80">
        <form
          onSubmit={(e) => { e.preventDefault(); onSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type or speak: 'Spent 600 on lunch using GPay' or 'What is my budget status?'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODULE 15: SETTINGS & AUDIT LOGS
// ----------------------------------------------------------------------------
function SettingsView({ user, auditLogs, onExportExcel, onResetData }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
          Settings & Security Controls
        </h2>
        <p className="text-xs text-slate-400">Manage Sameer's profile, financial rules, backups and system audit history</p>
      </div>

      {/* Identity Configuration */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-heading text-sm font-bold uppercase text-gold-400 tracking-wider mb-4">
          Personal Identity & Branding
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">User Display Name</label>
            <input
              type="text"
              value="SAMEER"
              readOnly
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Currency Standard</label>
            <input
              type="text"
              value="Indian Rupee (INR - ₹)"
              readOnly
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-heading text-sm font-bold uppercase text-gold-400 tracking-wider mb-2">
          Database Backup & Storage Engine
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Export full JSON & Excel database copies for offline safekeeping.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExportExcel}
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-white border border-navy-700 text-xs font-semibold flex items-center gap-2"
          >
            <i data-lucide="download" className="w-4 h-4 text-emerald-400"></i>
            <span>Export Transactions (XLSX)</span>
          </button>
          <button
            onClick={onResetData}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2"
          >
            <i data-lucide="refresh-cw" className="w-4 h-4"></i>
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Audit History Log */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-heading text-sm font-bold uppercase text-slate-300 tracking-wider mb-3">
          Security Audit History
        </h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-gold-400 font-mono text-[10px] uppercase mr-2">[{log.module}]</span>
                <span className="text-white font-medium">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{log.timestamp.split('T')[1].slice(0, 8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MODAL COMPONENTS
// ----------------------------------------------------------------------------
function AddTransactionModal({ initialData, accounts, categories, onClose, onSubmit }) {
  const [type, setType] = useState(initialData?.type || 'EXPENSE');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0] ? accounts[0].id : '');
  const [destAccountId, setDestAccountId] = useState(accounts[1] ? accounts[1].id : '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('UPI');

  const filteredCats = categories.filter(c => c.type === type);

  useEffect(() => {
    if (filteredCats.length > 0 && !categoryId) {
      setCategoryId(filteredCats[0].id);
    }
  }, [type, filteredCats, categoryId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type,
      amount,
      accountId,
      destAccountId: type === 'TRANSFER' ? destAccountId : null,
      categoryId: type !== 'TRANSFER' ? categoryId : null,
      date,
      payee,
      notes,
      mode
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-base uppercase text-white">Record Transaction</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-navy-900 border border-navy-800">
            {['EXPENSE', 'INCOME', 'TRANSFER'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategoryId(''); }}
                className={`py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  type === t ? 'bg-gold-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-sm font-bold text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                {type === 'TRANSFER' ? 'From Account' : 'Account'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {type === 'TRANSFER' ? (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">To Account</label>
                <select
                  value={destAccountId}
                  onChange={(e) => setDestAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                >
                  {filteredCats.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Payee / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Shell Petrol, Salary, Amazon"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Notes / Description</label>
            <input
              type="text"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}

function AddAccountModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('BANK');
  const [institution, setInstitution] = useState('');
  const [last4, setLast4] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, type, institution, last4, balance, creditLimit });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-base uppercase text-white">Add Account / Card</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Account Name</label>
            <input
              type="text"
              placeholder="e.g. HDFC Salary, SBI Savings, Google Pay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                <option value="BANK">Bank Account</option>
                <option value="CASH">Cash Wallet</option>
                <option value="UPI">UPI App</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="WALLET">Digital Wallet</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Last 4 Digits</label>
              <input
                type="text"
                maxLength="4"
                placeholder="e.g. 4821"
                value={last4}
                onChange={(e) => setLast4(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                {type === 'CREDIT_CARD' ? 'Current Outstanding (₹)' : 'Initial Balance (₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            {type === 'CREDIT_CARD' && (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Credit Limit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 300000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

function AddDebtModal({ initialType, accounts, onClose, onSubmit }) {
  const [person, setPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState(initialType || 'GIVEN');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState(accounts[0] ? accounts[0].id : '');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ person, phone, type, amount, date, dueDate, accountId, notes });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-base uppercase text-white">
            {type === 'GIVEN' ? 'Record Money Given' : 'Record Money Taken'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Person Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Phone (Optional)</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Date Given/Taken</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Expected Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Linked Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Notes / Reason</label>
            <input
              type="text"
              placeholder="e.g. Laptop repair emergency loan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Save Khata Entry
          </button>
        </form>
      </div>
    </div>
  );
}

function RepayDebtModal({ debt, accounts, onClose, onSubmit }) {
  const [repayAmt, setRepayAmt] = useState(debt.pendingAmount);
  const [accountId, setAccountId] = useState(accounts[0] ? accounts[0].id : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(repayAmt, accountId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-sm uppercase text-white">Log Repayment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Person: <strong className="text-white">{debt.person}</strong> (Pending: {formatINR(debt.pendingAmount)})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Repayment Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              max={debt.pendingAmount}
              value={repayAmt}
              onChange={(e) => setRepayAmt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Deposit / Deduct Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Confirm Repayment
          </button>
        </form>
      </div>
    </div>
  );
}

function AddGoalModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, target, saved, date });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-sm uppercase text-white">Create Savings Goal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro, Bike, Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Target Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="100000"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Initial Saved (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Target Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Create Goal
          </button>
        </form>
      </div>
    </div>
  );
}

function DepositGoalModal({ goal, accounts, onClose, onSubmit }) {
  const [amt, setAmt] = useState('');
  const [accId, setAccId] = useState(accounts[0] ? accounts[0].id : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(amt, accId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-sm uppercase text-white">Deposit to Goal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <p className="text-xs text-slate-300 mb-3">Goal: <strong className="text-gold-400">{goal.name}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Deposit Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 5000"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Deduct From Account</label>
            <select
              value={accId}
              onChange={(e) => setAccId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({formatINR(a.balance)})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Confirm Deposit
          </button>
        </form>
      </div>
    </div>
  );
}

function AddInvestmentModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('MUTUAL_FUND');
  const [invested, setInvested] = useState('');
  const [current, setCurrent] = useState('');
  const [sipDay, setSipDay] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, type, invested, current: current || invested, sipDay, notes });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-base uppercase text-white">Add Investment Asset</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Asset / Scheme Name</label>
            <input
              type="text"
              placeholder="e.g. Parag Parikh Flexi Cap, HDFC Bank Shares"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Asset Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                <option value="MUTUAL_FUND">Mutual Fund</option>
                <option value="STOCKS">Equity / Stocks</option>
                <option value="GOLD">SGB / Gold</option>
                <option value="FIXED_DEPOSIT">Fixed Deposit (FD)</option>
                <option value="PPF">PPF</option>
                <option value="OTHER">Other Investment</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">SIP Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="e.g. 5 (Leave blank if lump-sum)"
                value={sipDay}
                onChange={(e) => setSipDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Total Invested (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="100000"
                value={invested}
                onChange={(e) => setInvested(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Current Value (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Leave blank if same as invested"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Notes / Portfolio Strategy</label>
            <input
              type="text"
              placeholder="e.g. Long term equity SIP for retirement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Add to Portfolio
          </button>
        </form>
      </div>
    </div>
  );
}

function AddRecurringModal({ accounts, categories, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0] ? categories[0].id : '');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [nextDueDate, setNextDueDate] = useState('');
  const [accountId, setAccountId] = useState(accounts[0] ? accounts[0].id : '');
  const [isAutoPay, setIsAutoPay] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, categoryId, amount, dueDay, nextDueDate, accountId, isAutoPay });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-navy-700 mb-4">
          <h3 className="font-heading font-bold text-base uppercase text-white">Schedule Recurring Bill</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Bill Title / Description</label>
            <input
              type="text"
              placeholder="e.g. Rent, Airtel Fiber, Netflix, Gold Gym"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Next Due Date</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Default Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autopay"
              checked={isAutoPay}
              onChange={(e) => setIsAutoPay(e.target.checked)}
              className="rounded bg-navy-900 border-navy-700 text-gold-500 focus:ring-gold-500"
            />
            <label htmlFor="autopay" className="text-xs text-slate-300">Set as Auto-Debit / Recurring Mandate</label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-500 transition shadow-md"
          >
            Save Recurring Bill
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// INITIAL RENDER AT ROOT
// ----------------------------------------------------------------------------
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
