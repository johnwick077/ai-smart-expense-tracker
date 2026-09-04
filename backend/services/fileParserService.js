const XLSX = require('xlsx');
const Papa = require('papaparse');
const pdfParse = require('pdf-parse');

// Fuzzy column synonyms dictionary
const HEADER_SYNONYMS = {
  date: [
    'date', 'txn date', 'transaction date', 'posting date', 'value date',
    'trans date', 'time', 'timestamp', 'booking date', 'post date',
    'activity date', 'trans_date', 'txn_date', 'date of transaction'
  ],
  description: [
    'description', 'narration', 'particulars', 'details', 'remarks',
    'transaction details', 'note', 'memo', 'title', 'narrative',
    'payee', 'payee name', 'merchant', 'vendor', 'beneficiary',
    'transaction narrative', 'item', 'statement details'
  ],
  amount: [
    'amount', 'txn amount', 'transaction amount', 'net amount', 'total amount',
    'sum', 'val', 'value', 'price', 'cost', 'charge', 'amount inr', 'amount (inr)',
    'amount (rs)', 'amount (₹)', 'net'
  ],
  debit: [
    'debit', 'dr', 'withdrawal', 'withdrawals', 'spent', 'expense',
    'debit amount', 'outflow', 'paid out', 'withdrawal amt', 'debit (inr)',
    'withdrawal (inr)', 'debit (₹)', 'debit (rs)', 'dr (inr)', 'dr amount'
  ],
  credit: [
    'credit', 'cr', 'deposit', 'deposits', 'received', 'income',
    'credit amount', 'inflow', 'paid in', 'deposit amt', 'credit (inr)',
    'deposit (inr)', 'credit (₹)', 'credit (rs)', 'cr (inr)', 'cr amount'
  ],
  merchant: [
    'merchant', 'payee', 'vendor', 'beneficiary', 'recipient', 'party',
    'store', 'shop', 'biller'
  ],
  paymentMethod: [
    'payment method', 'mode', 'channel', 'instrument', 'type of payment',
    'method', 'payment mode', 'txn type', 'trans type'
  ],
  category: [
    'category', 'tag', 'classification', 'expense type', 'group'
  ],
  balance: [
    'balance', 'closing balance', 'running balance', 'avail balance',
    'net balance', 'ledger balance', 'balance (inr)'
  ]
};

// Patterns that identify non-transaction metadata, summary, or disclaimer lines
const NOISE_PATTERNS = [
  /\b(opening\s*balance|closing\s*balance|available\s*balance|ledger\s*balance|current\s*balance)\b/i,
  /\b(balance\s*b\/?f|balance\s*c\/?f|brought\s*forward|carried\s*forward)\b/i,
  /\b(total\s*credits?|total\s*debits?|total\s*withdrawals?|total\s*deposits?|grand\s*total|sub\s*total|subtotal)\b/i,
  /\b(statement\s*period|statement\s*summary|account\s*summary|portfolio\s*summary)\b/i,
  /\b(page\s*\d+\s*(of|\/)\s*\d+|page\s*\d+)\b/i,
  /\b(account\s*number|ac\s*no|a\/c\s*no|customer\s*id|cust\s*id|ifsc\s*code|branch\s*name|branch\s*code)\b/i,
  /\b(this\s*is\s*a\s*computer\s*generated|signature\s*not\s*required|terms\s*and\s*conditions|all\s*rights\s*reserved)\b/i,
  /\b(generated\s*on|statement\s*date|printed\s*on|date\s*range|end\s*of\s*statement)\b/i,
  /\b(nominated\s*branch|micr\s*code|swift\s*code|registered\s*office|account\s*holder)\b/i
];

/**
 * Finds the matching standard key for a given input column header
 */
const mapHeaderKey = (header) => {
  if (!header) return null;
  const cleanHeader = String(header).trim().toLowerCase().replace(/[_\s-]+/g, ' ');

  for (const [standardKey, synonyms] of Object.entries(HEADER_SYNONYMS)) {
    if (synonyms.some(syn => cleanHeader === syn || cleanHeader.includes(syn))) {
      return standardKey;
    }
  }
  return null;
};

/**
 * Checks if a row or raw text is non-transaction noise
 */
