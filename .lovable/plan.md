

# Deal Deletion Functionality Implementation

## Overview
Add the ability to delete deals from the deals list page with a confirmation dialog, proper loading states, and toast notifications for feedback.

---

## Changes Required

### 1. Add Delete API Function

**File: `src/api/client.ts`**

Add a new function to delete deals:

```text
deleteDeal(dealId: string): Promise<void>
  - Method: DELETE
  - Endpoint: /api/deals/{deal_id}
  - Returns: void (or success message)
```

---

### 2. Update DealsPage Component

**File: `src/pages/DealsPage.tsx`**

**New State & Hooks:**
- Add state for delete confirmation modal: `deletingDeal: Deal | null`
- Add `useMutation` from react-query for delete operation
- Import `useToast` for notifications

**Card View Changes:**
Add a delete button to each card:
- Position: Top-right corner of the card, next to status badge
- Icon: Trash2 from lucide-react
- Styling: Ghost button, red on hover
- Tooltip: "Delete deal"
- Click handler: Opens confirmation modal (stops card navigation)

**Table View Changes:**
Add a new "Actions" column:
- Position: Last column (after Status)
- Content: Delete button with same styling as card view
- Click handler: Opens confirmation modal (stops row navigation)

**Confirmation Modal:**
Use AlertDialog component with:
- Title: "Delete Deal?"
- Description: "This will permanently delete {deal_name} and all extracted data. This cannot be undone."
- Cancel button (secondary variant)
- Delete button (destructive variant, shows loading spinner when deleting)

**Delete Logic:**
- On confirm: Call `deleteDeal` mutation
- On success: 
  - Show success toast: "Deal deleted successfully"
  - Invalidate 'deals' query to refetch list
  - Close modal
- On error:
  - Show error toast: "Failed to delete deal: {error_message}"
  - Keep modal open (allow retry)

**Disable Conditions:**
- Disable delete button when status is 'pending', 'extracting', or 'storing'
- Show tooltip explaining why: "Cannot delete while extraction is in progress"

---

## Component Architecture

### DealStatusCell Enhancement
Add ability to return the status value for parent component to check:

```text
Currently: Just renders the badge
Enhancement: Export a hook or pass status back via callback
Alternative: Query status separately in parent for delete button state
```

Recommended approach: Create a small helper that tracks deal statuses for the entire list, allowing the parent to check if a deal can be deleted.

### Delete Button Component (inline or extracted)
For cleaner code, create a small `DealDeleteButton` component:

```text
Props:
- deal: Deal
- status?: DealStatus['status']
- onDelete: (deal: Deal) => void

Renders:
- Tooltip wrapper
- Button with Trash2 icon
- Disabled state based on status
```

---

## UI Flow

```text
User clicks delete icon
        │
        ▼
┌─────────────────────────────────┐
│      Delete Deal?               │
│                                 │
│  This will permanently delete   │
│  "Acme Corp Credit Agreement"   │
│  and all extracted data.        │
│  This cannot be undone.         │
│                                 │
│  [Cancel]         [Delete]      │
└─────────────────────────────────┘
        │
        ├── Cancel → Close modal
        │
        └── Delete → Show loading → API call
                        │
                        ├── Success → Toast + Refresh list
                        │
                        └── Error → Toast + Keep modal open
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/api/client.ts` | Add `deleteDeal` function |
| `src/pages/DealsPage.tsx` | Add delete button, confirmation dialog, mutation, and toast handling |

---

## Implementation Details

### API Function
```text
export async function deleteDeal(dealId: string): Promise<void> {
  await fetchAPI<void>(`/api/deals/${dealId}`, {
    method: 'DELETE',
  });
}
```

### Mutation Setup
```text
const deleteMutation = useMutation({
  mutationFn: (dealId: string) => deleteDeal(dealId),
  onSuccess: () => {
    toast({ title: "Deal deleted successfully" });
    queryClient.invalidateQueries({ queryKey: ['deals'] });
    setDeletingDeal(null);
  },
  onError: (error: Error) => {
    toast({ 
      title: "Failed to delete deal",
      description: error.message,
      variant: "destructive"
    });
  }
});
```

### Delete Button in Card
```text
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 text-muted-foreground hover:text-destructive"
  onClick={(e) => {
    e.stopPropagation();
    setDeletingDeal(deal);
  }}
  disabled={!canDelete}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### Determining if Delete is Allowed
```text
const isProcessing = status === 'pending' || 
                     status === 'extracting' || 
                     status === 'storing';
const canDelete = !isProcessing;
```

---

## Accessibility Considerations

- Delete button has proper aria-label: "Delete deal"
- Tooltip provides context when disabled
- AlertDialog traps focus and is keyboard navigable
- Escape key closes the dialog
- Loading state announced to screen readers

---

## Edge Cases Handled

1. **Click propagation**: `e.stopPropagation()` prevents card/row navigation when clicking delete
2. **Double-click protection**: Button disabled while mutation is pending
3. **Extraction in progress**: Delete button disabled with explanatory tooltip
4. **Network error**: Toast shows error, modal stays open for retry
5. **Optimistic update**: Not used (safer to wait for server confirmation)
6. **Empty list after delete**: Existing empty state already handles this

