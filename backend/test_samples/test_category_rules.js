const { parseFinancialFile } = require('../services/fileParserService');

async function testCategoryRules() {
  const csvContent = `Date,Description,Amount,Payment Method
2026-09-01,UPI/Pothys Silks and Sarees/Shopping,3500.00,UPI
2026-09-02,Sweet Delights Bakery Cake Order,650.00,Debit Card
2026-09-03,Grand Hyatt Hotel Mumbai Stay,9200.00,Credit Card
2026-09-04,Lulu Hypermarket Kochi Groceries,4250.00,UPI
2026-09-05,Palika Bazar Delhi Apparel,1800.00,Cash
2026-09-06,KSFE Chitty Monthly Subscription,5000.00,Net Banking
2026-09-07,SBI Personal Loan EMI Debit,12400.00,Net Banking
2026-09-08,Muthoot Gold Loan Interest Payment,1500.00,UPI
2026-09-09,Quarterly Bank Interest Paid to HDFC,850.00,Debit
2026-09-10,Apollo Pharmacy Prescription Meds,1250.00,UPI
2026-09-11,MedPlus Life Care Medicine Purchase,890.00,Debit Card
`;

  const file = {
    originalname: 'test_categories.csv',
    buffer: Buffer.from(csvContent, 'utf8')
  };

  const result = await parseFinancialFile(file);
  console.log(`Parsed ${result.transactions.length} transactions:`);

  const expected = [
    { word: 'silks', expectedCategory: 'Shopping' },
    { word: 'bakery', expectedCategory: 'Food' },
    { word: 'hotel', expectedCategory: 'Hotel' },
    { word: 'hypermarket', expectedCategory: 'Shopping' },
    { word: 'bazar', expectedCategory: 'Shopping' },
    { word: 'chitty', expectedCategory: 'Loan' },
    { word: 'loan', expectedCategory: 'Loan' },
    { word: 'gold loan', expectedCategory: 'Loan' },
    { word: 'interest', expectedCategory: 'Loan' },
    { word: 'pharmacy', expectedCategory: 'Healthcare' },
    { word: 'medicine', expectedCategory: 'Healthcare' }
  ];

  let allPass = true;
  result.transactions.forEach((tx, idx) => {
    const exp = expected[idx];
    const match = tx.category === exp.expectedCategory;
    console.log(`[${match ? 'PASS' : 'FAIL'}] "${tx.description}" -> Category: "${tx.category}" (Expected: "${exp.expectedCategory}", Payment: "${tx.paymentMethod}")`);
    if (!match) allPass = false;
  });

  if (allPass) {
    console.log('\n>>> ALL 9 DOMAIN CATEGORIZATION RULES PASSED PERFECTLY! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SOME CATEGORIZATION RULES FAILED! <<<');
    process.exit(1);
  }
}

testCategoryRules().catch(err => {
  console.error(err);
  process.exit(1);
});
