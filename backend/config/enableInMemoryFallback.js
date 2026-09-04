const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Category = require('../models/Category');
const ImportHistory = require('../models/ImportHistory');

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
        sourceFile: { fileName: 'Sept_Statement.pdf', fileType: 'pdf' }
      },
      {
        _id: 'exp005',
        userId: 'demo_user_id',
        title: 'Electricity & Wi-Fi Bill',
        merchant: 'Airtel Broadband',
        amount: 1099.00,
        category: 'Bills',
        paymentMethod: 'Net Banking',
        date: new Date('2026-08-30'),
        isImported: false
      }
    ],
    incomes: [
      {
        _id: 'inc001',
        userId: 'demo_user_id',
        source: 'Primary Tech Salary',
        amount: 40000.00,
        description: 'September Base Salary',
        date: new Date('2026-09-01'),
        isImported: false
      },
      {
        _id: 'inc002',
        userId: 'demo_user_id',
        source: 'Freelance UI Design',
        amount: 12000.00,
        description: 'Client payment',
        date: new Date('2026-08-20'),
        isImported: false
      }
    ],
    budgets: [
      { _id: 'bgt001', userId: 'demo_user_id', category: 'Food', amount: 8000, month: 9, year: 2026 },
      { _id: 'bgt002', userId: 'demo_user_id', category: 'Hotel', amount: 8000, month: 9, year: 2026 },
      { _id: 'bgt003', userId: 'demo_user_id', category: 'Shopping', amount: 5000, month: 9, year: 2026 },
      { _id: 'bgt004', userId: 'demo_user_id', category: 'Transport', amount: 4000, month: 9, year: 2026 }
    ],
    goals: [
      {
        _id: 'goal001',
        userId: 'demo_user_id',
        title: 'Emergency Reserve 2026',
        targetAmount: 100000,
        currentAmount: 45000,
        deadline: new Date('2026-12-31'),
        status: 'in_progress'
      },
      {
        _id: 'goal002',
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
      { name: 'Salary', type: 'income', color: '#22C55E', icon: 'Briefcase', isDefault: true },
      { name: 'Other', type: 'both', color: '#6B7280', icon: 'Tag', isDefault: true }
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
  Expense.findOne = async (q = {}) => db.expenses.find(e => q._id ? String(e._id) === String(q._id) : true) || null;
  Expense.findByIdAndUpdate = async (id, upd) => {
    const item = db.expenses.find(e => String(e._id) === String(id));
    if (item && upd.$set) Object.assign(item, upd.$set);
    return item;
  };
  Expense.findOneAndDelete = async (q) => {
    const idx = db.expenses.findIndex(e => String(e._id) === String(q._id));
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
  Income.findOne = async (q = {}) => db.incomes.find(i => q._id ? String(i._id) === String(q._id) : true) || null;
  Income.findByIdAndUpdate = async (id, upd) => {
    const item = db.incomes.find(i => String(i._id) === String(id));
    if (item && upd.$set) Object.assign(item, upd.$set);
    return item;
  };
  Income.findOneAndDelete = async (q) => {
    const idx = db.incomes.findIndex(i => String(i._id) === String(q._id));
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
    const idx = db.budgets.findIndex(b => String(b._id) === String(q._id));
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
    const g = db.goals.find(goal => String(goal._id) === String(q._id));
    if (g) g.save = async function () { return this; };
    return g || null;
  };
  SavingsGoal.findByIdAndUpdate = async (id, upd) => {
    const g = db.goals.find(goal => String(goal._id) === String(id));
    if (g && upd.$set) Object.assign(g, upd.$set);
    return g;
  };
  SavingsGoal.findOneAndDelete = async (q) => {
    const idx = db.goals.findIndex(g => String(g._id) === String(q._id));
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
  ImportHistory.findOne = async (q) => db.imports.find(i => String(i._id) === String(q._id)) || null;
  ImportHistory.findOneAndDelete = async (q) => {
    const idx = db.imports.findIndex(i => String(i._id) === String(q._id));
    return idx !== -1 ? db.imports.splice(idx, 1)[0] : null;
  };
  ImportHistory.countDocuments = async () => db.imports.length;

  console.log('[InMemory Fallback] Demo User ready: joel.user@example.com (Password123!)');
  console.log('[InMemory Fallback] Demo Admin ready: admin@expensetracker.ai (AdminSecure123!)');
};

module.exports = enableInMemoryFallback;
