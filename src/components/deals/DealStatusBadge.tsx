import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DealStatus } from '@/types';

interface DealStatusBadgeProps {
  status: DealStatus['status'];
  className?: string;
  showLabel?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-[hsl(var(--status-pending))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--status-pending))]/90',
  },
  extracting: {
    label: 'Extracting',
    icon: Loader2,
    className: 'bg-[hsl(var(--status-extracting))] text-white hover:bg-[hsl(var(--status-extracting))]/90',
    iconClassName: 'animate-spin',
  },
  storing: {
    label: 'Storing',
    icon: Loader2,
    className: 'bg-[hsl(var(--status-extracting))] text-white hover:bg-[hsl(var(--status-extracting))]/90',
    iconClassName: 'animate-spin',
  },
  complete: {
    label: 'Complete',
    icon: CheckCircle2,
    className: 'bg-[hsl(var(--status-complete))] text-white hover:bg-[hsl(var(--status-complete))]/90',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    className: 'bg-[hsl(var(--status-error))] text-white hover:bg-[hsl(var(--status-error))]/90',
  },
};

export function DealStatusBadge({ status, className, showLabel = true }: DealStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  const iconClassName = 'iconClassName' in config ? config.iconClassName : undefined;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        'gap-1.5 font-medium',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', iconClassName)} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}
