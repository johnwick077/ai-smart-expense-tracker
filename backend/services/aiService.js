const { getModel } = require('../config/ai');

const PREDEFINED_CATEGORIES = [
  'Food',
  'Hotel',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Rent',
  'Travel',
  'Loan',
  'Salary',
  'Other'
];

// High-confidence heuristic keyword mapping (offline/fallback intelligence across all sectors)
const HEURISTIC_KEYWORDS = {
  Loan: [
    'loan', 'loans', 'chitty', 'chitti', 'chitties', 'chit fund', 'chit', 'ksfe',
    'gold loan', 'goldloan', 'interest', 'int.pd', 'int pd', 'int paid', 'emi',
    'muthoot', 'manappuram', 'bajaj finance', 'finance', 'nbfc', 'repayment',
    'principal', 'home loan', 'car loan', 'personal loan', 'term loan', 'debt',
    'kudumbasree', 'svep', 'co-op loan'
  ],
  Hotel: [
    'hotel', 'hotels', 'marriott', 'hyatt', 'hilton', 'radisson', 'resort',
    'stay', 'airbnb', 'oyo', 'taj', 'lodging', 'inn', 'residency', 'suites', 'lodge'
  ],
  Food: [
    'bakery', 'bakeries', 'bake', 'cakes', 'cake', 'pastry', 'patisserie', 'bread',
    'buns', 'sweets', 'mithai', 'swiggy', 'zomato', 'mcdonald', 'kfc', 'starbucks',
    'cafe', 'restaurant', 'burger', 'pizza', 'dine', 'blinkit', 'zepto',
    'instamart', 'groceries', 'tea', 'coffee', 'food', 'canteen'
  ],
  Shopping: [
    'silks', 'silk', 'textile', 'textiles', 'saree', 'sarees', 'pothys',
    'kalyan silks', 'chennai silks', 'hypermarket', 'supermarket', 'mart',
    'bazar', 'bazaar', 'big bazaar', 'big bazar', 'smart bazaar', 'palika bazar',
    'meena bazaar', 'dmart', 'd-mart', 'lulu', 'amazon', 'flipkart', 'myntra',
    'zara', 'h&m', 'nike', 'adidas', 'apple', 'retail', 'mall', 'clothing',
    'fashion', 'electronics', 'ikea', 'reliance fresh', 'shoppers stop'
  ],
  Healthcare: [
    'pharmacy', 'medicine', 'medicines', 'medical', 'chemist', 'medplus', 'apollo',
    'apollo pharmacy', 'netmeds', 'pharmeasy', '1mg', 'tata 1mg', 'hospital',
    'clinic', 'doctor', 'dr.', 'dentist', 'dental', 'lab', 'diagnostics',
    'pathology', 'scan', 'mri', 'x-ray', 'physiotherapy', 'opticals', 'lenskart',
    'health', 'ayurveda', 'homeopathy', 'druggist', 'meds'
  ],
  Transport: [
    'uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel', 'cng', 'shell',
    'hpcl', 'bpcl', 'iocl', 'indian oil', 'bharat petroleum', 'irctc', 'railway',
    'flight', 'indigo', 'air india', 'toll', 'fastag', 'cab', 'auto', 'bus', 'ksrtc'
  ],
  Bills: [
    'airtel', 'jio', 'vi', 'vodafone', 'bsnl', 'bescom', 'kseb', 'tneb', 'electricity',
    'electric', 'power', 'water', 'gas', 'indane', 'bharat gas', 'cylinder',
    'broadband', 'wifi', 'dth', 'tata play', 'utility', 'recharge', 'bill',
    'insurance', 'lic', 'premium', 'tax', 'maintenance'
  ],
  Entertainment: [
    'netflix', 'spotify', 'prime video', 'hotstar', 'disney', 'youtube', 'pvr',
    'inox', 'cinepolis', 'cinema', 'movie', 'bookmyshow', 'game', 'playstation', 'steam'
  ],
  Education: [
    'coursera', 'udemy', 'college', 'school', 'university', 'tuition', 'books',
    'fees', 'stationery', 'udacity', 'edx', 'course', 'exam', 'classes'
  ],
  Rent: [
    'rent', 'landlord', 'society', 'maintenance', 'flat rent', 'apartment', 'house rent'
  ],
  Travel: [
    'makemytrip', 'goibibo', 'easemytrip', 'booking.com', 'agoda', 'expedia', 'visa', 'tour', 'travels'
  ],
  Salary: [
    'salary', 'payroll', 'wages', 'stipend', 'bonus', 'inflow', 'freelance payment'
  ]
};