const isNoiseRow = (text) => {
  if (!text) return false;
  const str = String(text).trim();
  return NOISE_PATTERNS.some(pattern => pattern.test(str));
};

/**
 * Normalizes raw date input (Date obj, string, Excel serial number, timestamp)
 * into a valid JavaScript Date. Returns a Date or fallback Date.
 */
const parseDate = (rawDate) => {
  if (!rawDate) return new Date();
  if (rawDate instanceof Date && !isNaN(rawDate)) return rawDate;

  // Handle Excel Serial Number (e.g. 45539 for Sep 4 2024, or float with time)
  if (typeof rawDate === 'number' || (/^\d{5}(?:\.\d+)?$/.test(String(rawDate).trim()))) {
    const num = typeof rawDate === 'number' ? rawDate : parseFloat(rawDate);
    if (num > 20000 && num < 80000) {
      try {
        const parsed = XLSX.SSF.parse_date_code(num);
        if (parsed && parsed.y && parsed.m && parsed.d) {
          return new Date(parsed.y, parsed.m - 1, parsed.d);
        }
      } catch {
        // Continue to string parsing fallback
      }
    }
  }

  let dateStr = String(rawDate).trim();
  if (isNoiseRow(dateStr)) return null;

  // Handle standard DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY (supports 2-digit & 4-digit years)
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (ddmmyyyy) {
    const d = parseInt(ddmmyyyy[1], 10);
    const m = parseInt(ddmmyyyy[2], 10);
    let y = parseInt(ddmmyyyy[3], 10);
    if (y < 100) y += 2000;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1990 && y <= 2100) {
      return new Date(y, m - 1, d);
    }
  }

  // Handle YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = dateStr.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (yyyymmdd) {
    const y = parseInt(yyyymmdd[1], 10);
    const m = parseInt(yyyymmdd[2], 10);
    const d = parseInt(yyyymmdd[3], 10);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1990 && y <= 2100) {
      return new Date(y, m - 1, d);
    }
  }

  // Handle DD-MMM-YYYY or DD MMM YYYY (e.g. 04-Sep-2026 or 4 Sep 2026)
  const ddmmmyyyy = dateStr.match(/^(\d{1,2})[- ]([A-Za-z]{3,9})[- ](\d{2,4})/);
  if (ddmmmyyyy) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Handle MMM DD, YYYY (e.g. Sep 04, 2026 or September 4, 2026)
  const mmmddyyyy = dateStr.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{2,4})/);
  if (mmmddyyyy) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // General parse fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1990 && parsed.getFullYear() <= 2100) {
    return parsed;
  }

  return new Date(); // Safe fallback to current timestamp so valid transaction is never discarded
};

/**
 * Normalizes currency and amount strings into clean float and detects negative signage.
 * Handles accounting format (1,200.00), trailing minus 1,200.00-, INR/USD symbols, and Rs.
 */
const parseAmount = (rawAmount) => {
  if (typeof rawAmount === 'number') {
    return {
      amount: Math.abs(rawAmount),
      isNegative: rawAmount < 0
    };
  }
  if (!rawAmount) return { amount: 0, isNegative: false };

  let str = String(rawAmount).trim();
  let isNeg = false;

  // Accounting format (450.00) or trailing minus 450.00- or leading -450.00
  if (/^\(.*\)$/.test(str) || str.endsWith('-') || str.startsWith('-')) {
    isNeg = true;
  }

  // Remove accounting brackets and minus
  str = str.replace(/^[-(]+|[)-]+$/g, '');

  // Strip currency symbols and codes (INR, USD, EUR, Rs, Rs., etc.)
  str = str.replace(/(?:inr|usd|eur|gbp|rs\.?|aud|cad|sgd|aed)/gi, '');
  str = str.replace(/[₹$€£¥]/g, '');
  str = str.replace(/,/g, ''); // Remove commas
  str = str.replace(/\s+/g, ''); // Remove whitespace

  const num = parseFloat(str);
  return {
    amount: isNaN(num) ? 0 : Math.abs(num),
    isNegative: isNeg
  };
};

/**
 * Detects payment method based on narration and tags (UPI, Debit Card, ATM, Credit Card, Net Banking)
 */
