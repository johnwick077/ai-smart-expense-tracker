async function testLiveDeletes() {
  // 1. Log in
  const authRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'joel.user@example.com', password: 'Password123!' })
  }).then(r => r.json());

  if (!authRes.token) {
    console.error('Login failed:', authRes);
    process.exit(1);
  }
  const token = authRes.token;
  const headers = { Authorization: `Bearer ${token}` };

  console.log('--- TEST 1: Income Delete ---');
  const incRes = await fetch('http://localhost:5000/api/income', { headers }).then(r => r.json());
  console.log('Current Incomes:', incRes.data?.map(i => ({ id: i._id, source: i.source })));
  if (incRes.data && incRes.data.length > 0) {
    const incId = incRes.data[0]._id;
    const delInc = await fetch(`http://localhost:5000/api/income/${incId}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Delete income ${incId} status:`, delInc.status, await delInc.json());
  }

  console.log('\n--- TEST 2: Savings Goal Delete ---');
  const goalRes = await fetch('http://localhost:5000/api/goals', { headers }).then(r => r.json());
  console.log('Current Goals:', goalRes.data?.map(g => ({ id: g._id, title: g.title })));
  if (goalRes.data && goalRes.data.length > 0) {
    const goalId = goalRes.data[0]._id;
    const delGoal = await fetch(`http://localhost:5000/api/goals/${goalId}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Delete goal ${goalId} status:`, delGoal.status, await delGoal.json());
  }

  console.log('\n--- TEST 3: Budget Delete ---');
  const bgtRes = await fetch('http://localhost:5000/api/budgets', { headers }).then(r => r.json());
  console.log('Current Budgets:', bgtRes.data?.map(b => ({ id: b._id, category: b.category })));
  if (bgtRes.data && bgtRes.data.length > 0) {
    const bgtId = bgtRes.data[0]._id;
    const delBgt = await fetch(`http://localhost:5000/api/budgets/${bgtId}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Delete budget ${bgtId} status:`, delBgt.status, await delBgt.json());
  }

  console.log('\n--- TEST 4: Loan Delete ---');
  const loanRes = await fetch('http://localhost:5000/api/loans', { headers }).then(r => r.json());
  console.log('Current Loans count:', loanRes.data?.items?.length);
  if (loanRes.data?.items?.length > 0) {
    const loanId = loanRes.data.items[0]._id;
    const delLoan = await fetch(`http://localhost:5000/api/loans/${loanId}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Delete loan ${loanId} status:`, delLoan.status, await delLoan.json());
  }
}

testLiveDeletes().catch(console.error);
