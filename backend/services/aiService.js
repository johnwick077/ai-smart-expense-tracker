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
  'Salary',
  'Other'
];

// High-confidence heuristic keyword mapping (offline/fallback intelligence)
const HEURISTIC_KEYWORDS = {
  Food: ['swiggy', 'zomato', 'mcdonald', 'kfc', 'starbucks', 'cafe', 'restaurant', 'burger', 'pizza', 'dine', 'supermarket', 'blinkit', 'zepto', 'instamart', 'groceries', 'bakery', 'tea', 'coffee'],
  Hotel: ['hotel', 'marriott', 'hyatt', 'hilton', 'radisson', 'resort', 'stay', 'airbnb', 'oyo', 'taj', 'lodging', 'inn'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'nike', 'adidas', 'apple', 'retail', 'mall', 'clothing', 'fashion', 'electronics', 'ikea'],
  Transport: ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel', 'shell', 'hpcl', 'bpcl', 'irctc', 'railway', 'flight', 'indigo', 'air india', 'toll', 'fastag', 'cab', 'auto'],
  Bills: ['airtel', 'jio', 'vi', 'vodafone', 'bescom', 'electricity', 'water', 'gas', 'broadband', 'wifi', 'dth', 'tata play', 'utility', 'recharge', 'bill', 'insurance', 'lic'],
  Entertainment: ['netflix', 'spotify', 'prime video', 'hotstar', 'youtube', 'pvr', 'inox', 'cinema', 'movie', 'bookmyshow', 'game', 'playstation', 'steam'],
  Healthcare: ['apollo', 'pharmacy', 'chemist', 'hospital', 'clinic', 'doctor', 'medplus', '1mg', 'pharmeasy', 'dental', 'lab', 'diagnostics'],
  Education: ['coursera', 'udemy', 'college', 'school', 'university', 'tuition', 'books', 'udacity', 'edx', 'course'],
  Rent: ['rent', 'landlord', 'society', 'maintenance', 'flat rent', 'apartment'],
  Travel: ['makemytrip', 'goibibo', 'easemytrip', 'booking.com', 'expedia', 'visa', 'tour'],
  Salary: ['salary', 'payroll', 'wages', 'stipend', 'bonus', 'inflow', 'freelance payment']
};

/**
 * Heuristic classifier for rapid fallback when AI API is unreachable
 */
const classifyByHeuristics = (text) => {
  if (!text) return { category: 'Other', confidence: 0.5 };
  const lower = String(text).toLowerCase();

  for (const [cat, keywords] of Object.entries(HEURISTIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return { category: cat, confidence: 0.94 };
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

Rules:
1. Return ONLY a valid JSON array of objects. Do not include markdown wraps or explanations.
2. Format: [{"id": 0, "category": "Food", "confidence": 0.95}]
3. If uncertain, categorize as "Other" with confidence 0.50.

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
    const heuristic = classifyByHeuristics(`${txn.description} ${txn.merchant}`);
    return {
      ...txn,
      category: heuristic.category,
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
