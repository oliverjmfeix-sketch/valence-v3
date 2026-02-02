

# Valence v2 - Legal Document Analysis Platform (Frontend Only)

## Overview
A React frontend for legal document analysis that connects to an external backend API. The UI handles 471+ ontology questions with search, filtering, and virtualized scrolling.

---

## Frontend Components

### 1. Application Shell
- Clean header with "Valence" branding
- Navigation: Deals, Upload
- Light theme with professional legal/financial aesthetic
- Backend API URL configured via environment variable (`VITE_API_URL`)

### 2. Deal Upload Page
- Drag-and-drop PDF upload zone
- Progress states: Uploading → Extracting → Complete
- Error handling with clear user messages
- Auto-redirect to deal detail on success

### 3. Deals List Page
- Clean table view: Deal Name, Borrower, Upload Date
- Click row to navigate to deal detail
- Search/filter by deal name
- Empty state for no deals

### 4. Deal Detail Page with Ontology Browser
- Header showing deal name and borrower
- **Category Tabs**: MFN Provisions (42 questions), Restricted Payments (429 questions), Pattern Detection
- **Within each category**:
  - Search box to filter questions
  - Virtualized scrolling list for performance with hundreds of items
  - Collapsible sub-categories where applicable
- **Each question row displays**:
  - Question text
  - Typed answer: ✓/✗ for boolean, number, string, or "Not found"
  - "Source" button to view provenance

### 5. Provenance Panel
- Slide-out sheet when clicking "Source" button
- Displays: Source text (exact quote), Page number, Section reference
- Confidence indicator
- Clean, readable typography for legal text

### 6. Q&A Interface
- Chat-style input on deal detail page
- Example questions shown as placeholder hints
- Displays answer with supporting evidence
- Shows which primitives were used to answer

---

## API Contract (What Your Backend Should Implement)

The frontend expects these endpoints:

```
POST /api/deals/upload          → Upload PDF, returns { deal_id, status }
GET  /api/deals                 → Returns [{ id, name, borrower, upload_date }]
GET  /api/deals/{id}            → Returns { id, name, borrower, upload_date }
GET  /api/ontology/questions    → Returns [{ id, text, category, subcategory, target_attribute, answer_type }]
GET  /api/deals/{id}/answers    → Returns [{ question_id, answer, has_provenance }]
GET  /api/deals/{id}/provenance/{attribute} → Returns { source_text, page_number, section, confidence }
POST /api/deals/{id}/qa         → Body: { question } → Returns { answer, evidence: [] }
```

---

## Technical Implementation

### State Management
- TanStack Query for API data fetching and caching
- React state for UI interactions (search, filters, active tab)

### Performance for 471+ Questions
- React-window or similar for virtualized list rendering
- Debounced search input
- Lazy loading of provenance data

### Components Structure
```
src/
├── pages/
│   ├── DealsPage.tsx
│   ├── DealDetailPage.tsx
│   └── UploadPage.tsx
├── components/
│   ├── OntologyBrowser/
│   │   ├── CategoryTabs.tsx
│   │   ├── QuestionList.tsx (virtualized)
│   │   ├── QuestionRow.tsx
│   │   └── SearchFilter.tsx
│   ├── ProvenancePanel.tsx
│   ├── QAInterface.tsx
│   └── UploadDropzone.tsx
├── api/
│   └── client.ts (API functions)
└── types/
    └── index.ts (TypeScript interfaces)
```

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Deals List | View all uploaded deals |
| `/upload` | Upload | Upload new PDF |
| `/deals/:id` | Deal Detail | Ontology browser + Q&A |

---

## Success Criteria

✅ Clean, professional UI suitable for legal/financial use  
✅ Handles 471+ questions with smooth scrolling and search  
✅ Clear provenance display for any extracted answer  
✅ Q&A interface ready to connect to backend  
✅ Fully typed API client ready for backend integration

