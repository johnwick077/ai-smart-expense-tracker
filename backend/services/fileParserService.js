const XLSX = require('xlsx');
const Papa = require('papaparse');
const pdfParse = require('pdf-parse');

// Fuzzy column synonyms dictionary
const HEADER_SYNONYMS = {
  date: ['date', 'txn date', 'transaction date', 'posting date', 'value date', 'trans date', 'time', 'timestamp'],
  description: ['description', 'narration', 'particulars', 'details', 'remarks', 'transaction details', 'note', 'memo', 'title'],
  amount: ['amount', 'txn amount', 'transaction amount', 'net amount', 'total', 'sum'],
  debit: ['debit', 'dr', 'withdrawal', 'spent', 'expense', 'debit amount', 'outflow', 'paid out'],
  credit: ['credit', 'cr', 'deposit', 'received', 'income', 'credit amount', 'inflow', 'paid in'],
  merchant: ['merchant', 'payee', 'vendor', 'beneficiary', 'recipient', 'party', 'store'],
  paymentMethod: ['payment method', 'mode', 'channel', 'instrument', 'type of payment', 'method'],
  category: ['category', 'tag', 'classification', 'expense type']
};

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
 * Normalizes raw date string into valid ISO Date
 */
const parseDate = (rawDate) => {
  if (!rawDate) return new Date();
  if (rawDate instanceof Date && !isNaN(rawDate)) return rawDate;

  const dateStr = String(rawDate).trim();

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // Handle YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = dateStr.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // Fallback to Date parser
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
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
 * Extracts a clean merchant name from raw narration
 */
const extractMerchant = (rawDescription) => {
  if (!rawDescription) return 'Unknown Merchant';
  let desc = String(rawDescription).trim();

  // Strip common UPI and bank transaction prefixes/suffixes
  desc = desc.replace(/^(UPI[-/]|POS[-/]|NEFT[-/]|IMPS[-/]|ACH[-/]|ATM[-/])/i, '').trim();
  desc = desc.replace(/(UPI\/\d+|REV-UPI|INFO\/\d+|REF\/\d+).*$/i, '').trim();
  
  // Clean whitespace and punctuation
  desc = desc.replace(/[/*\\_-]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Return the first 2-3 words as merchant name
  const words = desc.split(' ').slice(0, 3).join(' ');
  return words.length > 0 ? words : 'Unknown Merchant';
};

/**
 * Normalizes an array of raw objects into the standard Transaction format
 */
const normalizeRawRows = (rawRows, sourceFileName, sourceFileType) => {
  const normalized = [];

  for (const row of rawRows) {
    if (!row || typeof row !== 'object') continue;

    // Detect keys
    let dateVal = null;
    let descVal = '';
    let amountVal = 0;
    let typeVal = 'expense';
    let merchantVal = '';
    let paymentVal = 'Other';
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
      } else if (standardKey === 'debit' && parseAmount(val) > 0) {
        amountVal = parseAmount(val);
        typeVal = 'expense';
      } else if (standardKey === 'credit' && parseAmount(val) > 0) {
        amountVal = parseAmount(val);
        typeVal = 'income';
      } else if (standardKey === 'merchant' && !merchantVal) {
        merchantVal = String(val);
      } else if (standardKey === 'paymentMethod') {
        paymentVal = String(val);
      } else if (standardKey === 'category') {
        categoryVal = String(val);
      }
    }

    // Skip rows with zero amount or no meaningful content
    if (amountVal <= 0 && !descVal) continue;

    const finalDescription = descVal || merchantVal || 'Imported Transaction';
    const finalMerchant = merchantVal || extractMerchant(finalDescription);

    normalized.push({
      date: parseDate(dateVal),
      description: finalDescription,
      merchant: finalMerchant,
      amount: amountVal > 0 ? amountVal : 100, // Safe positive default
      type: typeVal,
      paymentMethod: paymentVal || 'Other',
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
 * Parses Excel (.xlsx, .xls) buffer into raw rows
 */
const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Excel workbook has no sheets');
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
};

/**
 * Parses CSV buffer or string into raw rows
 */
const parseCSV = (buffer) => {
  const csvString = buffer.toString('utf8');
  const parsed = Papa.parse(csvString, {
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
 * Parses TXT buffer (tab or line delimited)
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
  const headers = lines[0].split(delimiter).map(h => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim());
    if (cols.length === 0) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || '';
    });
    rows.push(row);
  }

  // If structured delimiter parsing yielded rows, return them
  if (rows.length > 0) return rows;

  // Fallback: regex line extractor for freeform statements
  const regex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)/;
  for (const line of lines) {
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
 * Parses PDF buffer into transaction rows
 */
const parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = data.text || '';
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  const extractedRows = [];
  // Regex pattern matching: Date (DD/MM/YYYY or DD-MM-YYYY) ... Narration ... Amount
  const linePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+([₹$€£]?\s*[\d,]+(?:\.\d{2})?)(?:\s+(CR|DR|DEBIT|CREDIT))?/i;

  for (const line of lines) {
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

  if (extractedRows.length === 0) {
    // If regular table regex didn't find lines, create a single entry from raw text preview for review
    extractedRows.push({
      Date: new Date().toISOString().split('T')[0],
      Description: text.slice(0, 100).replace(/\s+/g, ' ').trim() || 'Scanned PDF Statement',
      Amount: 100
    });
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

  // Normalize into standard schema
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
  mapHeaderKey
};