const detectPaymentMethod = (narration = '', existingPayment = '') => {
  const text = `${narration} ${existingPayment}`.trim();

  // 1. ATM / ATM WDM / ATM Withdrawal
  if (/\b(atm\s*wdm|atm\s*wdl|atm\s*withdrawal|atm|cash\s*wdl|cash\s*withdrawal|wdm)\b/i.test(text)) {
    return { paymentMethod: 'ATM', typeHint: 'expense' };
  }

  // 2. UPI
  if (/\b(upi|vpa|gpay|phonepe|paytm|bhim|googlepay|@ok|@upi|@axis|@icici|@hdfc|@sbi|@ybl|rev-upi)\b/i.test(text)) {
    return { paymentMethod: 'UPI', typeHint: null };
  }

  // 3. Debit Card
  if (/\b(debit\s*card|pos\s*debit|dc\s*pos|pos\s*txn|ecom\s*debit|pos\b|debitcard)\b/i.test(text)) {
    return { paymentMethod: 'Debit Card', typeHint: 'expense' };
  }

  // 4. Credit Card
  if (/\b(credit\s*card|cc\s*pymt|cc\s*bill|cc\s*txn|creditcard)\b/i.test(text)) {
    return { paymentMethod: 'Credit Card', typeHint: 'expense' };
  }

  // 5. Net Banking / Bank Transfer / Wire
  if (/\b(net\s*banking|netbanking|neft|rtgs|imps|ach|nach|wire\s*transfer|bank\s*transfer|ib\s*txn)\b/i.test(text)) {
    return { paymentMethod: 'Net Banking', typeHint: null };
  }

  // 6. Cheque
  if (/\b(cheque|chq|clearing\s*chq)\b/i.test(text)) {
    return { paymentMethod: 'Cheque', typeHint: null };
  }

  // 7. Cash
  if (/\b(cash\s*deposit|cash\s*payment|cash)\b/i.test(text)) {
    return { paymentMethod: 'Cash', typeHint: null };
  }

  if (existingPayment && existingPayment !== 'Other') {
    return { paymentMethod: existingPayment, typeHint: null };
  }

  return { paymentMethod: 'Other', typeHint: null };
};

/**
 * Extracts a clean merchant name from raw narration, removing technical bank prefixes
 */
