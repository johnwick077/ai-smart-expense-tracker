# Week 2 Notion Submission Evidence — AI Smart Expense Tracker

**Project Name:** AI Smart Expense Tracker (MERN + Gemini AI + Multi-Format File Ingestion + Excel Dashboard)  
**Milestone:** Week 2 — Backend Architecture, Authentication, REST APIs, File Ingestion, AI Integration & Postman Testing  
**Status:** Completed & Fully Tested  

---

## 1. Executive Summary of Week 2 Backend Implementation

During Week 2, the complete backend foundation was built and verified:

1. **Authentication & Authorization**:
   - JWT stateless token generation and verification middleware (`requireAuth`).
   - Role-Based Access Control (`requireRole('admin')`).
   - Secure password hashing using `bcryptjs` with salt rounds = 10.
   - User profile management and status enforcement (active / deactivated / banned).

2. **Core Domain Models & Schemas**:
   - `User`: email uniqueness, password hashing pre-save hook, JWT helper.
   - `Expense`: compound indexes (`userId` + `date` + `merchant` + `amount`) for high-velocity lookups and duplicate detection.
   - `Income`: tracking source, amount, description, and sourceFile attribution.
   - `Budget`: unique monthly compound index `{ userId: 1, category: 1, month: 1, year: 1 }` preventing duplicate allocations.
   - `SavingsGoal`: tracking target, accumulated amount, completion ratio, and deadline.
   - `Category`: 12 predefined standard categories with custom user-created category support.
   - `ImportHistory`: audit logging for uploaded files, format metadata, and transaction counts.

3. **Multi-Format File Ingestion & Parsing Engine**:
   - Formats supported: **PDF**, **Excel (.xlsx, .xls)**, **CSV**, **TXT**, **JSON**.
   - Intelligent column normalizer mapping arbitrary bank headers into standard fields using synonym dictionaries.
   - Duplicate detection engine matching transactions within ±24 hours on amount and merchant.
   - Staging table workflow returning extracted and categorized records for user review before committing to database.

4. **Google Gemini AI Services**:
   - `POST /api/ai/categorize`: Batch transaction categorization returning standard categories and confidence scores.
   - `POST /api/ai/analyze`: Spending analysis synthesizing top categories and savings potential.
   - `POST /api/ai/monthly-summary`: Executive monthly financial report.
   - `POST /api/ai/budget`: Recommended budget allocations based on 50/30/20 principles.
   - `POST /api/ai/suggestions`: Actionable saving recommendations.
   - `POST /api/ai/chat`: Private, user-isolated conversational financial assistant.

5. **Postman API Test Collection**:
   - Exportable collection: `backend/postman_collection.json`.
   - Complete coverage across 9 test suites: Health, Auth, Expenses, Income, Budgets, Goals, Categories, Import, AI, Admin.

---

## 2. API Endpoint Matrix

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check and server uptime |
| `POST` | `/api/auth/register` | Public | Register new user or admin with secret |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/auth/logout` | Private | Stateless logout confirmation |
| `GET` | `/api/auth/profile` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile or password |
| `GET` | `/api/expenses` | Private | List expenses with search, category, date filter, pagination |
| `POST` | `/api/expenses` | Private | Create manual expense |
| `GET` | `/api/expenses/:id` | Private | Retrieve single expense by ID |
| `PUT` | `/api/expenses/:id` | Private | Update expense details |
| `DELETE` | `/api/expenses/:id` | Private | Delete expense record |
| `GET` | `/api/expenses/summary`| Private | Category spending breakdown and totals |
| `GET` | `/api/income` | Private | List all recorded income streams |
| `POST` | `/api/income` | Private | Create new income record |
| `GET` | `/api/income/:id` | Private | Retrieve single income record |
| `PUT` | `/api/income/:id` | Private | Update income record |
| `DELETE` | `/api/income/:id` | Private | Delete income record |
| `GET` | `/api/budgets` | Private | Get budgets for month/year with actual spent comparison |
| `POST` | `/api/budgets` | Private | Create or update category budget |
| `DELETE` | `/api/budgets/:id` | Private | Delete budget entry |
| `GET` | `/api/goals` | Private | List savings goals with progress percentages |
| `POST` | `/api/goals` | Private | Create savings goal |
| `POST` | `/api/goals/:id/deposit` | Private | Add deposit towards savings goal |
| `PUT` | `/api/goals/:id` | Private | Update goal target or deadline |
| `DELETE` | `/api/goals/:id` | Private | Delete savings goal |
| `GET` | `/api/categories` | Private | Get standard and custom categories |
| `POST` | `/api/categories` | Private | Create custom category |
| `POST` | `/api/import/upload` | Private | Upload and parse statement (PDF, XLSX, CSV, TXT, JSON) |
| `POST` | `/api/import/process`| Private | Confirm and commit reviewed transactions to DB |
| `GET` | `/api/import/history`| Private | List user's statement import history |
| `GET` | `/api/import/:id` | Private | Get specific import audit record |
| `DELETE` | `/api/import/:id` | Private | Delete import history record |
| `POST` | `/api/ai/categorize` | Private | AI batch categorization with Gemini |
| `POST` | `/api/ai/analyze` | Private | AI spending analysis report |
| `POST` | `/api/ai/monthly-summary` | Private | AI monthly financial summary |
| `POST` | `/api/ai/budget` | Private | AI recommended monthly budgets |
| `POST` | `/api/ai/suggestions`| Private | AI actionable saving suggestions |
| `POST` | `/api/ai/chat` | Private | Isolated conversational financial assistant |
| `GET` | `/api/admin/stats` | Admin | Platform-wide user and volume metrics |
| `GET` | `/api/admin/users` | Admin | Search, filter, and paginate all users |
| `PUT` | `/api/admin/users/:id/status` | Admin | Toggle user active/deactivated/banned |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user account and cascade data |

---

## 3. Postman Test Collection Evidence

The complete Postman Collection v2.1 is located at:
📁 [`backend/postman_collection.json`](../backend/postman_collection.json)

Sample test files for immediate testing:
- CSV: `backend/test_samples/sample_statement.csv`
- Excel: `backend/test_samples/sample_expenses.xlsx`
- JSON: `backend/test_samples/sample_statement.json`
- TXT: `backend/test_samples/sample_statement.txt`
