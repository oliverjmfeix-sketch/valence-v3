import { ArrowLeft, Building2, FlaskConical } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DealStatusBadge } from '@/components/deals/DealStatusBadge';
import { cn } from '@/lib/utils';

interface AnalysisHeaderProps {
  dealName: string;
  borrower?: string;
  status: 'pending' | 'extracting' | 'storing' | 'complete' | 'error';
  onBack: () => void;
}

const statusBorderColors: Record<string, string> = {
  pending: 'border-t-[hsl(var(--status-pending))]',
  extracting: 'border-t-[hsl(var(--status-extracting))]',
  storing: 'border-t-[hsl(var(--status-extracting))]',
  complete: 'border-t-[hsl(var(--status-complete))]',
  error: 'border-t-[hsl(var(--status-error))]',
};

export function AnalysisHeader({ dealName, borrower, status, onBack }: AnalysisHeaderProps) {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={cn(
      "border-b border-t-4 bg-card px-6 py-4",
      statusBorderColors[status] || 'border-t-transparent'
    )}>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="-ml-2 mb-3" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deals
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{dealName}</h1>
            {borrower && (
              <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
                <Building2 className="h-4 w-4" />
                {borrower}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {status === 'complete' && id && (
              <Link to={`/deals/${id}/eval`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FlaskConical className="h-4 w-4" />
                  Eval
                </Button>
              </Link>
            )}
            <DealStatusBadge status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}
