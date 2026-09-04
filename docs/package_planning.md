# AI Smart Expense Tracker — Package Planning & Dependencies

This document provides the full inventory of required production and development dependencies for both backend and frontend layers, complete with exact versions, alternatives evaluated, and technical rationale.

---

## 1. Backend Dependencies (`backend/package.json`)

### Production Dependencies
```json
{
  "dependencies": {
    "express": "^4.19.2",
    "mongoose": "^8.4.0",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5",
    "papaparse": "^5.4.1",
    "pdf-parse": "^1.1.1",
    "@google/genai": "^0.1.1",
    "express-validator": "^7.1.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  }
}
```

### Backend Dependency Rationale
| Package | Version | Purpose & Technical Rationale |
| :--- | :--- | :--- |
| **`express`** | `^4.19.2` | Minimal, flexible Node.js web application framework providing robust routing and middleware capabilities. |
| **`mongoose`** | `^8.4.0` | Elegant MongoDB object modeling for Node.js, providing schema validation, type casting, query building, and business logic hooks. |
| **`dotenv`** | `^16.4.5` | Loads environment variables from `.env` file into `process.env` securely. |
| **`cors`** | `^2.8.5` | Enables Cross-Origin Resource Sharing with customizable origin whitelisting for Vite frontend integration. |
| **`jsonwebtoken`** | `^9.0.2` | Implements RFC 7519 JSON Web Tokens for stateless, signed user authentication headers. |
| **`bcryptjs`** | `^2.4.3` | Optimized pure-JS implementation of BCrypt password hashing, ensuring cross-platform stability without native build toolchains (node-gyp). |
| **`multer`** | `^1.4.5-lts.1`| Express middleware for handling `multipart/form-data`, primarily used for uploading bank statements and receipts into memory buffers. |
| **`xlsx` (SheetJS)** | `^0.18.5` | Parser and generator for Excel (`.xlsx`, `.xls`) workbooks. Used both for extracting tabular transaction data and generating formatted multi-sheet financial workbooks. |
| **`papaparse`** | `^5.4.1` | Powerful in-memory CSV parser that handles malformed commas, quotes, linebreaks, and auto-detects delimiters. |
| **`pdf-parse`** | `^1.1.1` | Pure JavaScript PDF text extraction library that parses text and table contents out of digital PDF bank statements. |
| **`@google/genai`** | `^0.1.1` | Official Google Gemini SDK for batch transaction categorization, spending analysis, budget recommendations, and user-isolated financial Q&A. |
| **`express-validator`** | `^7.1.0`| Declarative middleware for request body and parameter validation and sanitization. |
| **`helmet`** | `^7.1.0` | Secures Express apps by setting essential HTTP response security headers. |
| **`morgan`** | `^1.10.0` | HTTP request logger middleware for development and auditing API latency. |

### Development Dependencies
```json
{
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## 2. Frontend Dependencies (`frontend/package.json`)

### Production Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "lucide-react": "^0.378.0",
    "recharts": "^2.12.7",
    "axios": "^1.7.2",
    "react-dropzone": "^14.2.3",
    "xlsx": "^0.18.5",
    "canvas-confetti": "^1.9.3"
  }
}
```

### Frontend Dependency Rationale
| Package | Version | Purpose & Technical Rationale |
| :--- | :--- | :--- |
| **`react` & `react-dom`** | `^18.3.1` | Declarative, component-driven UI library utilizing the virtual DOM and React hooks. |
| **`vite`** | `^5.2.11` | Next-generation frontend tooling providing instant hot module replacement (HMR) and optimized Rollup production bundles. |
| **`react-router-dom`** | `^6.23.1`| Standard client-side routing library supporting nested layouts, dynamic params, and protected route guards. |
| **`lucide-react`** | `^0.378.0`| Clean, consistent, lightweight SVG icon system featuring over 1,000 finance and SaaS icons. |
| **`recharts`** | `^2.12.7` | Composable charting library built on React components and SVG. Powering income vs expense bars, category donut charts, and spending trend curves. |
| **`axios`** | `^1.7.2` | Promise-based HTTP client featuring request/response interceptors for automatic JWT attachment and standardized error handling. |
| **`react-dropzone`** | `^14.2.3`| Drag and drop file ingestion library with MIME type validation, file size limits, and multi-file rejection handlers. |
| **`xlsx`** | `^0.18.5` | Client-side spreadsheet generation and export capability for instant browser downloads of financial dashboards. |
| **`canvas-confetti`** | `^1.9.3` | Lightweight micro-interaction triggering celebratory confetti animations when users reach 100% on their savings goals. |

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.11"
  }
}
```

---

## 3. Package Management & Security Scripts

### Backend `package.json` Scripts
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Frontend `package.json` Scripts
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```