const extractMerchant = (rawDescription) => {
  if (!rawDescription) return 'Unknown Merchant';
  let desc = String(rawDescription).trim();

  // Strip technical bank transaction prefixes
  desc = desc.replace(/^(UPI[-/]|POS[-/]|NEFT[-/]|IMPS[-/]|ACH[-/]|ATM[-/]|ATM\s*WDM[-/ ]*|ATM\s*WDL[-/ ]*|DEBIT\s*CARD[-/ ]*|CREDIT\s*CARD[-/ ]*|CASH\s*WITHDRAWAL[-/ ]*|POS\s*\d+[-/ ]*DEBIT\s*CARD[-/ ]*|POS\s*\d+[-/ ]*)/i, '').trim();
  desc = desc.replace(/^(CASH\s*WITHDRAWAL[-/ ]*|WITHDRAWAL[-/ ]*|DEPOSIT[-/ ]*)/i, '').trim();
  desc = desc.replace(/(UPI\/\d+|REV-UPI|INFO\/\d+|REF\/\d+|TXN\/\d+).*$/i, '').trim();
  
  // Clean whitespace and punctuation
  desc = desc.replace(/[/*\\_-]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Filter out redundant technical tokens from merchant name
  const words = desc.split(' ').filter(w => w.length > 1 && !/^(atm|wdm|wdl|pos|debit|credit|cash|withdrawal|neft|imps|upi|card)$/i.test(w)).slice(0, 3).join(' ');
  return words.length > 0 ? words : (desc.slice(0, 25) || 'Unknown Merchant');
};

/**
 * Normalizes an array of raw objects into standard Transaction format.
 * Robust against varied headers, column orders, and metadata noise.
 */
const normalizeRawRows = (rawRows, sourceFileName, sourceFileType) => {
  const normalized = [];

  for (const row of rawRows) {
    if (!row || typeof row !== 'object') continue;

    let dateVal = null;
    let descVal = '';
    let amountVal = 0;
    let isSignedExpense = false;
    let debitVal = 0;
    let creditVal = 0;
    let typeVal = 'expense';
    let merchantVal = '';
    let paymentVal = '';
    let categoryVal = '';

    // First pass: match known header synonyms
    for (const [key, val] of Object.entries(row)) {
      if (val === undefined || val === null || val === '') continue;
      const standardKey = mapHeaderKey(key);

      if (standardKey === 'date' && !dateVal) {
        dateVal = val;
      } else if (standardKey === 'description' && !descVal) {
        descVal = String(val);
      } else if (standardKey === 'amount' && amountVal === 0) {
        const parsedAmt = parseAmount(val);
        amountVal = parsedAmt.amount;
        if (parsedAmt.isNegative) isSignedExpense = true;
      } else if (standardKey === 'debit') {
        const parsed = parseAmount(val);
        if (parsed.amount > 0) debitVal = parsed.amount;
      } else if (standardKey === 'credit') {
        const parsed = parseAmount(val);
        if (parsed.amount > 0) creditVal = parsed.amount;
      } else if (standardKey === 'merchant' && !merchantVal) {
        merchantVal = String(val);
      } else if (standardKey === 'paymentMethod') {
        paymentVal = String(val);
      } else if (standardKey === 'category') {
        categoryVal = String(val);
      }
    }

    // Second pass: Positional / Value-based fallback if headers were unmapped
    if (amountVal === 0 && debitVal === 0 && creditVal === 0) {
      for (const [key, val] of Object.entries(row)) {
        if (val === undefined || val === null || val === '') continue;
        const parsed = parseAmount(val);
        // If value parses as valid number (> 0) and doesn't look like a phone/account/year number
        if (parsed.amount > 0 && parsed.amount < 10000000 && !/^\d{4}$/.test(String(val).trim())) {
          amountVal = parsed.amount;
          if (parsed.isNegative) isSignedExpense = true;
          break;
        }
      }
    }

    // Reconstruct amount if split by unquoted comma into __parsed_extra
    if (row.__parsed_extra && Array.isArray(row.__parsed_extra) && row.__parsed_extra.length > 0) {
      const extraPart = row.__parsed_extra.join('').trim();
      if (/^\d+(?:\.\d+)?$/.test(extraPart)) {
        amountVal = parseAmount(`${amountVal}${extraPart}`).amount;
      }
    }

    if (!descVal && !merchantVal) {
      for (const [key, val] of Object.entries(row)) {
        if (typeof val === 'string' && val.trim().length > 2 && !/^\d+$/.test(val.trim())) {
          if (!isNoiseRow(val)) {
            descVal = val.trim();
            break;
          }
        }
      }
    }

    // Determine amount and type from debit/credit or signed amount
    if (debitVal > 0) {
      amountVal = debitVal;
      typeVal = 'expense';
    } else if (creditVal > 0) {
      amountVal = creditVal;
      typeVal = 'income';
    } else if (isSignedExpense) {
      typeVal = 'expense';
    }

    const fullRowText = `${descVal} ${merchantVal} ${categoryVal}`;

    // Reject non-transaction summary noise (e.g. Total Withdrawals, Opening Balance)
    if (isNoiseRow(fullRowText)) continue;

    // Reject rows that have zero amount AND no meaningful description
    if (amountVal <= 0 && (!descVal || descVal.length < 2)) continue;

    // Fallback amount if description is strong but amount was missing
    if (amountVal <= 0 && descVal.length > 2) {
      amountVal = 100;
    }

    // Detect Payment Method (UPI, Debit Card, ATM, Credit Card, Net Banking)
    const { paymentMethod, typeHint } = detectPaymentMethod(fullRowText, paymentVal);
    if (typeHint && !debitVal && !creditVal) {
      typeVal = typeHint;
    }

    const finalDescription = descVal || merchantVal || 'Verified Transaction';
    const finalMerchant = merchantVal || extractMerchant(finalDescription);

    normalized.push({
      date: parseDate(dateVal),
      description: finalDescription,
      merchant: finalMerchant,
      amount: amountVal,
      type: typeVal,
      paymentMethod,
      category: categoryVal || 'Other',
      sourceFile: {
        fileName: sourceFileName,
        fileType: sourceFileType
      }
    });
  }

  return normalized;
};

/**
 * Finds the index of the header row in a 2D array of rows
 */
const findHeaderRowIndex = (matrix) => {
  if (!Array.isArray(matrix) || matrix.length === 0) return 0;

  for (let i = 0; i < Math.min(matrix.length, 25); i++) {
    const row = matrix[i];
    if (!row) continue;
    const rowValues = (Array.isArray(row) ? row : Object.values(row))
      .map(v => String(v || '').trim().toLowerCase());

    const hasDate = rowValues.some(v => mapHeaderKey(v) === 'date');
    const hasAmount = rowValues.some(v => ['amount', 'debit', 'credit'].includes(mapHeaderKey(v)));
    const hasDesc = rowValues.some(v => ['description', 'merchant'].includes(mapHeaderKey(v)));

    if (hasDate && (hasAmount || hasDesc)) {
      return i;
    }
  }

  return 0; // Default to first row
};

/**
 * Parses Excel (.xlsx, .xls) buffer into raw rows, scanning sheets for transaction tables
 */
const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Excel workbook has no sheets');
  }

  // Search across sheets to find the one with transaction data
  let targetSheet = workbook.Sheets[workbook.SheetNames[0]];
  let bestMatrix = [];
  let maxRows = 0;

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (matrix && matrix.length > maxRows) {
      maxRows = matrix.length;
      bestMatrix = matrix;
      targetSheet = ws;
    }
  }

  if (bestMatrix.length === 0) return [];

  const headerIdx = findHeaderRowIndex(bestMatrix);
  const headerRow = bestMatrix[headerIdx].map((h, colIdx) => String(h || `col_${colIdx}`).trim());

  const rows = [];
  for (let i = headerIdx + 1; i < bestMatrix.length; i++) {
    const line = bestMatrix[i];
    if (!line || line.length === 0) continue;

    const rowObj = {};
    let hasData = false;
    headerRow.forEach((colName, colIdx) => {
      rowObj[colName] = line[colIdx] !== undefined ? line[colIdx] : '';
      if (rowObj[colName] !== '') hasData = true;
    });

    if (hasData) rows.push(rowObj);
  }

  return rows;
};

