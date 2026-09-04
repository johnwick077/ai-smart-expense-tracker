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

- [x] **Week 1: Planning & Architecture** (Wireframes, Design System, DB Schemas, Packages, Cloud Setup, Notion Evidence)
- [ ] **Week 2: Backend Development & API Testing** (Auth, CRUD, File Parser, Gemini AI Integration, Postman Collection)
- [ ] **Week 3: Frontend Scaffolding & Integration** (Vite + React UI Components, Responsive Layouts, API Wiring)
- [ ] **Week 4: Final Polish, Excel Dashboard Export & Production Deployment** (Multi-sheet Excel, End-to-end testing, Cloud deployment)

---

## 🛠️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_expense_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
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
