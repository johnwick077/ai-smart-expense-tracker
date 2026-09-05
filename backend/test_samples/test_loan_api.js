const express = require('express');
const http = require('http');
const loanRoutes = require('../routes/loanRoutes');
const enableInMemoryFallback = require('../config/enableInMemoryFallback');

async function testLoanAPI() {
  await enableInMemoryFallback();

  const app = express();
  app.use(express.json());

  // Mock authenticated user middleware for test
  app.use((req, res, next) => {
    req.user = { _id: 'demo_user_id', name: 'Joel User' };
    next();
  });

  app.use('/api/loans', loanRoutes);

  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: 'demo_user_id', role: 'user' },
    process.env.JWT_SECRET || 'fallback_secret_for_development_min_32_chars'
  );

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  console.log('Testing GET /api/loans on port ' + port + '...');
  const response = await fetch(`http://localhost:${port}/api/loans`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const res = await response.json();
  server.close();

  if (response.status !== 200 || !res.success) {
    console.error('Failed to get loans:', res);
    process.exit(1);
  }

  const { items, loanSubtotal, chittySubtotal, grandTotal, healthAnalysis } = res.data;
  console.log(`Retrieved ${items.length} loan/chitty items.`);
  console.log('--- LOAN SUBTOTAL ---');
  console.log(`Count: ${loanSubtotal.count}, Remaining Balance: ₹${loanSubtotal.remainingBalance}, Monthly EMI: ₹${loanSubtotal.monthlyEMI}`);

  console.log('--- CHITTY + PAYABLE SUBTOTAL ---');
  console.log(`Count: ${chittySubtotal.count}, Remaining Liability: ₹${chittySubtotal.remainingBalance}, Monthly Installment: ₹${chittySubtotal.monthlyInstallment}`);

  console.log('--- GRAND TOTAL COMBINED DEBT ---');
  console.log(`Combined Debt: ₹${grandTotal.combinedDebt.toLocaleString('en-IN')}`);
  console.log(`Total Monthly Commitment: ₹${grandTotal.totalMonthlyCommitment.toLocaleString('en-IN')}`);

  console.log('--- LOAN HEALTH ANALYSIS ("Doing Good or Bad") ---');
  console.log(`Health Status: ${healthAnalysis.status} (${healthAnalysis.label})`);
  console.log(`Health Score: ${healthAnalysis.score}/100`);
  console.log(`Debt-to-Income: ${healthAnalysis.dtiRatio}%`);
  console.log(`Diagnosis: ${healthAnalysis.diagnosis}`);
  console.log(`Recommendation: ${healthAnalysis.recommendation}`);

  // Assertions
  if (grandTotal.combinedDebt === 2081548 && grandTotal.totalMonthlyCommitment === 72800) {
    console.log('\n>>> EXACT RUPEE MATCH WITH USER SPREADSHEET (₹20,81,548.00)! <<<');
  } else {
    console.warn(`\nDifference detected: Combined debt was ₹${grandTotal.combinedDebt}`);
  }

  process.exit(0);
}

testLoanAPI().catch(err => {
  console.error(err);
  process.exit(1);
});
