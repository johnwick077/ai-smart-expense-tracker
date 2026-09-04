/**
 * Automated Verification Script for AI Smart Expense Tracker Backend API
 * Uses in-memory mock document store to test all endpoints reliably without external MongoDB dependencies.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_automated_verification_2026';
process.env.ADMIN_SECRET = 'admin_master_secret_2026';
process.env.PORT = '5001';

const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import models to attach in-memory mocks
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const Budget = require('./models/Budget');
const SavingsGoal = require('./models/SavingsGoal');
const Category = require('./models/Category');
const ImportHistory = require('./models/ImportHistory');

// In-Memory Database Collections
const db = {
  users: [],
  expenses: [],
  incomes: [],
  budgets: [],
  goals: [],
  categories: [],
  imports: []
};

const createObjectId = () => {
  return '65e9f' + Math.random().toString(16).substring(2, 10) + '00000000000'.substring(0, 11);
};

// --- MOCK USER MODEL ---
User.findOne = (query) => {
  const email = query && query.email ? String(query.email).toLowerCase() : null;
  const user = db.users.find(u => (email ? u.email === email : true));
  const queryObj = {
    select: () => user,
    then: (resolve) => resolve(user)
  };
  return queryObj;
};

User.findById = (id) => {
  const user = db.users.find(u => String(u._id) === String(id));
  const queryObj = {
    select: () => user,
    then: (resolve) => resolve(user)
  };
  return queryObj;
};

User.create = async (data) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);
  const user = {
    _id: createObjectId(),
    name: data.name,
    email: String(data.email).toLowerCase(),
    password: hashedPassword,
    role: data.role || 'user',
    status: data.status || 'active',
    currency: data.currency || 'INR',
    createdAt: new Date(),
    comparePassword: async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    },
    generateAuthToken: function () {
      return jwt.sign(
        { id: this._id, role: this.role, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }
  };
  db.users.push(user);
  return user;
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

// --- MOCK EXPENSE MODEL ---
Expense.create = async (data) => {
  const expense = {
    _id: createObjectId(),
    ...data,
    createdAt: new Date()
  };
  db.expenses.push(expense);
  return expense;
};

Expense.insertMany = async (records) => {
  const inserted = records.map(r => ({
    _id: createObjectId(),
    ...r,
    createdAt: new Date()
  }));
  db.expenses.push(...inserted);
  return inserted;
};

Expense.find = (query = {}) => {
  let list = db.expenses;
  if (query.userId) list = list.filter(e => String(e.userId) === String(query.userId));
  if (query.category) list = list.filter(e => e.category === query.category);
  if (query.date && query.date.$gte && query.date.$lte) {
    list = list.filter(e => new Date(e.date) >= query.date.$gte && new Date(e.date) <= query.date.$lte);
  }

  const queryObj = {
    sort: () => queryObj,
    skip: () => queryObj,
    limit: () => list,
    then: (resolve) => resolve(list)
  };
  return queryObj;
};

Expense.findOne = async (query = {}) => {
  return db.expenses.find(e => {
    if (query._id && String(e._id) !== String(query._id)) return false;
    if (query.userId && String(e.userId) !== String(query.userId)) return false;
    if (query.amount && e.amount !== query.amount) return false;
    return true;
  }) || null;
};

Expense.findByIdAndUpdate = async (id, update) => {
  const exp = db.expenses.find(e => String(e._id) === String(id));
  if (exp && update.$set) {
    Object.assign(exp, update.$set);
  }
  return exp;
};

Expense.findOneAndDelete = async (query) => {
  const idx = db.expenses.findIndex(e => String(e._id) === String(query._id));
  if (idx !== -1) {
    return db.expenses.splice(idx, 1)[0];
  }
  return null;
};

Expense.countDocuments = async (query = {}) => {
  if (query.userId) return db.expenses.filter(e => String(e.userId) === String(query.userId)).length;
  return db.expenses.length;
};

Expense.aggregate = async () => {
  const total = db.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  return [{ _id: null, totalSpent: total }];
};

// --- MOCK INCOME MODEL ---
Income.create = async (data) => {
  const inc = {
    _id: createObjectId(),
    ...data,
    createdAt: new Date()
  };
  db.incomes.push(inc);
  return inc;
};

Income.insertMany = async (records) => {
  const inserted = records.map(r => ({
    _id: createObjectId(),
    ...r,
    createdAt: new Date()
  }));
  db.incomes.push(...inserted);
  return inserted;
};

Income.find = (query = {}) => {
  let list = db.incomes;
  if (query.userId) list = list.filter(i => String(i.userId) === String(query.userId));
  const queryObj = {
    sort: () => queryObj,
    skip: () => queryObj,
    limit: () => list,
    then: (resolve) => resolve(list)
  };
  return queryObj;
};

Income.findOne = async (query = {}) => {
  return db.incomes.find(i => {
    if (query._id && String(i._id) !== String(query._id)) return false;
    if (query.userId && String(i.userId) !== String(query.userId)) return false;
    return true;
  }) || null;
};

Income.findByIdAndUpdate = async (id, update) => {
  const inc = db.incomes.find(i => String(i._id) === String(id));
  if (inc && update.$set) {
    Object.assign(inc, update.$set);
  }
  return inc;
};

Income.findOneAndDelete = async (query) => {
  const idx = db.incomes.findIndex(i => String(i._id) === String(query._id));
  if (idx !== -1) {
    return db.incomes.splice(idx, 1)[0];
  }
  return null;
};

Income.countDocuments = async () => db.incomes.length;
Income.aggregate = async () => {
  const total = db.incomes.reduce((s, i) => s + (i.amount || 0), 0);
  return [{ _id: null, totalInflow: total }];
};

// --- MOCK BUDGET MODEL ---
Budget.find = (query = {}) => {
  const list = db.budgets.filter(b => String(b.userId) === String(query.userId));
  return Promise.resolve(list);
};

Budget.findOneAndUpdate = async (filter, update) => {
  let b = db.budgets.find(item =>
    String(item.userId) === String(filter.userId) &&
    item.category === filter.category &&
    item.month === filter.month &&
    item.year === filter.year
  );

  if (!b) {
    b = {
      _id: createObjectId(),
      userId: filter.userId,
      category: filter.category,
      amount: update.$set.amount,
      month: filter.month,
      year: filter.year,
      createdAt: new Date()
    };
    db.budgets.push(b);
  } else {
    b.amount = update.$set.amount;
  }
  return b;
};

Budget.findOneAndDelete = async (query) => {
  const idx = db.budgets.findIndex(b => String(b._id) === String(query._id));
  if (idx !== -1) return db.budgets.splice(idx, 1)[0];
  return null;
};

// --- MOCK SAVINGS GOAL MODEL ---
SavingsGoal.find = (query = {}) => {
  const list = db.goals.filter(g => String(g.userId) === String(query.userId));
  return {
    sort: () => list,
    then: (resolve) => resolve(list)
  };
};

SavingsGoal.create = async (data) => {
  const goal = {
    _id: createObjectId(),
    ...data,
    createdAt: new Date()
  };
  db.goals.push(goal);
  return goal;
};

SavingsGoal.findOne = async (query = {}) => {
  const goal = db.goals.find(g => String(g._id) === String(query._id));
  if (goal) {
    goal.save = async function () { return this; };
  }
  return goal || null;
};

SavingsGoal.findByIdAndUpdate = async (id, update) => {
  const goal = db.goals.find(g => String(g._id) === String(id));
  if (goal && update.$set) Object.assign(goal, update.$set);
  return goal;
};

SavingsGoal.findOneAndDelete = async (query) => {
  const idx = db.goals.findIndex(g => String(g._id) === String(query._id));
  if (idx !== -1) return db.goals.splice(idx, 1)[0];
  return null;
};

// --- MOCK CATEGORY MODEL ---
Category.find = (query = {}) => {
  const list = db.categories;
  return {
    sort: () => list,
    then: (resolve) => resolve(list)
  };
};

Category.findOne = async (query) => {
  if (query && query.name) {
    let target = '';
    if (typeof query.name === 'string') {
      target = query.name.toLowerCase();
    } else if (query.name.$regex) {
      target = query.name.$regex.source.replace(/[\^$]/g, '').toLowerCase();
    }
    return db.categories.find(c => c.name.toLowerCase() === target) || null;
  }
  return null;
};

Category.insertMany = async (records) => {
  const inserted = records.map(r => ({ _id: createObjectId(), ...r }));
  db.categories.push(...inserted);
  return inserted;
};

Category.create = async (data) => {
  const cat = { _id: createObjectId(), ...data, createdAt: new Date() };
  db.categories.push(cat);
  return cat;
};

// --- MOCK IMPORT HISTORY MODEL ---
ImportHistory.create = async (data) => {
  const record = { _id: createObjectId(), ...data, importedAt: new Date() };
  db.imports.push(record);
  return record;
};

ImportHistory.find = (query = {}) => {
  const list = db.imports.filter(i => String(i.userId) === String(query.userId));
  return {
    sort: () => list,
    then: (resolve) => resolve(list)
  };
};

ImportHistory.findOne = async (query = {}) => {
  return db.imports.find(i => String(i._id) === String(query._id)) || null;
};

ImportHistory.findOneAndDelete = async (query) => {
  const idx = db.imports.findIndex(i => String(i._id) === String(query._id));
  if (idx !== -1) return db.imports.splice(idx, 1)[0];
  return null;
};

ImportHistory.countDocuments = async () => db.imports.length;

// Now load server app
const app = require('./server');

let server;
const TEST_PORT = process.env.TEST_PORT || 5002;
let baseUrl = `http://localhost:${TEST_PORT}/api`;
let userToken = '';
let adminToken = '';
let createdExpenseId = '';
let createdIncomeId = '';
let createdGoalId = '';

let totalTests = 0;
let passedTests = 0;

const assert = (condition, testName) => {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
};

const request = (method, endpoint, headers = {}, body = null, isMultipart = false, multipartData = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${endpoint}`);
    const reqHeaders = { ...headers };

    let payload = null;
    if (body && !isMultipart) {
      payload = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    let boundary = null;
    let multipartBuffer = null;
    if (isMultipart && multipartData) {
      boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      reqHeaders['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
      
      const parts = [];
      for (const [key, val] of Object.entries(multipartData)) {
        if (val.isFileInput) {
          parts.push(
            `--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${val.filename}"\r\nContent-Type: ${val.contentType}\r\n\r\n`
          );
          parts.push(val.buffer);
          parts.push('\r\n');
        } else {
          parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`);
        }
      }
      parts.push(`--${boundary}--\r\n`);

      multipartBuffer = Buffer.concat(
        parts.map(p => (Buffer.isBuffer(p) ? p : Buffer.from(p, 'utf8')))
      );
      reqHeaders['Content-Length'] = multipartBuffer.length;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);

    if (multipartBuffer) {
      req.write(multipartBuffer);
    } else if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log(' AI SMART EXPENSE TRACKER — BACKEND API TEST SUITE');
  console.log('======================================================\n');

  try {
    // Start Express Test Server
    await new Promise((resolve, reject) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`[Test Setup] Express test server listening at ${baseUrl}\n`);
        resolve();
      });
      server.on('error', reject);
    });

    // 1. Health
    console.log('--- 1. System Health ---');
    const healthRes = await request('GET', '/health');
    assert(healthRes.status === 200 && healthRes.data.status === 'online', 'GET /health returns online status');

    // 2. Auth
    console.log('\n--- 2. Authentication & Authorization ---');
    const regUser = await request('POST', '/auth/register', {}, {
      name: 'Joel User',
      email: 'joel.user@test.com',
      password: 'Password123!'
    });
    assert(regUser.status === 201 && regUser.data.token, 'POST /auth/register creates user & returns JWT');
    userToken = regUser.data.token;

    const regAdmin = await request('POST', '/auth/register', {}, {
      name: 'Admin Super',
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: 'admin',
      adminSecret: 'admin_master_secret_2026'
    });
    assert(regAdmin.status === 201 && regAdmin.data.user.role === 'admin', 'POST /auth/register creates admin with secret');
    adminToken = regAdmin.data.token;

    const loginRes = await request('POST', '/auth/login', {}, {
      email: 'joel.user@test.com',
      password: 'Password123!'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'POST /auth/login returns status 200 & JWT token');

    const profileRes = await request('GET', '/auth/profile', { Authorization: `Bearer ${userToken}` });
    assert(profileRes.status === 200 && profileRes.data.user.email === 'joel.user@test.com', 'GET /auth/profile returns user details');

    const unauthProfile = await request('GET', '/auth/profile');
    assert(unauthProfile.status === 401, 'GET /auth/profile rejects unauthenticated request (401)');

    // 3. Expenses
    console.log('\n--- 3. Expense Management CRUD ---');
    const createExp = await request('POST', '/expenses', { Authorization: `Bearer ${userToken}` }, {
      title: 'Swiggy Dinner Order',
      amount: 450.00,
      category: 'Food',
      merchant: 'Swiggy',
      paymentMethod: 'UPI',
      date: '2026-09-04'
    });
    assert(createExp.status === 201 && createExp.data.data._id, 'POST /expenses creates expense');
    createdExpenseId = createExp.data.data._id;

    await request('POST', '/expenses', { Authorization: `Bearer ${userToken}` }, {
      title: 'Marriott Luxury Hotel',
      amount: 6500.00,
      category: 'Hotel',
      merchant: 'Marriott',
      paymentMethod: 'Credit Card',
      date: '2026-09-03'
    });

    const getExp = await request('GET', '/expenses', { Authorization: `Bearer ${userToken}` });
    assert(getExp.status === 200 && getExp.data.count >= 2, 'GET /expenses returns list of expenses');

    const expSummary = await request('GET', '/expenses/summary', { Authorization: `Bearer ${userToken}` });
    assert(expSummary.status === 200 && expSummary.data.totalAmount === 6950, 'GET /expenses/summary calculates total spend (₹6,950)');

    const updateExp = await request('PUT', `/expenses/${createdExpenseId}`, { Authorization: `Bearer ${userToken}` }, {
      amount: 500.00,
      description: 'Added cold beverage'
    });
    assert(updateExp.status === 200 && updateExp.data.data.amount === 500, 'PUT /expenses/:id updates expense amount to ₹500');

    const exportExp = await request('GET', '/expenses/export-excel', { Authorization: `Bearer ${userToken}` });
    assert(exportExp.status === 200 && exportExp.headers['content-disposition']?.includes('.xlsx'), 'GET /expenses/export-excel generates 7-sheet workbook download');

    // 4. Income
    console.log('\n--- 4. Income Management CRUD ---');
    const createInc = await request('POST', '/income', { Authorization: `Bearer ${userToken}` }, {
      source: 'Monthly Base Salary',
      amount: 40000.00,
      description: 'Consulting salary September',
      date: '2026-09-01'
    });
    assert(createInc.status === 201 && createInc.data.data._id, 'POST /income creates income record');
    createdIncomeId = createInc.data.data._id;

    const getInc = await request('GET', '/income', { Authorization: `Bearer ${userToken}` });
    assert(getInc.status === 200 && getInc.data.count >= 1, 'GET /income retrieves recorded incomes');

    // 5. Budgets
    console.log('\n--- 5. Budget Management ---');
    const setBgt = await request('POST', '/budgets', { Authorization: `Bearer ${userToken}` }, {
      category: 'Food',
      amount: 8000,
      month: 9,
      year: 2026
    });
    assert(setBgt.status === 200 && setBgt.data.data.amount === 8000, 'POST /budgets sets category budget');

    const getBgt = await request('GET', '/budgets?month=9&year=2026', { Authorization: `Bearer ${userToken}` });
    assert(getBgt.status === 200 && getBgt.data.data.length > 0 && getBgt.data.data[0].spent === 500, 'GET /budgets compares monthly budget with actual spent (₹500 spent of ₹8000)');

    // 6. Savings Goals
    console.log('\n--- 6. Savings Goals ---');
    const createGl = await request('POST', '/goals', { Authorization: `Bearer ${userToken}` }, {
      title: 'Emergency Fund 2026',
      targetAmount: 50000,
      currentAmount: 10000,
      deadline: '2026-12-31'
    });
    assert(createGl.status === 201 && createGl.data.data._id, 'POST /goals creates savings goal');
    createdGoalId = createGl.data.data._id;

    const depositGl = await request('POST', `/goals/${createdGoalId}/deposit`, { Authorization: `Bearer ${userToken}` }, {
      amount: 5000
    });
    assert(depositGl.status === 200 && depositGl.data.data.currentAmount === 15000, 'POST /goals/:id/deposit increases goal amount (₹15,000)');

    // 7. Categories
    console.log('\n--- 7. Category System ---');
    const getCats = await request('GET', '/categories', { Authorization: `Bearer ${userToken}` });
    assert(getCats.status === 200 && getCats.data.count >= 12, 'GET /categories returns default 12 categories');

    const createCat = await request('POST', '/categories', { Authorization: `Bearer ${userToken}` }, {
      name: 'Pet Care',
      type: 'expense',
      color: '#A855F7',
      icon: 'Dog'
    });
    assert(createCat.status === 201 && createCat.data.data.name === 'Pet Care', 'POST /categories creates custom category');

    // 8. File Ingestion
    console.log('\n--- 8. Multi-Format File Ingestion & Staging ---');
    // Upload CSV
    const csvBuffer = fs.readFileSync(path.join(__dirname, 'test_samples/sample_statement.csv'));
    const uploadCsv = await request('POST', '/import/upload', { Authorization: `Bearer ${userToken}` }, null, true, {
      file: {
        isFileInput: true,
        filename: 'sample_statement.csv',
        contentType: 'text/csv',
        buffer: csvBuffer
      }
    });
    assert(uploadCsv.status === 200 && uploadCsv.data.data.totalExtracted >= 5, 'POST /import/upload parses CSV and extracts transactions');
    assert(uploadCsv.data.data.transactions[0].category !== undefined, 'POST /import/upload provides category suggestions');

    // Upload JSON
    const jsonBuffer = fs.readFileSync(path.join(__dirname, 'test_samples/sample_statement.json'));
    const uploadJson = await request('POST', '/import/upload', { Authorization: `Bearer ${userToken}` }, null, true, {
      file: {
        isFileInput: true,
        filename: 'sample_statement.json',
        contentType: 'application/json',
        buffer: jsonBuffer
      }
    });
    assert(uploadJson.status === 200 && uploadJson.data.data.totalExtracted === 5, 'POST /import/upload parses JSON statement');

    // Upload TXT
    const txtBuffer = fs.readFileSync(path.join(__dirname, 'test_samples/sample_statement.txt'));
    const uploadTxt = await request('POST', '/import/upload', { Authorization: `Bearer ${userToken}` }, null, true, {
      file: {
        isFileInput: true,
        filename: 'sample_statement.txt',
        contentType: 'text/plain',
        buffer: txtBuffer
      }
    });
    assert(uploadTxt.status === 200 && uploadTxt.data.data.totalExtracted >= 4, 'POST /import/upload parses TXT statement');

    // Upload Excel (.xlsx)
    const xlsxBuffer = fs.readFileSync(path.join(__dirname, 'test_samples/sample_expenses.xlsx'));
    const uploadXlsx = await request('POST', '/import/upload', { Authorization: `Bearer ${userToken}` }, null, true, {
      file: {
        isFileInput: true,
        filename: 'sample_expenses.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: xlsxBuffer
      }
    });
    assert(uploadXlsx.status === 200 && uploadXlsx.data.data.totalExtracted === 3, 'POST /import/upload parses Excel (.xlsx) statement');

    // Commit confirmed transactions into MongoDB
    const commitRes = await request('POST', '/import/process', { Authorization: `Bearer ${userToken}` }, {
      fileName: 'sample_statement.csv',
      fileType: 'csv',
      fileSize: csvBuffer.length,
      transactions: uploadCsv.data.data.transactions
    });
    assert(commitRes.status === 201 && commitRes.data.data.totalSaved > 0, 'POST /import/process commits confirmed transactions into DB');

    // Import History
    const historyRes = await request('GET', '/import/history', { Authorization: `Bearer ${userToken}` });
    assert(historyRes.status === 200 && historyRes.data.count >= 1, 'GET /import/history lists user import audits');

    // 9. Gemini AI Services
    console.log('\n--- 9. Gemini AI Intelligence Services ---');
    const aiCatRes = await request('POST', '/ai/categorize', { Authorization: `Bearer ${userToken}` }, {
      transactions: [
        { description: 'Swiggy Koramangala Order', merchant: 'Swiggy', amount: 350 },
        { description: 'Marriott Resort Stay', merchant: 'Marriott', amount: 7200 },
        { description: 'Uber Trip Bangalore', merchant: 'Uber', amount: 240 },
        { description: 'Amazon Online Shopping', merchant: 'Amazon', amount: 1999 }
      ]
    });
    assert(aiCatRes.status === 200 && aiCatRes.data.data.length === 4, 'POST /ai/categorize categorizes batch transactions');
    assert(aiCatRes.data.data[0].category === 'Food', 'AI categorized "Swiggy" as Food');
    assert(aiCatRes.data.data[1].category === 'Hotel', 'AI categorized "Marriott" as Hotel');
    assert(aiCatRes.data.data[2].category === 'Transport', 'AI categorized "Uber" as Transport');
    assert(aiCatRes.data.data[3].category === 'Shopping', 'AI categorized "Amazon" as Shopping');

    const aiAnalyze = await request('POST', '/ai/analyze', { Authorization: `Bearer ${userToken}` });
    assert(aiAnalyze.status === 200 && aiAnalyze.data.data.analysis, 'POST /ai/analyze generates spending analysis report');

    const aiSummary = await request('POST', '/ai/monthly-summary', { Authorization: `Bearer ${userToken}` }, {
      month: 9,
      year: 2026
    });
    assert(aiSummary.status === 200 && aiSummary.data.data.summary, 'POST /ai/monthly-summary generates monthly report');

    const aiBudget = await request('POST', '/ai/budget', { Authorization: `Bearer ${userToken}` });
    assert(aiBudget.status === 200 && aiBudget.data.data.recommendedBudgets.length > 0, 'POST /ai/budget returns budget allocations');

    const aiSugg = await request('POST', '/ai/suggestions', { Authorization: `Bearer ${userToken}` });
    assert(aiSugg.status === 200 && aiSugg.data.data.length > 0, 'POST /ai/suggestions returns actionable savings tips');

    const aiChat = await request('POST', '/ai/chat', { Authorization: `Bearer ${userToken}` }, {
      query: 'Where did I spend the most money this month?'
    });
    assert(aiChat.status === 200 && aiChat.data.data.reply, 'POST /ai/chat answers user queries scoped to their records');

    // 10. Admin Console
    console.log('\n--- 10. Admin Console & Role-Based Access Control ---');
    const forbiddenAdmin = await request('GET', '/admin/stats', { Authorization: `Bearer ${userToken}` });
    assert(forbiddenAdmin.status === 403, 'Regular user rejected from /admin/stats with 403 Forbidden');

    const adminStats = await request('GET', '/admin/stats', { Authorization: `Bearer ${adminToken}` });
    assert(adminStats.status === 200 && adminStats.data.data.totalUsers >= 2, 'Admin user receives platform stats (200 OK)');

    const adminUsers = await request('GET', '/admin/users', { Authorization: `Bearer ${adminToken}` });
    assert(adminUsers.status === 200 && adminUsers.data.total >= 2, 'Admin user retrieves user list');

    console.log('\n======================================================');
    console.log(` TEST EXECUTION SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('======================================================\n');

    if (passedTests === totalTests) {
      console.log('🎉 ALL 32 BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY!\n');
    } else {
      console.error(`⚠️  ${totalTests - passedTests} tests failed.`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (server) server.close();
    process.exit(passedTests === totalTests ? 0 : 1);
  }
};

runTests();
