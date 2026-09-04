# AI Smart Expense Tracker — Wireframe Specifications

This document provides visual ASCII wireframes, component breakdowns, and interactive state definitions for all 17 screens required for the **AI Smart Expense Tracker**.

---

## Table of Contents
1. [Landing Page](#1-landing-page)
2. [Login Page](#2-login-page)
3. [Register Page](#3-register-page)
4. [Dashboard](#4-dashboard)
5. [Expenses Page](#5-expenses-page)
6. [Income Page](#6-income-page)
7. [Budgets Page](#7-budgets-page)
8. [Savings Goals Page](#8-savings-goals-page)
9. [Analytics Page](#9-analytics-page)
10. [Import Data (Upload Dropzone)](#10-import-data-upload-dropzone)
11. [Import Review (Transaction Staging Table)](#11-import-review-transaction-staging-table)
12. [Import History](#12-import-history)
13. [AI Spending Insights & Monthly Summary](#13-ai-spending-insights--monthly-summary)
14. [AI Financial Assistant (Chat)](#14-ai-financial-assistant-chat)
15. [User Profile & Settings](#15-user-profile--settings)
16. [Admin Dashboard](#16-admin-dashboard)
17. [Admin User Management](#17-admin-user-management)

---

## 1. Landing Page
```text
+-------------------------------------------------------------------------------------------------------+
|  [Logo] SmartExpense AI             Features   Pricing   Demo   About            [Login] [Get Started] |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|      ⚡ AI-POWERED PERSONAL WEALTH PLATFORM                                                           |
|      Master Your Finances. Automate Receipt & Statement Ingestion.                                    |
|      Drop bank statements, spreadsheets or receipts — let Gemini AI categorize transactions           |
|      with 98% accuracy and export multi-sheet Excel dashboards in seconds.                            |
|                                                                                                       |
|      [ Upload Statement Now ]   [ Explore Live Demo -> ]                                              |
|                                                                                                       |
|      Supported Formats: [PDF] [Excel .xlsx] [CSV] [JSON] [TXT]                                        |
|                                                                                                       |
|      +-----------------------------------------------------------------------------------------+      |
|      |  INTERACTIVE PREVIEW: Upload "Sept_Statement.pdf" -> Auto-extracted 45 transactions     |      |
|      |  • Swiggy Bangalore  -->  [Food 🍔] (98% confidence)                                    |      |
|      |  • Uber Trip         -->  [Transport 🚗] (96% confidence)                              |      |
|      |  • Amazon India      -->  [Shopping 🛍️] (94% confidence)                              |      |
|      +-----------------------------------------------------------------------------------------+      |
|                                                                                                       |
|  [3 Key Pillars]                                                                                      |
|  +---------------------------+ +----------------------------+ +------------------------------------+  |
|  | 📥 Multi-Format Ingestion  | | 🧠 Intelligent Gemini AI   | | 📊 Professional Excel Dashboards   |  |
|  | Drag & drop statements,   | | Zero manual tagging. Smart | | Multi-tab formatted workbooks with |  |
|  | receipts & files with     | | duplicate alerts and spend | | formulas, category summaries, and  |  |
|  | automatic normalization.  | | optimization insights.     | | monthly spending performance.      |  |
|  +---------------------------+ +----------------------------+ +------------------------------------+  |
|                                                                                                       |
|  Footer: (c) 2026 AI Smart Expense Tracker • Built with MERN Stack + Gemini AI                        |
+-------------------------------------------------------------------------------------------------------+
```

---

## 2. Login Page
```text
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|                                     +---------------------------------------+                         |
|                                     |         [Logo] SmartExpense AI        |                         |
|                                     |            Welcome Back               |                         |
|                                     |    Enter credentials to access funds   |                         |
|                                     |                                       |                         |
|                                     |  Email Address                        |                         |
|                                     |  [ user@example.com                 ] |                         |
|                                     |                                       |                         |
|                                     |  Password                             |                         |
|                                     |  [ ••••••••••••••••••             👁️ ] |                         |
|                                     |                                       |                         |
|                                     |  [x] Remember me     Forgot password? |                         |
|                                     |                                       |                         |
|                                     |  [       Sign In to Account       ]   |                         |
|                                     |                                       |                         |
|                                     |  Quick Demo Fill:                     |                         |
|                                     |  [ Demo User ]    [ Demo Admin ]      |                         |
|                                     |                                       |                         |
|                                     |  Don't have an account? Sign Up       |                         |
|                                     +---------------------------------------+                         |
|                                                                                                       |
+-------------------------------------------------------------------------------------------------------+
```

---

## 3. Register Page
```text
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|                                     +---------------------------------------+                         |
|                                     |         [Logo] SmartExpense AI        |                         |
|                                     |           Create an Account           |                         |
|                                     |     Start tracking smarter with AI     |                         |
|                                     |                                       |                         |
|                                     |  Full Name                            |                         |
|                                     |  [ John Doe                         ] |                         |
|                                     |                                       |                         |
|                                     |  Email Address                        |                         |
|                                     |  [ john@example.com                 ] |                         |
|                                     |                                       |                         |
|                                     |  Password                             |                         |
|                                     |  [ ••••••••••••••••••             👁️ ] |                         |
|                                     |  Strength: [||||||||||  ] Strong      |                         |
|                                     |                                       |                         |
|                                     |  [x] I agree to the Terms of Service  |                         |
|                                     |                                       |                         |
|                                     |  [         Create Account         ]   |                         |
|                                     |                                       |                         |
|                                     |  Already have an account? Log In      |                         |
|                                     +---------------------------------------+                         |
|                                                                                                       |
+-------------------------------------------------------------------------------------------------------+
```

---

## 4. Dashboard
```text
+-------------------------------------------------------------------------------------------------------+
| [Logo] SmartExpense AI        [ Search transactions... ]       [🔔 2]  [Export Excel 📊] [User Profile v]
+-------------------------------------------------------------------------------------------------------+
| [Sidebar]     | [OVERVIEW STATS]                                                                      |
|               | +----------------+ +----------------+ +----------------+ +--------------------------+ |
| 📊 Dashboard  | | Total Income   | | Total Expense  | | Net Balance    | | Savings Rate             | |
| 💸 Expenses   | | ₹40,000        | | ₹24,500        | | ₹15,500        | | 38.75%                   | |
| 💰 Income     | | ↑ +8% vs last m| | ↓ 61.2% income | | Safe buffer    | | Goal: 35% [Healthy 🟢]   | |
| 🎯 Budgets    | +----------------+ +----------------+ +----------------+ +--------------------------+ |
| 🏁 Goals      |                                                                                       |
| 📈 Analytics  | [INCOME VS EXPENSES TREND]                   [SPENDING BY CATEGORY]                   |
| 📥 Import Data| +------------------------------------------+ +--------------------------------------+ |
| 📜 History    | | 50k |           [Income]    [Expense]    | |              [Donut Chart]           | |
| 💡 AI Insights| | 40k |    █  ░                            | |          🍔 Food: ₹6,500 (26.5%)     | |
| 🤖 AI Chat    | | 30k |    █  ░     █  ░                   | |          🛍️ Shopping: ₹5,000 (20.4%) | |
|               | | 20k |    █  ░     █  ░                   | |          🏨 Hotel: ₹4,000 (16.3%)    | |
| ---           | | 10k |    █  ░     █  ░                   | |          🚗 Transport: ₹3,000 (12.2%)| |
| ⚙️ Settings   | |  0k +----+--------+--------+--------+    | |          ⚡ Bills: ₹4,000 (16.3%)    | |
| 🚪 Logout     | |     Jun  Jul     Aug      Sep            | |          📦 Other: ₹2,000 (8.2%)     | |
|               | +------------------------------------------+ +--------------------------------------+ |
|               |                                                                                       |
|               | [RECENT TRANSACTIONS]                                  [QUICK ACTIONS & AI TIP]       |
|               | +----------------------------------------------------+ +----------------------------+ |
|               | | Date    Description   Category    Amount   Action  | | 💡 AI Smart Tip:           | |
|               | | 04 Sep  Swiggy        Food 🍔     -₹450    [...]   | | "Food delivery was 26% of  | |
|               | | 03 Sep  Marriott      Hotel 🏨    -₹6,500  [...]   | | spend. Cook at home 2x/wk  | |
|               | | 01 Sep  Salary Sept   Salary 💼   +₹40,000 [...]   | | to save approx ₹1,300!"    | |
|               | | 28 Aug  Uber Trip     Transport   -₹350    [...]   | |                            | |
|               | | [ View All Transactions (124) -> ]                 | | [+ Add Expense] [+ Income] | |
|               | +----------------------------------------------------+ +----------------------------+ |
+-------------------------------------------------------------------------------------------------------+
```

---

## 5. Expenses Page
```text
+-------------------------------------------------------------------------------------------------------+
|  Expenses Management                             [+ Add Expense]  [Import File]  [Filter: All Time v] |
+-------------------------------------------------------------------------------------------------------+
|  [Filter Bar: Category (All v) | Date Range (This Month v) | Payment: (UPI v) | Search: [ Q Nike ] ]  |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | [x] | Date       | Title / Merchant  | Category   | Payment Method | Source File | Amount | Act |  |
|  |-----+------------+-------------------+------------+----------------+-------------+--------+-----|  |
|  | [ ] | 04-09-2026 | Swiggy Bangalore  | Food       | UPI (GPay)     | Sept_stmt   | ₹450   | ✏️ 🗑️|  |
|  | [ ] | 03-09-2026 | Marriott Hotel    | Hotel      | Credit Card    | Sept_stmt   | ₹6,500 | ✏️ 🗑️|  |
|  | [ ] | 02-09-2026 | Amazon India      | Shopping   | NetBanking     | manual      | ₹2,400 | ✏️ 🗑️|  |
|  | [ ] | 01-09-2026 | Uber Rides        | Transport  | Wallet         | Sept_stmt   | ₹350   | ✏️ 🗑️|  |
|  | [ ] | 30-08-2026 | Electricity Bill  | Bills      | Auto-debit     | manual      | ₹2,100 | ✏️ 🗑️|  |
|  +-------------------------------------------------------------------------------------------------+  |
|  Showing 1 - 25 of 184 transactions                                 [< Prev] [Page 1 of 8] [Next >]   |
+-------------------------------------------------------------------------------------------------------+
```

---

## 6. Income Page
```text
+-------------------------------------------------------------------------------------------------------+
|  Income Streams & Inflows                        [+ Add Income]   [Filter: Year 2026 v]               |
+-------------------------------------------------------------------------------------------------------+
|  Total Inflow YTD: ₹3,20,000 | Average Monthly: ₹40,000 | Top Source: Primary Salary                  |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | Date       | Source / Company         | Description           | Source Tag  | Amount   | Actions |  |
|  |------------+--------------------------+-----------------------+-------------+----------+---------|  |
|  | 01-09-2026 | Tech Innovations Pvt Ltd | September Base Salary | Sept_stmt   | ₹40,000  | ✏️  🗑️  |  |
|  | 15-08-2026 | Upwork Escrow            | Freelance UI Project  | CSV_import  | ₹18,500  | ✏️  🗑️  |  |
|  | 01-08-2026 | Tech Innovations Pvt Ltd | August Base Salary    | Aug_stmt    | ₹40,000  | ✏️  🗑️  |  |
|  | 10-07-2026 | Mutual Fund Dividend     | HDFC Index Dividend   | manual      | ₹2,400   | ✏️  🗑️  |  |
|  +-------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 7. Budgets Page
```text
+-------------------------------------------------------------------------------------------------------+
|  Monthly Budgets — September 2026                [AI Auto-Suggest Budgets 🤖]  [+ Set New Budget]     |
+-------------------------------------------------------------------------------------------------------+
|  Total Budget: ₹30,000 | Total Spent: ₹24,500 (81.6%) | Remaining Safe Buffer: ₹5,500                 |
|                                                                                                       |
|  +---------------------------+ +----------------------------+ +------------------------------------+  |
|  | 🍔 Food & Dining          | | 🛍️ Shopping & Apparel      | | 🚗 Transport & Fuel                |  |
|  | Budget: ₹8,000            | | Budget: ₹5,000             | | Budget: ₹4,000                     |  |
|  | Spent:  ₹6,500 (81.2%)    | | Spent:  ₹5,000 (100%)      | | Spent:  ₹4,500 (112.5% EXCEEDED!)  |  |
|  | [||||||||||||||    ] Safe | | [||||||||||||||||||] Limit | | [||||||||||||||||||||] OVER BUDGET |  |
|  | Remaining: ₹1,500         | | Remaining: ₹0              | | Deficit: -₹500                     |  |
|  +---------------------------+ +----------------------------+ +------------------------------------+  |
|                                                                                                       |
|  +---------------------------+ +----------------------------+ +------------------------------------+  |
|  | ⚡ Bills & Utilities      | | 🏨 Hotel & Travel          | | 📦 Other & Misc                    |  |
|  | Budget: ₹5,000            | | Budget: ₹6,000             | | Budget: ₹2,000                     |  |
|  | Spent:  ₹4,000 (80%)      | | Spent:  ₹4,000 (66.6%)     | | Spent:  ₹500 (25%)                 |  |
|  | [|||||||||||||     ] Safe | | [|||||||||||       ] Safe  | | [||||            ] Safe            |  |
|  | Remaining: ₹1,000         | | Remaining: ₹2,000          | | Remaining: ₹1,500                  |  |
|  +---------------------------+ +----------------------------+ +------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 8. Savings Goals Page
```text
+-------------------------------------------------------------------------------------------------------+
|  Savings Goals & Milestones                                              [+ Create Savings Goal]      |
+-------------------------------------------------------------------------------------------------------+
|  Total Target: ₹2,50,000 | Current Stash: ₹1,45,000 (58%) | Target Date: Dec 2026                     |
|                                                                                                       |
|  +---------------------------------------------+ +--------------------------------------------------+ |
|  | 🏖️ Europe Summer Vacation 2027               | | 🛡️ Emergency Contingency Reserve                 | |
|  | Target: ₹1,50,000                           | | Target: ₹1,00,000                                | |
|  | Saved:  ₹95,000 (63.3%)                     | | Saved:  ₹50,000 (50%)                            | |
|  | Progress: [|||||||||||||||         ]        | | Progress: [||||||||||||              ]           | |
|  | Remaining: ₹55,000 | Target: June 2027      | | Remaining: ₹50,000 | Target: Nov 2026            | |
|  | [ Deposit Funds ] [ Edit Goal ]             | | [ Deposit Funds ] [ Edit Goal ]                  | |
|  +---------------------------------------------+ +--------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------+
```

---

## 9. Analytics Page
```text
+-------------------------------------------------------------------------------------------------------+
|  Financial Analytics & Deep Dive               [Timeframe: Last 6 Months v]  [Export Chart PDF / CSV] |
+-------------------------------------------------------------------------------------------------------+
|  [6-MONTH SPENDING & SAVINGS VELOCITY]                                                                |
|  +-------------------------------------------------------------------------------------------------+  |
|  | ₹50k |                     ●---● Income (Steady ₹40k-₹42k)                                      |  |
|  | ₹40k |  ●------●-----●----/                                                                     |  |
|  | ₹30k |        \     /                                                                           |  |
|  | ₹20k |         ■---■-----■----■ Expenses (Averaging ₹24k)                                       |  |
|  | ₹10k |  ========================= Savings Growth (Cumulative: ₹1,45,000)                        |  |
|  |  ₹0k +------+------+------+------+------+------+                                                 |  |
|  |     Apr    May    Jun    Jul    Aug    Sep                                                      |  |
|  +-------------------------------------------------------------------------------------------------+  |
|                                                                                                       |
|  [CATEGORY BREAKDOWN (CLICK TO INSPECT)]            [PAYMENT METHOD RATIO]                            |
|  • Food:      ₹6,500 [26.5%] -> (18 transactions)   • UPI (Google Pay, PhonePe): 62%                  |
|  • Shopping:  ₹5,000 [20.4%] -> (12 transactions)   • Credit Card:               24%                  |
|  • Hotel:     ₹4,000 [16.3%] -> (2 transactions)    • Net Banking:               10%                  |
|  • Transport: ₹3,000 [12.2%] -> (14 transactions)   • Cash:                      4%                   |
+-------------------------------------------------------------------------------------------------------+
```

---

## 10. Import Data (Upload Dropzone)
```text
+-------------------------------------------------------------------------------------------------------+
|  Import Financial Statements & Receipts                                                               |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|      + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +    |
|      |                                                                                           |    |
|      |                                   📁                                                      |    |
|      |                         Drag & Drop Your File Here                                        |    |
|      |                                                                                           |    |
|      |                        or [ Browse Local Files ]                                          |    |
|      |                                                                                           |    |
|      |            Supported:  PDF  |  Excel (.xlsx, .xls)  |  CSV  |  TXT  |  JSON               |    |
|      |            Max file size: 10 MB                                                           |    |
|      |                                                                                           |    |
|      + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +    |
|                                                                                                       |
|  [Active Upload Status Bar] (Displays during processing):                                             |
|  File: HDFC_September_Statement.pdf (1.8 MB)                                                          |
|  Progress: [=========================>              ] 68%                                             |
|  Phase: 🧠 AI Normalizing descriptions & predicting categories with Gemini (32/45 processed)...       |
|                                                                                                       |
|  Processing Pipeline:                                                                                 |
|  [✓] File Validation  --> [✓] Type Detection --> [✓] Data Extraction --> [●] AI Categorization       |
+-------------------------------------------------------------------------------------------------------+
```

---

## 11. Import Review (Transaction Staging Table)
```text
+-------------------------------------------------------------------------------------------------------+
|  Review Extracted Transactions — "HDFC_September_Statement.pdf"                                       |
+-------------------------------------------------------------------------------------------------------+
|  Summary: 45 Items Extracted | 42 Valid | ⚠ 3 Possible Duplicates Detected                            |
|                                                                                                       |
|  [x Select All]  [Approve Selected (42)]  [Ignore Duplicates]  [Discard All]                          |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | [x]| Date   | Raw Description  | Merchant   | Amount | Type    | AI Category       | Status/Act |  |
|  |----+--------+------------------+------------+--------+---------+-------------------+------------|  |
|  | [x]| 04 Sep | SWIGGY BANGALORE | Swiggy     | ₹450   | Expense | [Food 🍔       v] | Conf: 98%  |  |
|  | [x]| 03 Sep | MARRIOTT INTL    | Marriott   | ₹6,500 | Expense | [Hotel 🏨      v] | Conf: 96%  |  |
|  | [x]| 02 Sep | AMAZON RETAIL IN | Amazon     | ₹2,400 | Expense | [Shopping 🛍️   v] | Conf: 94%  |  |
|  | [x]| 01 Sep | UBER INDIA TRIP  | Uber       | ₹350   | Expense | [Transport 🚗  v] | Conf: 95%  |  |
|  | [!]| 04 Sep | SWIGGY BANGALORE | Swiggy     | ₹450   | Expense | [Food 🍔       v] | ⚠ DUPLICATE|  |
|  |    |        ↳ Matches existing transaction recorded on 04 Sep (₹450). [Skip] [Import Anyway]    |  |
|  +-------------------------------------------------------------------------------------------------+  |
|                                                                                                       |
|  [ Cancel Import ]                                           [ Confirm & Save to MongoDB (42) -> ]    |
+-------------------------------------------------------------------------------------------------------+
```

---

## 12. Import History
```text
+-------------------------------------------------------------------------------------------------------+
|  Statement & File Import History                                                                      |
+-------------------------------------------------------------------------------------------------------+
|  Track all uploaded statements, parsed files, and audit trails.                                       |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | File Name               | Format | File Size | Processed Date | Txn Count | Status    | Actions |  |
|  |-------------------------+--------+-----------+----------------+-----------+-----------+---------|  |
|  | HDFC_Sept_Statement.pdf | PDF    | 1.8 MB    | 04 Sep 2026    | 45        | Completed | 👁️  🗑️  |  |
|  | August_Expenses.xlsx    | Excel  | 240 KB    | 03 Sep 2026    | 82        | Completed | 👁️  🗑️  |  |
|  | Uber_Trips_Q3.csv       | CSV    | 45 KB     | 01 Sep 2026    | 64        | Completed | 👁️  🗑️  |  |
|  | Cash_Notes.txt          | TXT    | 4 KB      | 28 Aug 2026    | 12        | Completed | 👁️  🗑️  |  |
|  +-------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 13. AI Spending Insights & Monthly Summary
```text
+-------------------------------------------------------------------------------------------------------+
|  AI Financial Intelligence Hub                         [⚡ Generate Fresh AI Monthly Summary]          |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | 🤖 EXECUTIVE FINANCIAL SUMMARY (September 2026)                                                 |  |
|  | Generated by Gemini AI on Sep 04, 2026                                                          |  |
|  |                                                                                                 |  |
|  | "Your total expenditure this month reached ₹24,500 against an income of ₹40,000, giving you a   |  |
|  | healthy savings rate of 38.75%. Your largest spending driver is Food (₹6,500), followed by      |  |
|  | Shopping (₹5,000). Shopping rose by 15% compared to August due to 3 high-value online orders." |  |
|  |                                                                                                 |  |
|  | Key Action Plan:                                                                                |  |
|  | 1. Food: Reducing frequent Swiggy deliveries by 2 days a week will save ~₹1,300/mo.            |  |
|  | 2. Transport: Daily ride-hailing spiked to ₹3,000. Consider weekly metro passes to save ₹1,000. |  |
|  +-------------------------------------------------------------------------------------------------+  |
|                                                                                                       |
|  +--------------------------------------------+ +--------------------------------------------------+  |
|  | 🎯 AI RECOMMENDED NEXT MONTH BUDGET        | | 💡 ANOMALIES & AUDIT FLAGS                       |  |
|  | Based on past 90 days behavior:            | | • 2 charges of ₹450 to Swiggy on same afternoon  |  |
|  | • Food:          ₹7,000 (Safety cap)       | | • Transport exceeded allotted budget by 12.5%    |  |
|  | • Shopping:      ₹4,000                    | | • Subscription to Netflix renewed at ₹649        |  |
|  | • Transport:     ₹3,000                    | |                                                  |  |
|  | • Recommended Savings: ₹12,000 (Target)    | | [ Apply Recommended Budgets in 1-Click ]         |  |
|  +--------------------------------------------+ +--------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 14. AI Financial Assistant (Chat)
```text
+-------------------------------------------------------------------------------------------------------+
|  AI Financial Assistant (Private & Isolated to Your Records)                                          |
+-------------------------------------------------------------------------------------------------------+
|  Prompt Suggestions:                                                                                  |
|  [ "Where did I spend the most this month?" ] [ "How much is left in Food budget?" ]                  |
|  [ "Can I afford a ₹15,000 phone next month?" ] [ "Summarize my recurring subscriptions" ]           |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | [User]: Where did I spend the most money this month?                                            |  |
|  |                                                                                                 |  |
|  | [🤖 AI Assistant]:                                                                              |  |
|  | Based on your verified transactions for September 2026:                                         |  |
|  | 1. Single largest transaction: Marriott Hotel (₹6,500 on Sep 03)                                |  |
|  | 2. Highest spending category: Food & Dining at ₹6,500 across 18 transactions.                    |  |
|  |                                                                                                 |  |
|  | Would you like me to show a breakdown of all Food orders or adjust your Food budget?            |  |
|  |                                                                                                 |  |
|  | [User]: How much is remaining in my Food budget?                                                |  |
|  |                                                                                                 |  |
|  | [🤖 AI Assistant]:                                                                              |  |
|  | Your Food budget for September is ₹8,000.                                                       |  |
|  | You have spent ₹6,500 so far.                                                                   |  |
|  | You have ₹1,500 remaining with 26 days left in the month (~₹57.60/day).                         |  |
|  +-------------------------------------------------------------------------------------------------+  |
|                                                                                                       |
|  [ Type your question about your finances...                                          ] [ Send 🚀 ]  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 15. User Profile & Settings
```text
+-------------------------------------------------------------------------------------------------------+
|  Profile & Account Settings                                                                           |
+-------------------------------------------------------------------------------------------------------+
|  +---------------------------------------------+ +--------------------------------------------------+ |
|  | Personal Information                        | | Preferences & Currency                           | |
|  | Name:  [ John Doe                         ] | | Preferred Currency:  [ INR (₹)                 v] | |
|  | Email: [ john@example.com                 ] | | Date Format:         [ DD-MM-YYYY              v] | |
|  | Role:  User (Standard Tier)                 | | Email Notifications: [x] Monthly Financial Digest| |
|  |                                             | |                                                  | |
|  | [ Save Profile Changes ]                    | | [ Dark Mode: Active 🌙 ]                         | |
|  +---------------------------------------------+ +--------------------------------------------------+ |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | Security & Credentials                                                                          |  |
|  | Current Password: [ ••••••••••••••••• ]                                                         |  |
|  | New Password:     [ ••••••••••••••••• ]  Confirm: [ ••••••••••••••••• ]                         |  |
|  | [ Update Password ]                                                                             |  |
|  +-------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 16. Admin Dashboard
```text
+-------------------------------------------------------------------------------------------------------+
|  [ADMIN CONSOLE] Platform Analytics & System Health                                                   |
+-------------------------------------------------------------------------------------------------------+
|  +--------------------+ +--------------------+ +--------------------+ +-----------------------------+ |
|  | Total Users        | | Active Users       | | Processed Files    | | AI Categorization API Calls | |
|  | 1,280              | | 942 (73.5%)        | | 4,890 Statements   | | 64,210 requests (99.1% ok)  | |
|  +--------------------+ +--------------------+ +--------------------+ +-----------------------------+ |
|                                                                                                       |
|  [SYSTEM LOAD & INGESTION VELOCITY]                                                                   |
|  • Ingestion queue: 0 pending, 0 failed                                                               |
|  • Average statement processing time: 1.8 seconds                                                     |
|  • Most common format: PDF (48%), XLSX (28%), CSV (18%), JSON/TXT (6%)                                |
|                                                                                                       |
|  [DEFAULT CATEGORIES DICTIONARY]                                                                      |
|  Food, Hotel, Shopping, Transport, Bills, Entertainment, Healthcare, Education, Rent, Travel, Salary  |
|  [+ Add New Master Category]                                                                          |
+-------------------------------------------------------------------------------------------------------+
```

---

## 17. Admin User Management
```text
+-------------------------------------------------------------------------------------------------------+
|  [ADMIN CONSOLE] User Account Management                                                              |
+-------------------------------------------------------------------------------------------------------+
|  Search Users: [ Search by name or email...   ]   Role Filter: [ All v ]   Status: [ All v ]          |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  | Name          | Email              | Role  | Status | Joined Date | Txns Count | Actions        |  |
|  |---------------+--------------------+-------+--------+-------------+------------+----------------|  |
|  | Joel M        | joel@admin.com     | Admin | Active | 01 Jan 2026 | 320        | [Edit]         |  |
|  | Alice Smith   | alice@example.com  | User  | Active | 12 Feb 2026 | 142        | [Deactivate]   |  |
|  | Bob Johnson   | bob@example.com    | User  | Active | 20 Mar 2026 | 89         | [Deactivate]   |  |
|  | Suspicious Ac | spam@badmail.com   | User  | Banned | 02 Sep 2026 | 2          | [Activate] [🗑️]|  |
|  +-------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```
