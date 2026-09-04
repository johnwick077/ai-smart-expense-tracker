# AI Smart Expense Tracker — Design System & UI Specification

A cohesive, modern, and accessible design system engineered for high-performance financial management interfaces.

---

## 1. Design Philosophy & Visual Principles

1. **Information Hierarchy First**: Financial data requires absolute clarity. Key metrics (income, expenses, remaining balances) must pop instantly without optical noise.
2. **Harmonious Dark-First Palette**: Premium dark theme by default (reducing eye strain during financial reviews) with calibrated contrast ratios (WCAG AAA compliance for critical numbers).
3. **Subtle Micro-Interactions**: Hover lifts on metric cards, animated progress meters, and intuitive feedback during statement ingestion.
4. **Zero Layout Shifts**: Skeleton loaders and deterministic grid slots prevent jarring layout shifts during data fetching and AI stream responses.

---

## 2. Color Palette & Design Tokens

### Primary & Accent Colors
```css
:root {
  /* Brand Accents */
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-500: #6366F1;   /* Indigo 500 - Primary Brand */
  --primary-600: #4F46E5;   /* Indigo 600 - Primary Hover */
  --primary-700: #4338CA;
  
  --accent-cyan: #06B6D4;   /* Cyan 500 - Secondary Highlights */
  --accent-purple: #A855F7; /* Purple 500 - AI Intelligence Badge */

  /* Neutral Surface Palette (Dark Mode Base) */
  --bg-main: #0B0F19;       /* Deep Cosmos Navy */
  --bg-surface: #111827;    /* Slate/Navy 900 */
  --bg-card: #1F2937;       /* Slate 800 */
  --bg-card-hover: #283548; /* Highlight hover */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: #6366F1;

  /* Typography Colors */
  --text-primary: #F9FAFB;   /* Highest contrast text */
  --text-secondary: #9CA3AF; /* Meta data, labels */
  --text-muted: #6B7280;     /* Placeholder, disabled */

  /* Financial State Indicators */
  --success: #10B981;        /* Income / Surplus / Safe */
  --success-bg: rgba(16, 185, 129, 0.12);
  --danger: #EF4444;         /* Expense / Over-budget / Deficit */
  --danger-bg: rgba(239, 68, 68, 0.12);
  --warning: #F59E0B;        /* Near-limit / Duplicate Warning */
  --warning-bg: rgba(245, 158, 11, 0.12);
  --info: #3B82F6;           /* Informational notices */
  --info-bg: rgba(59, 130, 246, 0.12);
}
```

### Predefined Category Color Mapping
| Category | Hex Accent | Background Tint | Meaning / Context |
| :--- | :--- | :--- | :--- |
| **Food & Dining** | `#F59E0B` (Amber) | `rgba(245, 158, 11, 0.15)` | Restaurants, delivery, groceries |
| **Hotel & Lodging** | `#8B5CF6` (Purple) | `rgba(139, 92, 246, 0.15)` | Stays, resorts, bookings |
| **Shopping** | `#EC4899` (Pink) | `rgba(236, 72, 153, 0.15)` | E-commerce, apparel, tech gadgets |
| **Transport** | `#06B6D4` (Cyan) | `rgba(6, 182, 212, 0.15)` | Fuel, rideshare, flight, metro |
| **Bills & Utilities** | `#3B82F6` (Blue) | `rgba(59, 130, 246, 0.15)` | Electricity, Wi-Fi, recharge, water |
| **Entertainment** | `#F97316` (Orange) | `rgba(249, 115, 22, 0.15)` | Movies, events, games, streaming |
| **Healthcare** | `#10B981` (Emerald) | `rgba(16, 185, 129, 0.15)` | Pharmacy, consultations, tests |
| **Education** | `#6366F1` (Indigo) | `rgba(99, 102, 241, 0.15)` | Courses, books, tuition |
| **Rent & Housing** | `#14B8A6` (Teal) | `rgba(20, 184, 166, 0.15)` | Apartment lease, maintenance |
| **Salary / Inflow** | `#22C55E` (Green) | `rgba(34, 197, 94, 0.15)` | Monthly pay, freelance, bonuses |
| **Other / Review** | `#6B7280` (Gray) | `rgba(107, 114, 128, 0.15)` | Unclassified / ambiguous items |

---

## 3. Typography Hierarchy

* **Primary Font Family**: `'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Monospace Font** (Numbers / Currency / Codes): `'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace`