/**
 * Parses CSV buffer into raw rows, identifying table headers and skipping metadata lines
 */
const parseCSV = (buffer) => {
  const csvString = buffer.toString('utf8');
  const rawLines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) return [];

  // Find header row index
  const matrix = rawLines.map(l => l.split(/[,;\t|]/).map(c => c.replace(/^["']|["']$/g, '').trim()));
  const headerIdx = findHeaderRowIndex(matrix);

  const cleanCsvText = rawLines.slice(headerIdx).join('\n');
  const parsed = Papa.parse(cleanCsvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  if (parsed.data && parsed.data.length > 0) {
    return parsed.data;
  }

  // Fallback: parse raw without header
  const rawParsed = Papa.parse(csvString, { header: false, skipEmptyLines: true });
  if (rawParsed.data && rawParsed.data.length > 0) {
    return rawParsed.data.map((r) => {
      const obj = {};
      r.forEach((v, idx) => { obj[`col_${idx}`] = v; });
      return obj;
    });
  }

  return [];
};

/**
 * Parses JSON buffer into raw rows
 */
const parseJSON = (buffer) => {
  const jsonString = buffer.toString('utf8');
  const data = JSON.parse(jsonString);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.transactions)) return data.transactions;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.records)) return data.records;
  if (data && typeof data === 'object') return [data];
  return [];
};

/**
 * Parses TXT buffer (tab, pipe, comma or freeform delimited)
 */
