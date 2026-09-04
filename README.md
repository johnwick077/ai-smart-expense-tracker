# AI Smart Expense Tracker

> **MERN Stack + Google Gemini AI + Multi-Format File Import + Professional Excel Dashboard**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-purple.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An intelligent, portfolio-ready personal finance and expense management web application. Stop manually inputting transactions — drop bank statements, spreadsheets, or receipts (PDF, Excel, CSV, TXT, JSON), and let Gemini AI extract, normalize, and categorize your spending with intelligent duplicate detection and multi-sheet Excel dashboard export.

---

## 🚀 Key Features

* **Multi-Format Ingestion**: Drag-and-drop parsing for **PDF, Excel (.xlsx, .xls), CSV, TXT, and JSON** statements.
* **Intelligent Normalization**: Automatic fuzzy column mapping across diverse bank header formats.
* **AI Category Suggestions**: Batch-optimized categorization using Google Gemini AI into standardized categories (Food, Hotel, Shopping, Transport, Bills, etc.).
* **Interactive Staging & Duplicate Detection**: Review transactions before committing to database with duplicate warnings and inline editing.
* **Professional Excel Export**: Multi-sheet formatted Excel workbook (Dashboard, Transactions, Expenses, Income, Category Summary, Monthly Summary, Budget Performance).
* **AI Financial Assistant & Monthly Summaries**: Private, user-isolated chat assistant answering questions about your spending and offering proactive budget recommendations.
* **Role-Based Access Control**: Standard User role and Admin dashboard for platform metrics and user management.

---

## 📁 Repository Structure

```text
ai-expense-tracker/
├── backend/                # Node.js & Express REST API
│   ├── config/             # Database, Multer, and AI configurations
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, RBAC, and error handlers
│   ├── models/             # Mongoose schemas (User, Expense, Income, Budget, etc.)
│   ├── routes/             # Express API routes
│   ├── services/           # File parsers, AI services, Excel generator
│   └── .env.example
├── frontend/               # Vite + React 18 SPA
│   ├── src/
│   │   ├── components/     # UI design system components
│   │   ├── layouts/        # Dashboard & Auth layouts
│   │   ├── pages/          # 17 application views
│   │   └── services/       # Axios API integration
│   └── .env.example
└── docs/                   # Engineering & Planning Documentation
    ├── wireframes.md       # ASCII & structural wireframes for 17 screens
    ├── design_system.md    # Color tokens, typography, component specs
    ├── database_schema.md  # MongoDB schemas, indexes, and ER diagram
    ├── package_planning.md # Complete dependency inventory & rationale
    ├── architecture.md     # File parsing, AI pipeline & export architecture
    └── notion_week1_evidence.md # Week 1 milestone evidence for Notion
```

---

## 📅 4-Week Development Roadmap

- [x] **Week 1: Planning & Architecture** (Wireframes for 17 views, Dark Design System tokens, MongoDB Schemas, ER Diagram, Package Selection, Cloud Plan)
- [x] **Week 2: Backend Development & AI Integration** (JWT Auth/RBAC, Expense/Income CRUD, Multi-format Parsers for PDF/Excel/CSV/TXT/JSON, Gemini AI Categorization/Chat, 39/39 Passing API Tests, Postman Collection)
- [x] **Week 3: Frontend Scaffolding & Design System** (Vite + React 18, Custom Dark Theme CSS, 17 Interactive Views, Recharts Analytics, Dropzone Ingestion, Client Axios Pipeline)
- [x] **Week 4: Professional Excel Dashboard & Production Polish** (7-Sheet Formatted SheetJS Excel Export, Client & Server Binary Delivery, End-to-End Verification, Zero-Config In-Memory Fallback)

---

## 🔑 Demo Accounts (Instant Offline Testing)

The platform includes a resilient in-memory database fallback with pre-seeded data, allowing immediate testing even without a local MongoDB service:

| Account Role | Email Address | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Standard User** | `joel.user@example.com` | `Password123!` | Dashboard, CRUD Expenses/Income, Budgets, Goals, File Import, AI Assistant, 7-Sheet Excel Export |
| **Admin Superuser** | `admin@expensetracker.ai` | `AdminSecure123!` | Admin Analytics, User Directory, Global Ingestion Statistics, Security Controls |

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/johnwick077/ai-smart-expense-tracker.git
cd ai-smart-expense-tracker

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Launch both backend (port 5000) and frontend (port 5173) simultaneously
npm run dev

# 4. Run automated test suite (39/39 passing)
cd backend && npm test
```

---

## 🛠️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_expense_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
ADMIN_SECRET=your_admin_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
MAX_FILE_SIZE_MB=10
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📖 Documentation Quick Links
* [Wireframe Layouts (17 Views)](file:///c:/Users/joelm/Downloads/Mern_pro/docs/wireframes.md)
* [Design System & Palette Tokens](file:///c:/Users/joelm/Downloads/Mern_pro/docs/design_system.md)
* [Database Schemas & ER Diagram](file:///c:/Users/joelm/Downloads/Mern_pro/docs/database_schema.md)
* [Package Planning & Rationale](file:///c:/Users/joelm/Downloads/Mern_pro/docs/package_planning.md)
* [System Architecture & Ingestion Pipeline](file:///c:/Users/joelm/Downloads/Mern_pro/docs/architecture.md)
* [Week 1 Notion Evidence Submission](file:///c:/Users/joelm/Downloads/Mern_pro/docs/notion_week1_evidence.md)
* [Week 2 Notion Evidence Submission](file:///c:/Users/joelm/Downloads/Mern_pro/docs/notion_week2_evidence.md)
* [Week 3 Notion Evidence Submission](file:///c:/Users/joelm/Downloads/Mern_pro/docs/notion_week3_evidence.md)
* [Week 4 Notion Evidence Submission](file:///c:/Users/joelm/Downloads/Mern_pro/docs/notion_week4_evidence.md)
