# AI Smart Expense Tracker — System Architecture & Workflow Specifications

This document outlines the core technical workflows, file ingestion pipeline, data normalization algorithms, AI batch classification engine, duplicate detection strategy, and multi-sheet Excel export architecture for the **AI Smart Expense Tracker**.

---

## 1. End-to-End System Data Flow

```text
User uploads file (PDF / XLSX / CSV / TXT / JSON)
        │
        ▼
[Upload Middleware] ──> Validation (MIME type check & 10MB size limit)
        │
        ▼
[File Parser Service] ──> Extracts tabular rows using format-specific parser
        │
        ▼
[Column Normalizer] ──> Maps dynamic column headers to Universal Transaction Schema
        │
        ▼
[Duplicate Detector] ──> Checks MongoDB against past transactions (user + amount + date + merchant)
        │
        ▼
[AI Batch Categorizer] ──> Groups unique merchants, sends batch prompt to Gemini, receives JSON tags
        │
        ▼
[Staging Table (Client)] ──> User reviews extracted entries, edits categories/amounts, flags duplicates
        │
        ▼
[Confirmed Commit] ──> Saves validated transactions into MongoDB (Expenses & Income collections)
        │
        ▼
[Live Dashboard & Excel Export] ──> Aggregates metrics & generates 7-sheet formatted workbook
```

---

## 2. File Parsing & Extraction Pipeline

### 2.1 Supported File Types & Extraction Engines

| Format | Library | Extraction Strategy | Error Handling |
| :--- | :--- | :--- | :--- |
| **PDF** | `pdf-parse` | Extracts raw text stream, analyzes tabular line patterns via regex (matching `\d{2}[/-]\d{2}[/-]\d{4}` date markers and monetary amounts). | Handles password-protected PDFs by returning explicit error codes. |
| **Excel (`.xlsx`, `.xls`)** | `xlsx` (SheetJS) | Reads workbook buffer, selects the first data sheet, converts range to raw JSON row array (`XLSX.utils.sheet_to_json`). | Rejects empty worksheets or workbooks without headers. |
| **CSV** | `papaparse` | Parses CSV stream with dynamic delimiter detection (commas, semicolons, tabs), trims whitespaces, and skips blank lines. | Flags unescaped quotes or malformed row counts. |
| **JSON** | Native V8 JSON | Parses JSON array of objects directly. | Validates JSON syntax and schema presence. |
| **TXT** | Native `readline` | Parses text line by line using common delimiter patterns (`tab`, `|`, `,`, or fixed widths). | Rejects unparseable freeform notes without structured transactions. |

---

## 3. Intelligent Column Mapping & Normalization

Financial files from diverse banks and accounting apps use varying header names. The normalizer runs fuzzy header mapping using synonym dictionaries:

### Header Synonym Dictionary
```javascript
const HEADER_DICTIONARY = {
  date: ['date', 'txn date', 'transaction date', 'posting date', 'value date', 'trans date', 'time'],
  description: ['description', 'narration', 'particulars', 'transaction details', 'details', 'remarks', 'note'],
  amount: ['amount', 'txn amount', 'transaction amount', 'net amount', 'total'],
  debit: ['debit', 'dr', 'withdrawal', 'spent', 'expense', 'debit amount'],
  credit: ['credit', 'cr', 'deposit', 'received', 'income', 'credit amount'],
  merchant: ['merchant', 'payee', 'vendor', 'beneficiary', 'recipient', 'party'],
  paymentMethod: ['mode', 'payment method', 'channel', 'type of payment', 'instrument']
};
```

### Universal Normalized Transaction Object
```json
{
  "date": "2026-09-04T00:00:00.000Z",
  "description": "SWIGGY BANGALORE UPI/424829104",
  "merchant": "Swiggy",
  "amount": 450.00,
  "type": "expense",
  "paymentMethod": "UPI",
  "category": "Food",
  "aiConfidence": 0.98,
  "isDuplicate": false,
  "sourceFile": {
    "fileName": "HDFC_September_Statement.pdf",
    "fileType": "pdf"
  }
}
```

---

## 4. AI Batch Categorization Pipeline

### 4.1 Optimization Logic (Grouping & Deduplication)
To avoid excessive API latency and token costs, transactions extracted from large files are not categorized individually. Instead:
1. Extract all unique descriptions/merchants from the parsed file.
2. Group transactions sharing the same merchant key.
3. Send a single batch prompt containing up to 50 unique merchants to Google Gemini.
4. Gemini returns structured JSON mapping each merchant to a predefined category and confidence score.
5. Re-map suggestions back onto all transactions in memory.

### 4.2 Standard Prompt Structure for Gemini
```text
You are an expert financial categorization assistant.
Analyze the following list of transaction descriptions and categorize each into EXACTLY ONE of these predefined categories:
[Food, Hotel, Shopping, Transport, Bills, Entertainment, Healthcare, Education, Rent, Travel, Salary, Other]

Rules:
1. Return ONLY valid JSON array of objects.
2. If uncertain, assign "Other" with low confidence.
3. Extract the clean Merchant name.

Input:
[
  { "id": 1, "description": "Swiggy Bangalore" },
  { "id": 2, "description": "Marriott Hotel Mumbai" },
  { "id": 3, "description": "Amazon Retail India" },
  { "id": 4, "description": "Uber India Rides" }
]

Output Format:
[
  { "id": 1, "merchant": "Swiggy", "category": "Food", "confidence": 0.98 },
  { "id": 2, "merchant": "Marriott Hotel", "category": "Hotel", "confidence": 0.96 },
  { "id": 3, "merchant": "Amazon", "category": "Shopping", "confidence": 0.95 },
  { "id": 4, "merchant": "Uber", "category": "Transport", "confidence": 0.97 }
]
```

---

## 5. Duplicate Detection Algorithm

Before presenting transactions on the Review Page, candidate entries are matched against existing MongoDB records:
1. **Match Key**: `userId` + `amount` (exact match) + `merchant` (case-insensitive substring) + `date` (within a ±24-hour window to handle bank settlement lag).
2. **Flagging**: If a match is found, transaction is tagged with:
   ```json
   {
     "isDuplicate": true,
     "duplicateReason": "Matches existing transaction: ₹450 on 04 Sep (Swiggy)"
   }
   ```
3. **User Choice**: Users can select "Skip all duplicates" or manually approve individual entries.

---

## 6. Multi-Sheet Professional Excel Workbook Architecture

The **Export Dashboard to Excel** feature compiles a workbook with 7 formatted worksheets:

```text
ai_expense_report_2026.xlsx
├── Sheet 1: Dashboard           (Executive Summary, Metrics, Month-over-Month Overview)
├── Sheet 2: Transactions        (All transactions with full metadata)
├── Sheet 3: Expenses            (Expense-only filtered records)
├── Sheet 4: Income              (Income-only records)
├── Sheet 5: Category Summary    (Aggregated totals, percentages, and category share)
├── Sheet 6: Monthly Summary     (Monthly Inflow vs Outflow vs Net Savings)
└── Sheet 7: Budget Performance  (Budget vs Spent vs Remaining & Health Status)
```

### Workbook Formatting Features
* **Freeze Panes**: Row 1 headers remain frozen on scroll.
* **Auto-fit Columns**: Column widths automatically calculate based on maximum string lengths + 4 padding characters.
* **Currency Formatting**: Monetary columns formatted as `₹#,##0.00`.
* **Health Indicators**: Budget sheet conditionally styles "Safe" in green and "Exceeded" in bold red.