const parseTXT = (buffer) => {
  const text = buffer.toString('utf8');
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter
  const sample = lines.slice(0, 5).join('\n');
  let delimiter = '\t';
  if (sample.includes('|')) delimiter = '|';
  else if (sample.includes(',')) delimiter = ',';

  const rows = [];
  const matrix = lines.map(l => l.split(delimiter).map(c => c.trim()));
  const headerIdx = findHeaderRowIndex(matrix);

  if (matrix[headerIdx] && matrix[headerIdx].length > 1) {
    const headers = matrix[headerIdx];
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const cols = matrix[i];
      if (!cols || cols.length === 0) continue;
      const row = {};
      headers.forEach((h, idx) => {
        if (h) row[h] = cols[idx] || '';
      });
      rows.push(row);
    }
  }

  if (rows.length > 0) return rows;

  // Multi-pattern line extractor for freeform statements
  const patterns = [
    /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)/,
    /(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)/,
    /(.+?)\s+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)/
  ];

  for (const line of lines) {
    if (isNoiseRow(line)) continue;
    for (const pat of patterns) {
      const m = line.match(pat);
      if (m) {
        rows.push({
          Date: m[1],
          Description: m[2].trim(),
          Amount: m[3].trim()
        });
        break;
      }
    }
  }

  return rows;
};

/**
 * Parses PDF buffer into transaction rows using a resilient multi-pattern engine
 */
const parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = data.text || '';
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  const extractedRows = [];

  const patterns = [
    // Pattern 1: Date (DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY) ... Narration ... Amount [CR|DR]
    /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)\s*(CR|DR|DEBIT|CREDIT)?/i,
    // Pattern 2: Month Name Date (04 Sep 2026 or Sep 04, 2026) ... Narration ... Amount
    /(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)/i,
    // Pattern 3: Narration ... Date ... Amount
    /(.+?)\s+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)/i
  ];

  for (const line of lines) {
    if (isNoiseRow(line)) continue;

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const dateStr = match[1];
        const descStr = match[2].trim();
        const amountStr = match[3];
        const typeIndicator = (match[4] || '').toUpperCase();

        let type = 'expense';
        if (typeIndicator === 'CR' || typeIndicator === 'CREDIT') {
          type = 'income';
        }

        extractedRows.push({
          Date: dateStr,
          Description: descStr,
          Amount: amountStr,
          Type: type
        });
        break;
      }
    }
  }

  // Fallback: If regular patterns found nothing, parse lines with date & amount tokens
  if (extractedRows.length === 0) {
    const dateRegex = /\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/;
    const amountRegex = /\b([₹$€£]?\s*[\d,]+(?:\.\d{2})?)\b/;

    for (const line of lines) {
      if (isNoiseRow(line)) continue;
      const dMatch = line.match(dateRegex);
      const aMatch = line.match(amountRegex);

      if (dMatch && aMatch && dMatch[1] !== aMatch[1]) {
        const cleanDesc = line.replace(dMatch[0], '').replace(aMatch[0], '').replace(/\s+/g, ' ').trim();
        if (cleanDesc.length > 2) {
          extractedRows.push({
            Date: dMatch[1],
            Description: cleanDesc,
            Amount: aMatch[1],
            Type: 'expense'
          });
        }
      }
    }
  }

  return extractedRows;
};

/**
 * Main parser entry point
 */
const parseFinancialFile = async (file) => {
  if (!file || !file.buffer) {
    throw new Error('No file buffer provided for parsing');
  }

  const fileName = file.originalname || 'uploaded_file';
  const fileExt = fileName.split('.').pop().toLowerCase();
  let rawRows = [];

  switch (fileExt) {
    case 'xlsx':
    case 'xls':
      rawRows = parseExcel(file.buffer);
      break;
    case 'csv':
      rawRows = parseCSV(file.buffer);
      break;
    case 'json':
      rawRows = parseJSON(file.buffer);
      break;
    case 'txt':
      rawRows = parseTXT(file.buffer);
      break;
    case 'pdf':
      rawRows = await parsePDF(file.buffer);
      break;
    default:
      throw new Error(`Unsupported file extension: .${fileExt}`);
  }

  // Normalize into standard schema and reject noise
  const normalizedTransactions = normalizeRawRows(rawRows, fileName, fileExt);

  return {
    fileName,
    fileType: fileExt,
    fileSize: file.size || file.buffer.length,
    rawCount: rawRows.length,
    transactions: normalizedTransactions
  };
};

module.exports = {
  parseFinancialFile,
  normalizeRawRows,
  extractMerchant,
  detectPaymentMethod,
  parseAmount,
  parseDate,
  isNoiseRow,
  mapHeaderKey
};