// Exact domain rules requested by user to guarantee 100% adherence
const USER_PRIORITY_RULES = [
  // 1. Loans, Chitty, Gold Loan, Interest
  { keywords: ['chitty', 'chitti', 'chitties', 'chit fund', 'gold loan', 'goldloan', 'loan', 'loans', 'interest', 'int.pd', 'int pd', 'int paid', 'int debit', 'kudumbasree', 'svep'], category: 'Loan' },
  // 2. Pharmacy, Medicine, Medical, Healthcare
  { keywords: ['pharmacy', 'medicine', 'medicines', 'medical', 'chemist', 'apollo pharmacy', 'medplus', 'netmeds', 'pharmeasy', '1mg', 'hospital', 'clinic', 'druggist'], category: 'Healthcare' },
  // 3. Silks, Hypermarket, Bazar
  { keywords: ['silks', 'silk', 'hypermarket', 'supermarket', 'bazar', 'bazaar'], category: 'Shopping' },
  // 4. Bakery
  { keywords: ['bakery', 'bakeries', 'bakehouse'], category: 'Food' },
  // 5. Hotel
  { keywords: ['hotel', 'hotels'], category: 'Hotel' }
];

/**
 * Heuristic classifier for rapid fallback when AI API is unreachable
 */
const classifyByHeuristics = (text) => {
  if (!text) return { category: 'Other', confidence: 0.5 };
  const lower = String(text).toLowerCase();

  // Check strict user priority rules first (handles hypermarket over groceries, chitty, etc.)
  for (const rule of USER_PRIORITY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return { category: rule.category, confidence: 0.99 };
      }
    }
  }

  // Check general heuristic keywords
  for (const [cat, keywords] of Object.entries(HEURISTIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return { category: cat, confidence: 0.96 };
      }
    }
  }

  return { category: 'Other', confidence: 0.6 };
};

/**
 * Batch categorize transactions using Google Gemini AI or intelligent heuristics
 */
