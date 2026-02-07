

# CarboAI - Carbon Credit Pre-Audit System

## Overview
A professional, Apple-inspired web application that helps carbon credit project developers pre-audit their Project Design Documents (PDDs) and calculation spreadsheets against the JCM methodology standards before official verification.

---

## Design Philosophy
- **Minimalist & Premium**: White backgrounds, soft shadows, generous whitespace
- **Apple/Notion/Stripe inspired**: Clean typography, subtle animations, professional feel
- **Clear visual hierarchy**: Issues displayed with color-coded severity (red for major, yellow for minor, green for compliant)

---

## Pages & User Flow

### 1. **Home Page** (`/`)
- Centered CarboAI logo with subtle entrance animation
- Typing effect text: "Making carbon crediting accessible"
- Navigation bar with:
  - "Evaluate PDD" → Upload page
  - "Reports" → Past reports (requires login)
  - Login/Signup button

### 2. **Authentication** (`/auth`)
- Clean login/signup forms
- Email & password authentication
- Smooth transitions between login and signup states

### 3. **Upload & Audit Page** (`/evaluate`)
- Large drag-and-drop upload area with cloud icon
- Instructions: "Upload PDD (PDF) and Calculation Spreadsheet (XLSX)"
- File type indicators showing what's been uploaded
- "Run Pre-Audit" button (disabled until both files uploaded)
- Loading state with progress indicator during analysis

### 4. **Audit Results Page** (`/results/:id`)
- Pre-Audit Report header with timestamp
- Summary card showing issue count by severity
- Expandable issue cards organized by category:
  - **Calculation Accuracy** (emission formulas, GWP values)
  - **Parameter Compliance** (scaling factors, emission factors)
  - **Eligibility Criteria** (water management, drainage requirements)
- Each issue shows:
  - Severity badge (Major/Minor)
  - Issue title
  - Section/location in document
  - Description of the problem
  - Suggested fix
- Export report as PDF option

### 5. **Reports Dashboard** (`/reports`)
- List of past audit reports
- Date, project name, issue count summary
- Click to view full report details
- Search and filter options

---

## Backend Logic (Supabase Edge Functions)

### Document Processing Service
- Edge function to receive uploaded files
- Integration with Azure Form Recognizer or AWS Textract for:
  - PDF text extraction (PDD documents)
  - Excel data extraction (calculation spreadsheets)
- Extract key values: emission totals, scaling factors, areas, methodology parameters

### Validation Engine
The system will validate against the JCM_PH_AM004 methodology:

**Calculation Checks:**
- Verify CH₄ emission calculations match formula: `RECH4,s = Σ(EFCH4,R,s,st × As,st × 10⁻³ × GWP_CH4)`
- Verify N₂O calculations with correct emission factors
- Check GWP values used (CH₄ = 28, N₂O = 265)

**Parameter Compliance:**
- Scaling factors: SFp (pre-season water regime), SFw (cultivation water regime)
- Organic amendment conversion factors (CFOA)
- Emission factors for dry/wet seasons (1.46 / 2.95 kgCH₄/ha/day)
- Uncertainty deduction values (0.05-0.15)

**Eligibility Criteria:**
- Water regime change documentation (continuous → single/multiple drainage)
- Drainage depth requirements (-15cm below soil surface)
- Measurement frequency compliance (weekly, yearly intervals)
- Stratum classification requirements

### Report Generation
- Store parsed data and validation results
- Generate structured JSON report
- Save to database linked to user account

---

## Database Schema (Supabase)

### Tables:
1. **profiles** - User profile data
2. **audit_reports** - Report metadata (date, status, summary)
3. **audit_issues** - Individual issues linked to reports
4. **user_roles** - Role management for future admin features

### Storage:
- Bucket for temporary file storage during processing
- Reports stored as structured data (not file-based)

---

## Key Features Summary

| Feature | Description |
|---------|-------------|
| **Document Upload** | Drag-and-drop for PDD (PDF) and calculation files (XLSX) |
| **AI-Powered Extraction** | External service integration for document parsing |
| **JCM Validation** | Full methodology compliance checking |
| **Issue Classification** | Major/Minor severity with actionable suggestions |
| **User Accounts** | Login, save reports, view history |
| **Premium Design** | Apple-inspired, professional, accessible |

---

## Technical Implementation

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase Edge Functions (TypeScript/Deno)
- **Auth**: Supabase Authentication
- **Database**: Supabase PostgreSQL
- **Document Processing**: Azure Form Recognizer or AWS Textract integration (requires API key)
- **File Storage**: Supabase Storage for temporary uploads