| Scale | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display 1** | 36px (2.25rem) | 1.2 | 700 (Bold) | Landing page hero, Net worth highlight |
| **Heading 1** | 28px (1.75rem) | 1.25 | 700 (Bold) | Page titles (Dashboard, Expenses, Analytics) |
| **Heading 2** | 22px (1.375rem) | 1.3 | 600 (Semi-bold) | Section headers, modal titles |
| **Heading 3** | 18px (1.125rem) | 1.4 | 600 (Semi-bold) | Metric card labels, table headers |
| **Body (Normal)**| 15px (0.9375rem) | 1.5 | 400 (Regular) | Transaction descriptions, paragraphs |
| **Body (Medium)**| 15px (0.9375rem) | 1.5 | 500 (Medium) | Table content, form inputs |
| **Caption / Meta**| 13px (0.8125rem) | 1.4 | 500 (Medium) | Timestamps, confidence badges, file sizes |

---

## 4. UI Component Library Specifications

### 4.1 Buttons
* **Primary Button**: Gradient fill (`linear-gradient(135deg, #6366F1, #4F46E5)`), white text, subtle indigo drop shadow (`0 4px 14px rgba(99, 102, 241, 0.39)`), hover brightness scale(1.02).
* **Secondary Button**: Solid `var(--bg-card)`, 1px border `var(--border-subtle)`, text `var(--text-primary)`, hover background `var(--bg-card-hover)`.
* **Success / Approve Button**: `#10B981` background, white text, for bulk approvals and saving transactions.
* **Danger Button**: Crimson outline or subtle red fill (`#EF4444`), for deletions and discarding imported batches.
* **Ghost / Icon Button**: Transparent background, rounded 8px padding, text `var(--text-secondary)`, hover color `var(--text-primary)`.

### 4.2 Metric Stat Cards
```text
+-------------------------------------------------------------+
|  TOTAL EXPENSES                                [ Icon: 💸 ] |
|  ₹24,500.00                                                 |
|  [↓ 8.4% vs last month]       61.2% of monthly income       |
+-------------------------------------------------------------+
```
* Container: 16px padding, 12px border radius, 1px solid `rgba(255, 255, 255, 0.08)`, smooth dark gradient background (`linear-gradient(180deg, #1F2937, #111827)`).

### 4.3 Data Table
* **Header**: Sticky top, uppercase 12px font, text `var(--text-secondary)`, letter-spacing 0.05em, subtle bottom border.
* **Rows**: Hover highlight (`rgba(255, 255, 255, 0.03)`), height 54px, vertical center alignment.
* **Action Cells**: Inline icon buttons (pencil for quick edit, trash for delete).
* **Duplicate Alert Cell**: Highlighted row background (`rgba(245, 158, 11, 0.07)`), warning icon, with quick "Skip" and "Keep" toggles.

### 4.4 Drag-and-Drop Dropzone
* **Dimensions**: Min height 240px, dashed 2px border (`var(--primary-500)` when hovering / dragging file, `rgba(255,255,255,0.15)` idle).
* **Feedback**: Pulse animation when file is dragged over.
* **Progress Bar**: Gradient bar (`#6366F1` to `#06B6D4`) with percentage indicator and phase label ("Extracting text from PDF...", "Gemini AI categorizing...").

### 4.5 AI Insights Card
* Distinct glowing border (`1px solid rgba(168, 85, 247, 0.4)`), soft purple ambient glow (`box-shadow: 0 0 25px rgba(168, 85, 247, 0.1)`).
* Gemini AI sparkle icon badge in upper corner.

---

## 5. Responsive Grid & Breakpoints

| Device Category | Breakpoint Range | Navigation Pattern | Layout Columns |
| :--- | :--- | :--- | :--- |
| **Mobile** | `< 640px` | Bottom Navigation Bar / Hamburger Sheet | 1 Column Stacked |
| **Tablet** | `640px - 1024px` | Collapsible Compact Icon Sidebar | 2 Columns Grid |
| **Desktop / Laptop**| `1024px - 1440px` | Full Sidebar (240px width) | 3-4 Columns Grid |
| **Ultrawide** | `> 1440px` | Full Sidebar + Max Container 1400px | 4 Columns Balanced |

---

## 6. Accessibility & Motion Standards

* **Focus Indicators**: All focusable interactive elements feature a 2px offset ring (`outline: 2px solid #6366F1; outline-offset: 2px`).
* **Motion Preferences**: Respect `prefers-reduced-motion: reduce` by disabling smooth layout transforms.
* **Currency Display**: Always format numbers with standard locale separator (`en-IN` format: `₹40,000.00`) and standard ISO currency sign.
