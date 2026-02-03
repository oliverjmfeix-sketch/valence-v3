import { Loader2, Trash2 } from "lucide-react";

import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Deal, DealStatus } from "@/types";

interface DealRowActionsProps {
  deal: Deal;
  statusValue?: DealStatus["status"];
  isDeleting: boolean;
  onDelete: (deal: Deal, status?: DealStatus["status"]) => void;
}

export function DealRowActions({ deal, statusValue, isDeleting, onDelete }: DealRowActionsProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent Card navigation
    e.stopPropagation();
    e.preventDefault();
    
    if (import.meta.env.DEV) {
      console.log("Delete clicked for deal:", deal.deal_id, "status:", statusValue);
    }
    onDelete(deal, statusValue);
  };

  return (
    <div
      className="flex items-center gap-1 shrink-0"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <DealStatusBadge status={statusValue ?? "pending"} animate={false} />

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            aria-label="Delete deal"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete deal</TooltipContent>
      </Tooltip>
    </div>
  );
}