const categorizeBatch = async (transactions) => {
  if (!transactions || transactions.length === 0) return [];

  // Group unique merchants to optimize Gemini API calls
  const merchantMap = new Map();
  transactions.forEach((txn, idx) => {
    const key = (txn.merchant || txn.description || 'Unknown').trim().toLowerCase();
    if (!merchantMap.has(key)) {
      merchantMap.set(key, {
        sampleDescription: txn.description,
        sampleMerchant: txn.merchant,
        indices: [idx]
      });
    } else {
      merchantMap.get(key).indices.push(idx);
    }
  });

  const uniqueEntries = Array.from(merchantMap.entries()).map(([key, data], id) => ({
    id,
    key,
    description: data.sampleDescription,
    merchant: data.sampleMerchant
  }));

  const model = getModel();
  const categoryResults = new Map();

  if (model) {
    try {
      const prompt = `
You are an expert financial categorization AI engine.
Categorize each of the following financial transaction descriptions into EXACTLY ONE of these categories:
[${PREDEFINED_CATEGORIES.join(', ')}]

Domain Rules:
1. Words like "silks", "silk", "textiles", "saree", "hypermarket", "supermarket", "bazar", "bazaar", "mart", "mall" MUST be categorized as "Shopping".
2. Words like "bakery", "bake", "cakes", "pastry", "bread", "cafe", "restaurant", "food", "dine" MUST be categorized as "Food".
3. Words like "hotel", "hotels", "residency", "inn", "lodge", "resort", "stay", "suites" MUST be categorized as "Hotel".
4. Words like "chitty", "chitti", "chit fund", "loan", "gold loan", "interest", "int.pd", "emi", "muthoot", "ksfe", "finance" MUST be categorized as "Loan".
5. Words like "pharmacy", "medicine", "medicines", "medical", "chemist", "apollo", "medplus", "1mg", "pharmeasy", "hospital", "clinic", "doctor" MUST be categorized as "Healthcare".
6. Return ONLY a valid JSON array of objects. Do not include markdown wraps or explanations.
7. Format: [{"id": 0, "category": "Food", "confidence": 0.95}]
8. If uncertain, categorize as "Other" with confidence 0.50.

Transactions to categorize:
${JSON.stringify(uniqueEntries.map(e => ({ id: e.id, text: e.description || e.merchant })))}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Clean possible markdown code fence
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          const entry = uniqueEntries.find(u => u.id === item.id);
          if (entry && PREDEFINED_CATEGORIES.includes(item.category)) {
            categoryResults.set(entry.key, {
              category: item.category,
              confidence: parseFloat(item.confidence) || 0.9
            });
          }
        });
      }
    } catch (err) {
      console.warn(`[Gemini AI] Batch categorization API error: ${err.message}. Falling back to heuristic classifier.`);
    }
  }

  // Apply categories (from Gemini or heuristic fallback) back to all transactions
  return transactions.map(txn => {
    const fullText = `${txn.description || ''} ${txn.merchant || ''}`;
    const heuristic = classifyByHeuristics(fullText);

    // If deterministic domain heuristic matched high-priority keywords, enforce it
    if (heuristic.confidence >= 0.95) {
      return {
        ...txn,
        category: heuristic.category,
        aiCategorized: true,
        aiConfidence: heuristic.confidence
      };
    }

    const key = (txn.merchant || txn.description || 'Unknown').trim().toLowerCase();
    const aiResult = categoryResults.get(key);

    if (aiResult) {
      return {
        ...txn,
        category: aiResult.category,
        aiCategorized: true,
        aiConfidence: aiResult.confidence
      };
    }

    // Heuristic fallback
    return {
      ...txn,
      category: heuristic.category !== 'Other' ? heuristic.category : (txn.category || 'Other'),
      aiCategorized: true,
      aiConfidence: heuristic.confidence
    };
  });
};

/**
 * Generates an AI spending analysis report
 */
const generateSpendingAnalysis = async (expenses, incomeTotal) => {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] || ['None', 0];

  const model = getModel();
  if (model) {
    try {
      const prompt = `
Analyze the user's spending data and produce a concise 3-paragraph executive financial analysis.
Total Income: ₹${incomeTotal}
Total Expenses: ₹${totalSpent}
Category Breakdown: ${JSON.stringify(categoryTotals)}
Highest Spending Category: ${topCategory[0]} (₹${topCategory[1]})

Include:
1. Executive Summary of financial health
2. Anomalies or high-spending areas
3. 2-3 specific, actionable recommendations to improve savings.
Do not output markdown code blocks. Keep it professional and encouraging.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn(`[Gemini AI] Spending analysis API error: ${err.message}`);
    }
  }

  // Resilient heuristic analysis
  return `Your total spending this period reached ₹${totalSpent.toLocaleString('en-IN')}.
Your highest expenditure category was ${topCategory[0]} at ₹${topCategory[1].toLocaleString('en-IN')} (${totalSpent > 0 ? ((topCategory[1] / totalSpent) * 100).toFixed(1) : 0}% of total spending).
Based on your spending patterns, reducing discretionary expenses in ${topCategory[0]} by 15-20% could increase your monthly savings buffer by approximately ₹${Math.round(topCategory[1] * 0.18).toLocaleString('en-IN')}.`;
};

/**
 * Generates Monthly Financial Summary
 */
const generateMonthlySummary = async (month, year, expenses, income) => {
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0';

  const model = getModel();
  if (model) {
    try {
      const prompt = `
Write a monthly financial summary for Month: ${month}, Year: ${year}.
Income: ₹${totalIncome}
Expenses: ₹${totalExpense}
Net Savings: ₹${netSavings} (Savings Rate: ${savingsRate}%)
Number of Transactions: ${expenses.length}

Format as a structured bulleted financial report with Key Metrics, Highlights, and Focus Areas.
      `;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn(`[Gemini AI] Monthly summary error: ${err.message}`);
    }
  }

  return `### Monthly Summary for ${month}/${year}
- **Total Income**: ₹${totalIncome.toLocaleString('en-IN')}
- **Total Outflow**: ₹${totalExpense.toLocaleString('en-IN')}
- **Net Saved**: ₹${netSavings.toLocaleString('en-IN')} (${savingsRate}% savings rate)
- **Status**: ${netSavings >= 0 ? 'Surplus maintained. Healthy cash flow.' : 'Deficit detected. Spending exceeded recorded income.'}`;
};

