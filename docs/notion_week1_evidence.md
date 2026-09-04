# Week 1 Notion Submission Evidence — AI Smart Expense Tracker

**Project Name:** AI Smart Expense Tracker (MERN + Gemini AI + Multi-Format File Ingestion + Excel Dashboard)  
**Milestone:** Week 1 — System Architecture, UI/UX Wireframes, Design System, Data Modeling & Planning  
**Status:** Completed & Ready for Review  

---

## 1. Executive Summary of Week 1 Deliverables

During Week 1, the complete foundation and engineering blueprints for the **AI Smart Expense Tracker** were designed and specified:

1. **Wireframes (17 Dedicated Views)**: Comprehensive ASCII and structural layouts covering user authentication, dashboard analytics, intelligent file upload dropzone, interactive transaction review & category correction staging table, budget management, savings goal tracking, AI spending analysis, AI conversational assistant, user profiles, and administrative oversight.
2. **Design System & Style Guide**: Calibrated dark-first visual tokens (Indigo/Navy/Cosmos), high-contrast accessibility standards, category-specific badge color mapping, responsive grid rules, button hierarchies, card glassmorphic styling, and empty/loading states.
3. **Database Architecture & ER Diagram**: Mongoose schemas and relationships for 7 core collections (`User`, `Expense`, `Income`, `Budget`, `SavingsGoal`, `Category`, `ImportHistory`), including compound indexing for query acceleration and duplicate transaction mitigation.
4. **Package Inventory & Architecture**: Concrete dependency selections for backend (Express, Mongoose, Multer, SheetJS, Papa Parse, PDF-Parse, Google Gemini SDK) and frontend (Vite, React 18, React Router v6, Recharts, Lucide React, Axios, SheetJS).
5. **Multi-Format Ingestion & Excel Engine**: Detailed workflows for parsing PDF, Excel, CSV, TXT, and JSON files, normalizer fuzzy-matching dictionaries, batch AI classification, and multi-sheet formatted Excel workbook export.
6. **Cloud & Deployment Blueprint**: Architecture mappings for MongoDB Atlas, Render/Railway API host, Vercel frontend host, and Google AI Studio API integration.

---

## 2. Notion Evidence Checklist

| Milestone Artifact | File Location in Repository | Notion Submission Status |
| :--- | :--- | :--- |
| **UI/UX Wireframes (17 Views)** | [`docs/wireframes.md`](./wireframes.md) | [x] Completed & Documented |
| **Design System Tokens** | [`docs/design_system.md`](./design_system.md) | [x] Completed & Documented |
| **Database Schemas & Models** | [`docs/database_schema.md`](./database_schema.md) | [x] Completed & Documented |
| **Package Selection Inventory** | [`docs/package_planning.md`](./package_planning.md) | [x] Completed & Documented |
| **System Architecture & Workflows** | [`docs/architecture.md`](./architecture.md) | [x] Completed & Documented |
| **Backend Environment Variables** | [`backend/.env.example`](../backend/.env.example) | [x] Completed & Documented |
| **Frontend Environment Variables** | [`frontend/.env.example`](../frontend/.env.example) | [x] Completed & Documented |

---

## 3. Database Entity-Relationship (ER) Overview

```text
+----------------+          +--------------------+
|     User       | 1      * |      Expense       |
|----------------|----------|--------------------|
| _id (PK)       |          | _id (PK)           |
| name           |          | userId (FK)        |
| email (UK)     |          | title              |
| password       |          | amount             |
| role           |          | category           |
| status         |          | merchant           |
| currency       |          | paymentMethod      |
+----------------+          | date               |
        | 1                 | sourceFile         |
        |                   | isImported         |
        |                   +--------------------+
        |
        | 1      *          +--------------------+
        +-------------------|       Income       |
        |                   +--------------------+
        | 1      *          +--------------------+
        +-------------------|       Budget       |
        |                   +--------------------+
        | 1      *          +--------------------+
        +-------------------|    SavingsGoal     |
        |                   +--------------------+
        | 1      *          +--------------------+
        +-------------------|   ImportHistory    |
                            +--------------------+
```

---

## 4. Key Design Research References

Our design takes inspiration from best-in-class financial and SaaS management platforms:
* **Linear & Ramp**: High-contrast typography, keyboard-friendly navigation, subtle dark-mode borders (`rgba(255,255,255,0.08)`), and minimal layout shifts.
* **Copilot Money & Wealthfront**: Category-coded badges, visual budget gauges, and conversational AI insights.
* **Stripe Dashboard**: Clean data tables with inline action trays, duplicate warnings, and batch approve/discard controls.

---

## 5. Cloud Platform Accounts Preparation

* **Code Repository**: GitHub (Git branch tracking for Week 1 -> Week 4)
* **Database**: MongoDB Atlas M0 Cluster (`ai_expense_tracker` database)
* **Backend API Hosting**: Render.com Web Service
* **Frontend Hosting**: Vercel / Netlify
* **AI Provider**: Google AI Studio (Gemini 1.5/2.0 Flash)

---

## 6. Readiness for Week 2 (Backend Implementation)

With all architectural foundations and database models locked in, the project is positioned for **Week 2**:
* Database connection & Mongoose model initialization
* User authentication & role-based middleware (JWT + BCrypt)
* Full CRUD endpoints for Expenses, Income, Budgets, Goals, Categories
* Multer file upload & parsing pipelines (PDF, Excel, CSV, TXT, JSON)
* Google Gemini API integration for transaction categorization and financial insights
* Postman API test collection execution and verification
