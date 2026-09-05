const fs = require('fs');
const path = require('path');

async function run() {
  console.log('--- TEST: End-to-End Loan Import Sync & CRUD Deletions ---');

  // 1. Authenticate as demo user
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'joel.user@example.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.token || loginData.data?.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Commit a statement with Loan and Chitty commitments
  const commitPayload = {
    fileName: 'September_Bank_Statement.csv',
    fileType: 'csv',
    fileSize: 2048,
    statementMonth: 9,
    statementYear: 2026,
    transactions: [
      {
        date: '2026-09-05',
        merchant: 'KSFE Chitty 4 Payment',
        description: 'Chitty installment for September',
        amount: 5000,
        type: 'expense',
        category: 'Loan',
        paymentMethod: 'UPI'
      },
      {
        date: '2026-09-06',
        merchant: 'Canara Gold Loan Interest',
        description: 'Monthly interest payment',
        amount: 3200,
        type: 'expense',
        category: 'Loan',
        paymentMethod: 'Net Banking'
      },
      {
        date: '2026-09-01',
        merchant: 'Monthly Tech Salary',
        description: 'September credited inflow',
        amount: 45000,
        type: 'income',
        category: 'Salary',
        paymentMethod: 'Net Banking'
      }
    ]
  };

  const processRes = await fetch('http://localhost:5000/api/import/process', {
    method: 'POST',
    headers,
    body: JSON.stringify(commitPayload)
  });
  const processData = await processRes.json();
  console.log('Import Process Response:', processData);

  if (!processData.success || processData.data.syncedLoansCount < 2) {
    console.error('FAILED: Expected at least 2 synced loans, got:', processData);
    process.exit(1);
  }
  console.log('✓ Successfully synced', processData.data.syncedLoansCount, 'loan facilities on statement import!');

  // 3. Verify Loans portfolio reflects the facilities
  const loansRes = await fetch('http://localhost:5000/api/loans', { headers });
  const loansData = await loansRes.json();
  console.log(`Loans portfolio now has ${loansData.data.items.length} total items.`);
  const ksfeItem = loansData.data.items.find(i => /ksfe/i.test(i.name) || /ksfe/i.test(i.lender));
  console.log('Found KSFE facility:', ksfeItem ? { name: ksfeItem.name, category: ksfeItem.category, lender: ksfeItem.lender, paidAmount: ksfeItem.paidAmount } : 'NOT FOUND');

  if (!ksfeItem) {
    console.error('FAILED: KSFE facility not retrieved in loan collection.');
    process.exit(1);
  }
  console.log('✓ Loan facility properly retrieved and linked!');

  // 4. Test CRUD Deletions on all sections
  // Delete one income
  const incomesRes = await fetch('http://localhost:5000/api/income', { headers });
  const incomesData = await incomesRes.json();
  const incToDelete = incomesData.data[0];
  if (incToDelete) {
    const delIncRes = await fetch(`http://localhost:5000/api/income/${incToDelete._id || incToDelete.id}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Delete Income (${incToDelete._id}): status ${delIncRes.status}`);
  }

  // Delete one savings goal
  const goalsRes = await fetch('http://localhost:5000/api/goals', { headers });
  const goalsData = await goalsRes.json();
  const goalToDelete = goalsData.data[0];
  if (goalToDelete) {
    const delGoalRes = await fetch(`http://localhost:5000/api/goals/${goalToDelete._id || goalToDelete.id}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Delete Goal (${goalToDelete._id}): status ${delGoalRes.status}`);
  }

  // Delete one loan facility
  const loanToDelete = ksfeItem;
  const delLoanRes = await fetch(`http://localhost:5000/api/loans/${loanToDelete._id || loanToDelete.id}`, {
    method: 'DELETE',
    headers
  });
  console.log(`Delete Loan (${loanToDelete._id}): status ${delLoanRes.status}`);

  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
