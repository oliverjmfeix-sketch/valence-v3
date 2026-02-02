

# Update Upload Flow to Match Backend API Contract

## Summary
Update the frontend upload flow to match the backend API requirements, including form fields for deal metadata and real-time status polling.

---

## What's Changing

### Current State
- Upload only sends the PDF file
- No deal name or borrower fields
- Simulates extraction progress with timeouts
- Response type doesn't match backend

### New State  
- Upload form collects deal name and borrower
- Sends `file`, `deal_name`, and `borrower` via multipart/form-data
- Polls status endpoint every 20 seconds for real extraction progress
- Updated response types to match backend exactly

---

## Type Definitions

**UploadResponse** (from POST /upload):
```text
{
  deal_id: string
  deal_name: string
  status: "processing"        // Always "processing" on success
  message: string
}
```

**DealStatus** (from GET /{id}/status):
```text
{
  deal_id: string
  status: "pending" | "extracting" | "storing" | "complete" | "error"
  progress: number            // 0-100
  current_step: string | null
  error: string | null
}
```

---

## Changes Required

### 1. Update Types (`src/types/index.ts`)
- Update `UploadResponse` with `deal_name`, fixed `status: "processing"`, and `message`
- Add new `DealStatus` type with the full status enum

### 2. Update API Client (`src/api/client.ts`)
- Modify `uploadDeal` to accept `file`, `dealName`, and `borrower` parameters
- Append `deal_name` and `borrower` fields to FormData
- Add new `getDealStatus(dealId: string)` function for polling

### 3. Update Upload Page (`src/pages/UploadPage.tsx`)
- Add form fields for deal name and borrower (required inputs)
- Pass metadata to upload function
- Implement 20-second polling after successful upload
- Update UI based on real `progress` and `current_step` values
- Handle completion (redirect) and error states

### 4. Update UploadDropzone (`src/components/UploadDropzone.tsx`)
- Accept `progress` and `currentStep` as props for dynamic display
- Show real progress percentage from polling
- Display current step message from backend

---

## UI Flow After Changes

1. User enters deal name and borrower in form fields
2. User drops or selects PDF file
3. Frontend uploads file + metadata to backend
4. Shows "Uploading..." with spinner
5. On success (status: "processing"), begins polling every 20 seconds
6. Progress bar updates based on real `progress` value (0-100)
7. Shows `current_step` message when available
8. On status "complete", redirects to deal detail page
9. On status "error", displays the error message from backend

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Update `UploadResponse`, add `DealStatus` type |
| `src/api/client.ts` | Update `uploadDeal` params, add `getDealStatus` |
| `src/pages/UploadPage.tsx` | Add form fields, implement 20-second polling |
| `src/components/UploadDropzone.tsx` | Accept progress/step props for dynamic display |

