import { Loader2, Trash2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDealStatus } from "@/api/client";
import type { Deal, DealStatus } from "@/types";

interface DealRowActionsProps {
  deal: Deal;
  isDeleting: boolean;
  onDelete: (deal: Deal) => void;
}

export function DealRowActions({ deal, isDeleting, onDelete }: DealRowActionsProps) {
  // IMPORTANT: Keep list polling lightweight; fast polling (e.g. every 2s) can freeze slower machines.
  const { data: status } = useQuery<DealStatus>({
    queryKey: ["deal-status", deal.deal_id],
    queryFn: () => getDealStatus(deal.deal_id),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === "pending" || s === "extracting" || s === "storing") return 5000;
      return false;
    },
    refetchIntervalInBackground: true,
  });
  const statusValue = status?.status;

  // Only allow delete when status is explicitly complete or error
  const canDelete = statusValue === "complete" || statusValue === "error";
  const statusKnown = statusValue != null;

  const tooltipText = !statusKnown
    ? "Loading status…"
    : canDelete
      ? "Delete deal"
      : "Cannot delete while extraction is in progress";

  return (
    <div className="flex items-center gap-1 shrink-0">
      <DealStatusBadge status={statusValue ?? "pending"} />

      {/* Wrap trigger so we can stop card/table-row navigation even when the button is disabled */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(deal)}
              disabled={!canDelete || isDeleting}
              aria-label="Delete deal"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </div>
  );
}
