const { parseFinancialFile } = require('../services/fileParserService');

const sampleCsvWithMetadata = [
  'HDFC BANK LIMITED - ACCOUNT STATEMENT',
  'Customer Name: Joel User',
  'Account Number: 50100456789012',
  'Branch: Indiranagar Bangalore | IFSC: HDFC0001234',
  'Statement Period: 01-Sep-2026 to 04-Sep-2026',
  'Opening Balance: 45000.00',
  '',
  'Date,Narration,Withdrawal Amt,Deposit Amt,Closing Balance',
  '01/09/2026,UPI/Swiggy/456789/Bangalore,450.00,,44550.00',
  '02/09/2026,ATM WDM CASH WITHDRAWAL SBI INDIRANAGAR,2000.00,,42550.00',
  '03/09/2026,POS 4321 DEBIT CARD SHOPPERS STOP,1500.00,,41050.00',
  '04/09/2026,NEFT TECHCORP SOLUTIONS SALARY,,50000.00,91050.00',
  '',
  'Total Withdrawals: 3950.00 | Total Deposits: 50000.00 | Closing Balance: 91050.00',
  'Page 1 of 1 | This is a computer generated statement and does not require signature'
].join('\n');

(async () => {
  const result = await parseFinancialFile({
    originalname: 'hdfc_statement_with_metadata.csv',
    buffer: Buffer.from(sampleCsvWithMetadata, 'utf8')
  });

  console.log('Extracted transaction count:', result.transactions.length);
  result.transactions.forEach((tx, i) => {
    console.log(`[${i+1}] ${tx.description} | Mode: ${tx.paymentMethod} | Amount: ₹${tx.amount} | Type: ${tx.type} | Merchant: ${tx.merchant}`);
  });

  const passed = result.transactions.length === 4
    && result.transactions[0].paymentMethod === 'UPI'
    && result.transactions[1].paymentMethod === 'ATM'
    && result.transactions[2].paymentMethod === 'Debit Card'
    && result.transactions[3].paymentMethod === 'Net Banking';

  console.log('\nVerification Test Result:', passed ? 'SUCCESS (All 4 extracted, noise skipped)' : 'FAILED');
  process.exit(passed ? 0 : 1);
})();
