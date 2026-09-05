const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Category = require('../models/Category');
const ImportHistory = require('../models/ImportHistory');
const Loan = require('../models/Loan');

const enableInMemoryFallback = async () => {
  console.log('[InMemory Fallback] Activating resilient in-memory database fallback with pre-seeded demo accounts...');

  const db = {
    users: [],
    expenses: [
      {
        _id: 'exp001',
        userId: 'demo_user_id',
        title: 'Swiggy Food Delivery Bangalore',
        merchant: 'Swiggy',
        amount: 450.00,
        category: 'Food',
        paymentMethod: 'UPI',
        date: new Date('2026-09-04'),
        isImported: true,
        sourceFile: { fileName: 'Sept_Statement.pdf', fileType: 'pdf' }
      },
      {
        _id: 'exp002',
        userId: 'demo_user_id',
        title: 'Marriott Luxury Hotel Mumbai',
        merchant: 'Marriott',
        amount: 6500.00,
        category: 'Hotel',
        paymentMethod: 'Credit Card',
        date: new Date('2026-09-03'),
        isImported: true,
        sourceFile: { fileName: 'Sept_Statement.pdf', fileType: 'pdf' }
      },
      {
        _id: 'exp003',
        userId: 'demo_user_id',
        title: 'Amazon India Shopping',
        merchant: 'Amazon',
        amount: 2400.00,
        category: 'Shopping',
        paymentMethod: 'Net Banking',
        date: new Date('2026-09-02'),
        isImported: false
      },
      {
        _id: 'exp004',
        userId: 'demo_user_id',
        title: 'Uber Commute',
        merchant: 'Uber',
        amount: 350.00,
        category: 'Transport',
        paymentMethod: 'UPI',
        date: new Date('2026-09-01'),
        isImported: true,
        paymentMethod: 'Debit Card',
        date: new Date('2026-09-01'),
        isImported: false,
        aiCategorized: true,
        aiConfidence: 0.91
      }
    ],
    incomes: [
      {
        _id: 'inc001',
        id: 'inc001',
        userId: 'demo_user_id',
        source: 'Primary Tech Salary',
        amount: 40000.00,
        description: 'September Base Salary',
        date: new Date('2026-09-01'),
        isImported: false
      },
      {
        _id: 'inc002',
        id: 'inc002',
        userId: 'demo_user_id',
        source: 'Freelance UI Design',
        amount: 12000.00,
        description: 'Client payment',
        date: new Date('2026-08-20'),
        isImported: false
      }
    ],
    budgets: [
      { _id: 'bgt001', id: 'bgt001', userId: 'demo_user_id', category: 'Food', amount: 8000, month: 9, year: 2026 },
      { _id: 'bgt002', id: 'bgt002', userId: 'demo_user_id', category: 'Hotel', amount: 8000, month: 9, year: 2026 },
      { _id: 'bgt003', id: 'bgt003', userId: 'demo_user_id', category: 'Shopping', amount: 5000, month: 9, year: 2026 },
      { _id: 'bgt004', id: 'bgt004', userId: 'demo_user_id', category: 'Transport', amount: 4000, month: 9, year: 2026 }
    ],
    goals: [
      {
        _id: 'goal001',
        id: 'goal001',
        userId: 'demo_user_id',
        title: 'Emergency Reserve 2026',
        targetAmount: 100000,
        currentAmount: 45000,
        deadline: new Date('2026-12-31'),
        status: 'in_progress'
      },
      {
        _id: 'goal002',
        id: 'goal002',
        userId: 'demo_user_id',
        title: 'New Laptop',
        targetAmount: 60000,
        currentAmount: 60000,
        status: 'completed'
      }
    ],
    categories: [
      { name: 'Food', type: 'expense', color: '#F59E0B', icon: 'Utensils', isDefault: true },
      { name: 'Hotel', type: 'expense', color: '#8B5CF6', icon: 'Hotel', isDefault: true },
      { name: 'Shopping', type: 'expense', color: '#EC4899', icon: 'ShoppingBag', isDefault: true },
      { name: 'Transport', type: 'expense', color: '#06B6D4', icon: 'Car', isDefault: true },
      { name: 'Bills', type: 'expense', color: '#3B82F6', icon: 'Receipt', isDefault: true },
      { name: 'Entertainment', type: 'expense', color: '#F97316', icon: 'Film', isDefault: true },
      { name: 'Healthcare', type: 'expense', color: '#10B981', icon: 'HeartPulse', isDefault: true },
      { name: 'Education', type: 'expense', color: '#6366F1', icon: 'GraduationCap', isDefault: true },
      { name: 'Rent', type: 'expense', color: '#14B8A6', icon: 'Home', isDefault: true },
      { name: 'Travel', type: 'expense', color: '#0EA5E9', icon: 'Plane', isDefault: true },
      { name: 'Loan', type: 'expense', color: '#E11D48', icon: 'Landmark', isDefault: true },
      { name: 'Salary', type: 'income', color: '#22C55E', icon: 'Briefcase', isDefault: true },
      { name: 'Other', type: 'both', color: '#6B7280', icon: 'Tag', isDefault: true }
    ],
    loans: [
      {
        _id: 'loan000',
        id: 'loan000',
        userId: 'demo_user_id',
        name: 'Primary Property / Housing Loan',
        category: 'loan',
        lender: 'Co-op',
        principalAmount: 625000,
        monthlyEMI: 0,
        paidAmount: 0,
        paidThisMonth: 0,
        remainingBalance: 625000,
        interestRate: 8.5,
        status: 'active'
      },
      {
        _id: 'loan001',
        userId: 'demo_user_id',
        name: 'HPL Joel',
        category: 'loan',
        lender: 'Co-op',
        principalAmount: 11948,
        monthlyEMI: 2800,
        paidAmount: 2800,
        paidThisMonth: 2800,
        remainingBalance: 9148,
        interestRate: 8.5,
        status: 'active'
      },
      {
        _id: 'loan002',
        userId: 'demo_user_id',
        name: 'HPL Shyla',
        category: 'loan',
        lender: 'Co-op',
        principalAmount: 10504,
        monthlyEMI: 1500,
        paidAmount: 1500,
        paidThisMonth: 1500,
        remainingBalance: 9004,
        interestRate: 8.5,
        status: 'active'
      },
      {
        _id: 'loan003',
        userId: 'demo_user_id',
        name: 'Kudumbasree Loan',
        category: 'loan',
        lender: 'Co-op',
        principalAmount: 48000,
        monthlyEMI: 5000,
        paidAmount: 8000,
        paidThisMonth: 5000,
        remainingBalance: 40000,
        interestRate: 7.0,
        status: 'active'
      },
      {
        _id: 'loan004',
        userId: 'demo_user_id',
        name: 'SVEP Loan',
        category: 'loan',
        lender: 'Co-op',
        principalAmount: 27596,
        monthlyEMI: 1300,
        paidAmount: 1300,
        paidThisMonth: 1300,
        remainingBalance: 26296,
        interestRate: 7.5,
        status: 'active'
      },
      {
        _id: 'loan005',
        userId: 'demo_user_id',
        name: 'Canara Gold Loan',
        category: 'loan',
        lender: 'Canara',
        principalAmount: 80000,
        monthlyEMI: 0,
        paidAmount: 0,
        paidThisMonth: 0,
        remainingBalance: 80000,
        interestRate: 8.5,
        status: 'active'
      },
      {
        _id: 'loan006',
        userId: 'demo_user_id',
        name: 'Minto Aunty',
        category: 'loan',
        lender: 'Personal',
        principalAmount: 55000,
        monthlyEMI: 0,
        paidAmount: 0,
        paidThisMonth: 0,
        remainingBalance: 55000,
        interestRate: 0.0,
        status: 'active'
      },
      {
        _id: 'loan007',
        userId: 'demo_user_id',
        name: 'KSFE Chitty 1',
        category: 'chitty',
        lender: 'KSFE',
        principalAmount: 810000,
        monthlyEMI: 30000,
        paidAmount: 30000,
        paidThisMonth: 0,
        remainingBalance: 780000,
        interestRate: 0.0,
        status: 'active'
      },
      {
        _id: 'loan008',
        userId: 'demo_user_id',
        name: 'KSFE Chitty 2',
        category: 'chitty',
        lender: 'KSFE',
        principalAmount: 20000,
        monthlyEMI: 2500,
        paidAmount: 2500,
        paidThisMonth: 0,
        remainingBalance: 17500,
        interestRate: 0.0,
        status: 'active'
      },
      {
        _id: 'loan009',
        userId: 'demo_user_id',
        name: 'KSFE Chitty 3',
        category: 'chitty',
        lender: 'KSFE',
        principalAmount: 62500,
        monthlyEMI: 2500,
        paidAmount: 2500,
        paidThisMonth: 0,
        remainingBalance: 60000,
        interestRate: 0.0,
        status: 'active'
      },
      {
        _id: 'loan010',
        userId: 'demo_user_id',
        name: 'Co-op ₹10 Lakh Chitty',
        category: 'chitty',
        lender: 'Co-op',
        principalAmount: 370000,
        monthlyEMI: 10000,
        paidAmount: 10000,
        paidThisMonth: 0,
        remainingBalance: 360000,
        interestRate: 0.0,
        status: 'active'
      },
      {
        _id: 'loan011',
        userId: 'demo_user_id',
        name: 'LIC Insurance/Investment',
        category: 'investment',
        lender: 'LIC',
        principalAmount: 8800,
        monthlyEMI: 2200,
        paidAmount: 2200,
        paidThisMonth: 0,
        remainingBalance: 6600,
        interestRate: 0.0,
        status: 'active'
      },
      {
        _id: 'loan012',
        userId: 'demo_user_id',
        name: 'Jeevakarunya Balance Payable',
        category: 'payable',
        lender: 'Jeevakarunya',
        principalAmount: 15000,
        monthlyEMI: 15000,
        paidAmount: 2000,
        paidThisMonth: 2000,
        remainingBalance: 13000,
        interestRate: 0.0,
        status: 'active'
      }
    ],
    imports: [
      {
        _id: 'imp001',
        userId: 'demo_user_id',
        fileName: 'Sept_Statement.pdf',
        fileType: 'pdf',
        fileSize: 245000,
        transactionCount: 45,
        status: 'completed',
        importedAt: new Date('2026-09-04')
      }
    ]
  };

  const createId = () => 'id_' + Math.random().toString(16).slice(2, 10);

  // Pre-seed Demo User and Demo Admin
  const salt = await bcrypt.genSalt(10);
  const userPasswordHash = await bcrypt.hash('Password123!', salt);
  const adminPasswordHash = await bcrypt.hash('AdminSecure123!', salt);

  const makeUserMethods = (u) => ({
    ...u,
    comparePassword: async (p) => bcrypt.compare(p, u.password),
    generateAuthToken: () => jwt.sign(
      { id: u._id, role: u.role, email: u.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    )
  });

  db.users.push(
    makeUserMethods({
      _id: 'demo_user_id',
      name: 'Joel User (Demo)',
      email: 'joel.user@example.com',
      password: userPasswordHash,
      role: 'user',
      status: 'active',
      currency: 'INR',
      createdAt: new Date()
    }),
    makeUserMethods({
      _id: 'demo_admin_id',
      name: 'Admin Superuser',
      email: 'admin@expensetracker.ai',
      password: adminPasswordHash,
      role: 'admin',
      status: 'active',
      currency: 'INR',
      createdAt: new Date()
    })
  );

  // Patch User Model
  User.findOne = (query) => {
    const email = query && query.email ? String(query.email).toLowerCase() : null;
    const user = db.users.find(u => (email ? u.email === email : true));
    return {
      select: () => user,
      then: (res) => res(user)
    };
  };

  User.findById = (id) => {
    const user = db.users.find(u => String(u._id) === String(id));
    return {
      select: () => user,
      then: (res) => res(user)
    };
  };

  User.create = async (data) => {
    const hash = await bcrypt.hash(data.password, 10);
    const u = makeUserMethods({
      _id: createId(),
      name: data.name,
      email: String(data.email).toLowerCase(),
      password: hash,
      role: data.role || 'user',
      status: 'active',
      currency: data.currency || 'INR',
      createdAt: new Date()
    });
    db.users.push(u);
    return u;
  };

  User.countDocuments = async () => db.users.length;
  User.find = () => ({
    select: () => ({
      sort: () => ({
        skip: () => ({
          limit: () => db.users.map(u => ({ ...u, password: undefined }))
        })
      })
    })
  });

  // Patch Expense Model
  Expense.create = async (d) => {
    const r = { _id: createId(), ...d, createdAt: new Date() };
    db.expenses.push(r);
    return r;
  };
  Expense.insertMany = async (recs) => {
    const inserted = recs.map(r => ({ _id: createId(), ...r, createdAt: new Date() }));
    db.expenses.push(...inserted);
    return inserted;
  };
  Expense.find = (q = {}) => {
    let list = db.expenses;
    if (q.category) list = list.filter(e => e.category === q.category);
    if (q.date && q.date.$gte && q.date.$lte) {
      list = list.filter(e => new Date(e.date) >= q.date.$gte && new Date(e.date) <= q.date.$lte);
    }
    const queryObj = {
      sort: () => queryObj,
      skip: () => queryObj,
      limit: () => list,
      then: (resolve) => resolve(list)
    };
    return queryObj;
  };
  const matchesId = (item, q) => {
    if (!item || !q) return false;
    const targetId = typeof q === 'string' ? q : (q._id || q.id || (q.$or ? (q.$or[0]._id || q.$or[0].id) : null));
    if (!targetId) return false;
    return String(item._id) === String(targetId) || String(item.id) === String(targetId);
  };

  Expense.findOne = async (q = {}) => db.expenses.find(e => q._id ? matchesId(e, q) : true) || null;
  Expense.findByIdAndUpdate = async (id, upd) => {
    const item = db.expenses.find(e => matchesId(e, id));
    if (item && upd.$set) Object.assign(item, upd.$set);
    return item;
  };
  Expense.findOneAndDelete = async (q) => {
    const idx = db.expenses.findIndex(e => matchesId(e, q));
    return idx !== -1 ? db.expenses.splice(idx, 1)[0] : null;
  };
  Expense.countDocuments = async () => db.expenses.length;
  Expense.aggregate = async () => [{ _id: null, totalSpent: db.expenses.reduce((s, e) => s + e.amount, 0) }];

  // Patch Income Model
  Income.create = async (d) => {
    const r = { _id: createId(), ...d, createdAt: new Date() };
    db.incomes.push(r);
    return r;
  };
  Income.insertMany = async (recs) => {
    const inserted = recs.map(r => ({ _id: createId(), ...r, createdAt: new Date() }));
    db.incomes.push(...inserted);
    return inserted;
  };
  Income.find = () => {
    const list = db.incomes;
    const queryObj = {
      sort: () => queryObj,
      skip: () => queryObj,
      limit: () => list,
      then: (resolve) => resolve(list)
    };
    return queryObj;
  };
  Income.findOne = async (q = {}) => db.incomes.find(i => q._id ? matchesId(i, q) : true) || null;
  Income.findByIdAndUpdate = async (id, upd) => {
    const item = db.incomes.find(i => matchesId(i, id));
    if (item && upd.$set) Object.assign(item, upd.$set);
    return item;
  };
  Income.findOneAndDelete = async (q) => {
    const idx = db.incomes.findIndex(i => matchesId(i, q));
    return idx !== -1 ? db.incomes.splice(idx, 1)[0] : null;
  };
  Income.countDocuments = async () => db.incomes.length;
  Income.aggregate = async () => [{ _id: null, totalInflow: db.incomes.reduce((s, i) => s + i.amount, 0) }];

  // Patch Budget Model
  Budget.find = async () => db.budgets;
  Budget.findOneAndUpdate = async (filter, update) => {
    let b = db.budgets.find(item => item.category === filter.category && item.month === filter.month);
    if (!b) {
      b = { _id: createId(), category: filter.category, amount: update.$set.amount, month: filter.month, year: filter.year };
      db.budgets.push(b);
    } else {
      b.amount = update.$set.amount;
    }
    return b;
  };
  Budget.findOneAndDelete = async (q) => {
    const idx = db.budgets.findIndex(b => matchesId(b, q));
    return idx !== -1 ? db.budgets.splice(idx, 1)[0] : null;
  };

  // Patch SavingsGoal Model
  SavingsGoal.find = () => ({
    sort: () => db.goals,
    then: (res) => res(db.goals)
  });
  SavingsGoal.create = async (d) => {
    const g = { _id: createId(), ...d, createdAt: new Date() };
    db.goals.push(g);
    return g;
  };
  SavingsGoal.findOne = async (q) => {
    const g = db.goals.find(goal => matchesId(goal, q));
    if (g) g.save = async function () { return this; };
    return g || null;
  };
  SavingsGoal.findByIdAndUpdate = async (id, upd) => {
    const g = db.goals.find(goal => matchesId(goal, id));
    if (g && upd.$set) Object.assign(g, upd.$set);
    return g;
  };
  SavingsGoal.findOneAndDelete = async (q) => {
    const idx = db.goals.findIndex(g => matchesId(g, q));
    return idx !== -1 ? db.goals.splice(idx, 1)[0] : null;
  };

  // Patch Category Model
  Category.find = () => ({
    sort: () => db.categories,
    then: (res) => res(db.categories)
  });
  Category.findOne = async (q) => db.categories.find(c => q.name && String(c.name).toLowerCase() === String(q.name).toLowerCase()) || null;
  Category.insertMany = async (recs) => {
    const inserted = recs.map(r => ({ _id: createId(), ...r }));
    db.categories.push(...inserted);
    return inserted;
  };
  Category.create = async (d) => {
    const c = { _id: createId(), ...d, createdAt: new Date() };
    db.categories.push(c);
    return c;
  };

  // Patch ImportHistory Model
  ImportHistory.create = async (d) => {
    const rec = { _id: createId(), ...d, importedAt: new Date() };
    db.imports.push(rec);
    return rec;
  };
  ImportHistory.find = () => ({
    sort: () => db.imports,
    then: (res) => res(db.imports)
  });
  ImportHistory.findOne = async (q) => db.imports.find(i => matchesId(i, q)) || null;
  ImportHistory.findOneAndDelete = async (q) => {
    const idx = db.imports.findIndex(i => matchesId(i, q));
    return idx !== -1 ? db.imports.splice(idx, 1)[0] : null;
  };
  ImportHistory.countDocuments = async () => db.imports.length;

  // Patch Loan Model
  Loan.find = () => ({
    sort: () => db.loans,
    then: (res) => res(db.loans)
  });
  Loan.findById = async (id) => db.loans.find(l => matchesId(l, id)) || null;
  Loan.findByIdAndUpdate = async (id, upd) => {
    const item = db.loans.find(l => matchesId(l, id));
    if (item && upd.$set) Object.assign(item, upd.$set);
    return item;
  };
  Loan.create = async (d) => {
    const newId = createId();
    const l = { _id: newId, id: newId, ...d, createdAt: new Date() };
    db.loans.push(l);
    return l;
  };
  Loan.findOne = async (q) => {
    let l = db.loans.find(loan => matchesId(loan, q));
    if (!l && q && q.$or) {
      l = db.loans.find(loan => {
        return q.$or.some(cond => {
          if (cond.name && cond.name instanceof RegExp) return cond.name.test(loan.name);
          if (cond.lender && cond.lender instanceof RegExp) return cond.lender.test(loan.lender);
          return false;
        });
      });
    }
    if (l) {
      l.save = async function () { return this; };
    }
    return l || null;
  };
  Loan.findOneAndDelete = async (q) => {
    const idx = db.loans.findIndex(l => matchesId(l, q));
    return idx !== -1 ? db.loans.splice(idx, 1)[0] : null;
  };
  Loan.countDocuments = async () => db.loans.length;

  console.log('[InMemory Fallback] Demo User ready: joel.user@example.com (Password123!)');
  console.log('[InMemory Fallback] Demo Admin ready: admin@expensetracker.ai (AdminSecure123!)');
};

module.exports = enableInMemoryFallback;
