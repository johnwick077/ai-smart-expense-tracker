const fs = require('fs');
const path = require('path');
const { parseFinancialFile } = require('../services/fileParserService');

(async () => {
  console.log('--- 1. Testing Sample Statement CSV ---');
  const csvBuf = fs.readFileSync(path.join(__dirname, 'sample_statement.csv'));
  const csvRes = await parseFinancialFile({ originalname: 'statement.csv', buffer: csvBuf });
  console.log('CSV Transactions extracted:', csvRes.transactions.length);

  console.log('--- 2. Testing Sample Expenses Excel (.xlsx) ---');
  const xlsxBuf = fs.readFileSync(path.join(__dirname, 'sample_expenses.xlsx'));
  const xlsxRes = await parseFinancialFile({ originalname: 'sample_expenses.xlsx', buffer: xlsxBuf });
  console.log('Excel Transactions extracted:', xlsxRes.transactions.length);

  console.log('--- 3. Testing Sample Statement TXT ---');
  const txtBuf = fs.readFileSync(path.join(__dirname, 'sample_statement.txt'));
  const txtRes = await parseFinancialFile({ originalname: 'sample_statement.txt', buffer: txtBuf });
  console.log('TXT Transactions extracted:', txtRes.transactions.length);

  console.log('--- 4. Testing Sample Statement JSON ---');
  const jsonBuf = fs.readFileSync(path.join(__dirname, 'sample_statement.json'));
  const jsonRes = await parseFinancialFile({ originalname: 'sample_statement.json', buffer: jsonBuf });
  console.log('JSON Transactions extracted:', jsonRes.transactions.length);

  console.log('\n--- 5. Testing Edge Case: Non-standard CSV (2-digit years, Rs. currency, custom columns) ---');
  const customCsv = [
    'STATEMENT HEADER - MY BANK',
    'Customer: John Doe',
    'Account Number: 1234567890',
    'Opening Balance: 50,000.00',
    '',
    'Date of Transaction,Item Description,Charge',
    '04/09/26,Swiggy Bangalore Order,Rs. 450.00',
    '03/09/26,ATM WDM Koramangala,(2000.00)',
    '02/09/26,Reliance Fresh POS,INR 1,250.00',
    '01/09/26,Monthly Salary Inflow,40000.00',
    '',
    'Total Withdrawals: 3700.00',
    'End of statement'
  ].join('\n');
  const customRes = await parseFinancialFile({ originalname: 'custom.csv', buffer: Buffer.from(customCsv, 'utf8') });
  console.log('Custom CSV extracted:', customRes.transactions.length);
  customRes.transactions.forEach((t, idx) => {
    console.log(`  [${idx+1}] Date: ${t.date.toISOString().slice(0,10)} | Title: ${t.description} | Amount: ₹${t.amount} | Mode: ${t.paymentMethod} | Type: ${t.type}`);
  });

  const allPassed = csvRes.transactions.length > 0
    && xlsxRes.transactions.length > 0
    && txtRes.transactions.length > 0
    && jsonRes.transactions.length > 0
    && customRes.transactions.length === 4;

  console.log('\nALL FORMAT TESTS RESULT:', allPassed ? 'PASSED 100%' : 'FAILED');
  process.exit(allPassed ? 0 : 1);
})();
