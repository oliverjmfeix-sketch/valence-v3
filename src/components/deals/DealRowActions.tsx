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
  onDelete: (deal: Deal, status?: DealStatus["status"]) => void;
}

export function DealRowActions({ deal, isDeleting, onDelete }: DealRowActionsProps) {
  // One-time fetch with long cache - NO POLLING on list page to prevent freezes
  const { data: status } = useQuery<DealStatus>({
    queryKey: ["deal-status", deal.deal_id],
    queryFn: () => getDealStatus(deal.deal_id),
    staleTime: 60000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const statusValue = status?.status;

  const handleDeleteClick = () => {
    if (import.meta.env.DEV) {
      console.log("Delete clicked for deal:", deal.deal_id, "status:", statusValue);
    }
    onDelete(deal, statusValue);
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <DealStatusBadge status={statusValue ?? "pending"} animate={false} />

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
          </span>
        </TooltipTrigger>
        <TooltipContent>Delete deal</TooltipContent>
      </Tooltip>
    </div>
  );
}
