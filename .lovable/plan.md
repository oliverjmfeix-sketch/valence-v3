

# Fix Delete Button Not Working

## Issue Analysis

After reviewing the code, I've identified two potential issues causing the delete button to not work:

### Root Cause 1: Status Callback Called During Render (React Anti-Pattern)

In `DealStatusCell` component (lines 53-55):
```typescript
// Notify parent of status changes
if (onStatusChange && status?.status) {
  onStatusChange(status.status);
}
```

This code runs during render, which is a React anti-pattern. It can cause:
- Infinite re-render loops
- State not being updated properly
- Unpredictable component behavior

### Root Cause 2: Unnecessary Nested TooltipProvider

Each `DealDeleteButton` creates its own `TooltipProvider` (line 73). While this shouldn't break functionality entirely, it can cause unexpected behavior with the existing App-level `TooltipProvider`.

---

## Solution

### Fix 1: Move Status Callback to useEffect

**File: `src/pages/DealsPage.tsx`**

Change the `DealStatusCell` component to properly notify parent using `useEffect`:

```typescript
function DealStatusCell({ dealId, onStatusChange }: { dealId: string; onStatusChange?: (status: string) => void }) {
  const { data: status } = useQuery<DealStatus>({
    queryKey: ['deal-status', dealId],
    queryFn: () => getDealStatus(dealId),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === 'pending' || s === 'extracting' || s === 'storing') {
        return 5000;
      }
      return false;
    },
  });

  // Use useEffect to notify parent of status changes
  useEffect(() => {
    if (onStatusChange && status?.status) {
      onStatusChange(status.status);
    }
  }, [status?.status, onStatusChange]);

  return <DealStatusBadge status={status?.status || 'pending'} />;
}
```

### Fix 2: Remove Nested TooltipProvider

**File: `src/pages/DealsPage.tsx`**

Remove the `TooltipProvider` wrapper from `DealDeleteButton` since there's already one at the App level:

```typescript
function DealDeleteButton({ 
  deal, 
  canDelete, 
  isDeleting,
  onDelete 
}: { 
  deal: Deal; 
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (deal: Deal) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(deal);
          }}
          disabled={!canDelete || isDeleting}
          aria-label="Delete deal"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {!canDelete 
          ? "Cannot delete while extraction is in progress" 
          : "Delete deal"
        }
      </TooltipContent>
    </Tooltip>
  );
}
```

### Fix 3: Add Import for useEffect

Add `useEffect` to the imports at the top of the file:

```typescript
import { useState, useEffect } from 'react';
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/DealsPage.tsx` | Add useEffect import, fix DealStatusCell callback, remove nested TooltipProvider |

---

## Summary of Changes

1. **Add `useEffect` import** - Required for the status callback fix
2. **Move status notification to useEffect** - Proper React pattern for side effects
3. **Remove `TooltipProvider` wrapper** - Use the existing App-level provider

These changes ensure the status is properly tracked and the click handler on the delete button works correctly.