/**
 * Generates AI Budget Recommendations
 */
const generateBudgetRecommendations = async (monthlyIncome, expenses) => {
  const baseIncome = monthlyIncome || 40000;
  
  // 50/30/20 standard budgeting principle
  const recommendations = [
    { category: 'Food', recommendedAmount: Math.round(baseIncome * 0.15), reason: 'Standard nutrition and groceries allocation (15%)' },
    { category: 'Bills', recommendedAmount: Math.round(baseIncome * 0.12), reason: 'Utilities, connectivity, and subscriptions (12%)' },
    { category: 'Transport', recommendedAmount: Math.round(baseIncome * 0.08), reason: 'Daily commute and fuel reserve (8%)' },
    { category: 'Shopping', recommendedAmount: Math.round(baseIncome * 0.10), reason: 'Discretionary apparel and supplies (10%)' },
    { category: 'Hotel', recommendedAmount: Math.round(baseIncome * 0.05), reason: 'Occasional leisure & stays (5%)' },
    { category: 'Rent', recommendedAmount: Math.round(baseIncome * 0.25), reason: 'Housing cap (25%)' },
    { category: 'Savings Target', recommendedAmount: Math.round(baseIncome * 0.25), reason: 'Target emergency & wealth generation (25%)' }
  ];

  return {
    monthlyIncome: baseIncome,
    recommendedBudgets: recommendations,
    disclaimer: 'These suggestions are algorithmic baselines and should not be considered certified financial advice.'
  };
};

/**
 * Handles user AI chat queries scoped strictly to the authenticated user's records
 */
const handleChatAssistant = async (user, userExpenses, userIncome, userBudgets, query) => {
  const totalIncome = userIncome.reduce((s, i) => s + i.amount, 0);
  const totalExpense = userExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryTotals = {};
  userExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const model = getModel();
  if (model) {
    try {
      const prompt = `
You are the AI Smart Expense Assistant for user "${user.name}".
You have access ONLY to this user's verified financial records:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Current Net Balance: ₹${balance}
- Expense Categories: ${JSON.stringify(categoryTotals)}
- Active Budgets: ${JSON.stringify(userBudgets.map(b => ({ category: b.category, limit: b.amount })))}
- Recent Transactions Sample: ${JSON.stringify(userExpenses.slice(0, 10).map(e => ({ date: e.date, title: e.title, amount: e.amount, category: e.category })))}

CRITICAL SECURITY RULE: You must only answer questions regarding this user's data. Never reveal or assume data for any other user.
User Query: "${query}"

Provide a friendly, accurate, and concise answer with direct figures.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn(`[Gemini AI] Chat API error: ${err.message}`);
    }
  }

  // Heuristic query responders
  const q = query.toLowerCase();
  if (q.includes('spend') && q.includes('most')) {
    const top = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
    return `Based on your records, you spent the most on **${top[0]}**, totaling **₹${top[1].toLocaleString('en-IN')}**.`;
  }
  if (q.includes('food')) {
    const foodTotal = categoryTotals['Food'] || 0;
    return `You have spent **₹${foodTotal.toLocaleString('en-IN')}** on Food & Dining so far.`;
  }
  if (q.includes('balance') || q.includes('how much is left') || q.includes('save')) {
    return `Your current net balance is **₹${balance.toLocaleString('en-IN')}** (Total Income: ₹${totalIncome.toLocaleString('en-IN')}, Total Expenses: ₹${totalExpense.toLocaleString('en-IN')}).`;
  }

  return `Based on your financial data, your total recorded expenses are ₹${totalExpense.toLocaleString('en-IN')} across ${userExpenses.length} transactions, leaving a net savings balance of ₹${balance.toLocaleString('en-IN')}. How else can I assist with your budgets?`;
};

module.exports = {
  PREDEFINED_CATEGORIES,
  categorizeBatch,
  generateSpendingAnalysis,
  generateMonthlySummary,
  generateBudgetRecommendations,
  handleChatAssistant,
  classifyByHeuristics
};
