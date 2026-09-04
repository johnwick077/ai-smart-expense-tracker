const XLSX = require('xlsx');
const Papa = require('papaparse');
const pdfParse = require('pdf-parse');

// Fuzzy column synonyms dictionary
const HEADER_SYNONYMS = {
  date: ['date', 'txn date', 'transaction date', 'posting date', 'value date', 'trans date', 'time', 'timestamp'],
  description: ['description', 'narration', 'particulars', 'details', 'remarks', 'transaction details', 'note', 'memo', 'title'],
  amount: ['amount', 'txn amount', 'transaction amount', 'net amount', 'total', 'sum'],
  debit: ['debit', 'dr', 'withdrawal', 'withdrawals', 'spent', 'expense', 'debit amount', 'outflow', 'paid out', 'withdrawal amt'],
  credit: ['credit', 'cr', 'deposit', 'deposits', 'received', 'income', 'credit amount', 'inflow', 'paid in', 'deposit amt'],
  merchant: ['merchant', 'payee', 'vendor', 'beneficiary', 'recipient', 'party', 'store'],
  paymentMethod: ['payment method', 'mode', 'channel', 'instrument', 'type of payment', 'method'],
  category: ['category', 'tag', 'classification', 'expense type'],
  balance: ['balance', 'closing balance', 'running balance', 'avail balance', 'net balance']
};

// Patterns that identify non-transaction metadata, summary, or disclaimer rows
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
 * Checks if a row or raw text is non-transaction noise (e.g. metadata, disclaimer, summary)
 */
const isNoiseRow = (text) => {
  if (!text) return false;
  const str = String(text).trim();
  return NOISE_PATTERNS.some(pattern => pattern.test(str));
};

/**
 * Normalizes raw date string into valid ISO Date.
 * Returns null if the string is not a genuine date.
 */
const parseDate = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate instanceof Date && !isNaN(rawDate)) return rawDate;

  const dateStr = String(rawDate).trim();
  if (isNoiseRow(dateStr)) return null;

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1990 && y <= 2100) {
      return new Date(y, m - 1, d);
    }
  }

  // Handle YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = dateStr.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1990 && y <= 2100) {
      return new Date(y, m - 1, d);
    }
  }

  // Handle DD-MMM-YYYY (e.g. 04-Sep-2026 or 04 Sep 2026)
  const ddmmmyyyy = dateStr.match(/^(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{4})/);
  if (ddmmmyyyy) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // General parse fallback
  const parsed = new Date(dateStr);
  return (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1990 && parsed.getFullYear() <= 2100)
    ? parsed
    : null;
};

/**
 * Normalizes currency / number strings into float
 */
const parseAmount = (rawAmount) => {
  if (typeof rawAmount === 'number') return Math.abs(rawAmount);
  if (!rawAmount) return 0;

  // Clean currency symbols, commas, and whitespace
  const clean = String(rawAmount).replace(/[₹$€£, ]/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.abs(num);
};

/**
 * Detects specific payment methods (UPI, Debit Card, ATM, Credit Card, Net Banking)
 * based on transaction narrative and channel keywords requested by user.
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
 * Filters out metadata, account headers, summary lines, and non-transaction data.
 */
const normalizeRawRows = (rawRows, sourceFileName, sourceFileType) => {
  const normalized = [];

  for (const row of rawRows) {
    if (!row || typeof row !== 'object') continue;

    // Detect keys
    let dateVal = null;
    let descVal = '';
    let amountVal = 0;
    let debitVal = 0;
    let creditVal = 0;
    let typeVal = 'expense';
    let merchantVal = '';
    let paymentVal = '';
    let categoryVal = '';

    for (const [key, val] of Object.entries(row)) {
      const standardKey = mapHeaderKey(key);
      if (!standardKey || val === undefined || val === null || val === '') continue;

      if (standardKey === 'date' && !dateVal) {
        dateVal = val;
      } else if (standardKey === 'description' && !descVal) {
        descVal = String(val);
      } else if (standardKey === 'amount' && amountVal === 0) {
        amountVal = parseAmount(val);
      } else if (standardKey === 'debit') {
        debitVal = parseAmount(val);
      } else if (standardKey === 'credit') {
        creditVal = parseAmount(val);
      } else if (standardKey === 'merchant' && !merchantVal) {
        merchantVal = String(val);
      } else if (standardKey === 'paymentMethod') {
        paymentVal = String(val);
      } else if (standardKey === 'category') {
        categoryVal = String(val);
      }
    }

    // Determine amount and type from debit/credit if present
    if (debitVal > 0) {
      amountVal = debitVal;
      typeVal = 'expense';
    } else if (creditVal > 0) {
      amountVal = creditVal;
      typeVal = 'income';
    }

    const fullRowText = `${descVal} ${merchantVal} ${categoryVal}`;

    // STRICT TRANSACTION VALIDATION & NOISE REJECTION:
    // 1. Must NOT be an account summary, opening/closing balance, or footer disclaimer line
    if (isNoiseRow(fullRowText)) continue;

    // 2. Must have a valid date
    const parsedDate = parseDate(dateVal);
    if (!parsedDate) continue;

    // 3. Must have a positive amount (> 0)
    if (amountVal <= 0) continue;

    // 4. Must have a meaningful transaction description or merchant
    if (!descVal && !merchantVal) continue;

    // Detect Payment Method (UPI, Debit Card, ATM, Credit Card, Net Banking)
    const { paymentMethod, typeHint } = detectPaymentMethod(fullRowText, paymentVal);
    if (typeHint && !debitVal && !creditVal) {
      typeVal = typeHint;
    }

    const finalDescription = descVal || merchantVal || 'Verified Transaction';
    const finalMerchant = merchantVal || extractMerchant(finalDescription);

    normalized.push({
      date: parsedDate,
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
 * Finds the index of the header row in a 2D array of rows (Excel or CSV)
 * by looking for standard banking keywords like 'date', 'amount', 'narration', etc.
 */
const findHeaderRowIndex = (matrix) => {
  if (!Array.isArray(matrix) || matrix.length === 0) return 0;

  for (let i = 0; i < Math.min(matrix.length, 25); i++) {
    const row = matrix[i];
    if (!row) continue;
    const rowValues = (Array.isArray(row) ? row : Object.values(row))
      .map(v => String(v || '').trim().toLowerCase());

    const hasDate = rowValues.some(v => mapHeaderKey(v) === 'date');
    const hasAmount = rowValues.some(v => ['amount', 'debit', 'credit', 'withdrawal'].includes(mapHeaderKey(v)));
    const hasDesc = rowValues.some(v => ['description', 'merchant'].includes(mapHeaderKey(v)));

    if (hasDate && (hasAmount || hasDesc)) {
      return i;
    }
  }

  return 0; // Default to first row if no header detected
};

/**
 * Parses Excel (.xlsx, .xls) buffer into raw rows, skipping non-table header metadata
 */
const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Excel workbook has no sheets');
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to raw 2D array
  const rawMatrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rawMatrix || rawMatrix.length === 0) return [];

  const headerIdx = findHeaderRowIndex(rawMatrix);
  const headerRow = rawMatrix[headerIdx].map(h => String(h || '').trim());

  const rows = [];
  for (let i = headerIdx + 1; i < rawMatrix.length; i++) {
    const line = rawMatrix[i];
    if (!line || line.length === 0) continue;

    const rowObj = {};
    let hasData = false;
    headerRow.forEach((colName, colIdx) => {
      if (colName) {
        rowObj[colName] = line[colIdx] !== undefined ? line[colIdx] : '';
        if (rowObj[colName] !== '') hasData = true;
      }
    });

    if (hasData) rows.push(rowObj);
  }

  return rows;
};

/**
 * Parses CSV buffer into raw rows, finding the table header and skipping metadata lines
 */
const parseCSV = (buffer) => {
  const csvString = buffer.toString('utf8');
  const rawLines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) return [];

  // Find header line
  const matrix = rawLines.map(l => l.split(/[,;\t|]/).map(c => c.replace(/^["']|["']$/g, '').trim()));
  const headerIdx = findHeaderRowIndex(matrix);

  // Parse CSV starting from header row
  const cleanCsvText = rawLines.slice(headerIdx).join('\n');
  const parsed = Papa.parse(cleanCsvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(`CSV Parsing error: ${parsed.errors[0].message}`);
  }

  return parsed.data;
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
  return [data];
};

/**
 * Parses TXT buffer (tab, pipe, or line delimited), ignoring metadata lines
 */
const parseTXT = (buffer) => {
  const text = buffer.toString('utf8');
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Check if delimiter exists in first line (tab, pipe, comma)
  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('|')) delimiter = '|';
  else if (firstLine.includes(',')) delimiter = ',';

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

  // If structured delimiter parsing yielded rows, return them
  if (rows.length > 0) return rows;

  // Fallback: regex line extractor for freeform statements, ignoring noise lines
  const regex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)/;
  for (const line of lines) {
    if (isNoiseRow(line)) continue;
    const match = line.match(regex);
    if (match) {
      rows.push({
        Date: match[1],
        Description: match[2].trim(),
        Amount: match[3].trim()
      });
    }
  }

  return rows;
};

/**
 * Parses PDF buffer into transaction rows, filtering out account summaries and footers
 */
const parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = data.text || '';
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  const extractedRows = [];
  // Regex matching: Date ... Narration ... Amount ... [CR|DR|DEBIT|CREDIT]
  const linePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)(?:\s+(CR|DR|DEBIT|CREDIT))?/i;

  for (const line of lines) {
    // Exclude header metadata and disclaimer lines
    if (isNoiseRow(line)) continue;

    const match = line.match(linePattern);
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

  // Normalize into standard schema and reject noise/metadata
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
  isNoiseRow,
  mapHeaderKey
};
