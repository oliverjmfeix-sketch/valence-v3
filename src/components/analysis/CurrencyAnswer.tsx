import { DollarSign, Minus } from 'lucide-react';
import { SourceCitation } from './SourceCitation';
import { cn } from '@/lib/utils';

interface CurrencyAnswerProps {
  questionText: string;
  value: number | undefined | null;
  sourceText?: string;
  sourcePage?: number;
  className?: string;
}

// Format large currency values with appropriate suffixes
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Full format for tooltips
function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CurrencyAnswer({ 
  questionText, 
  value, 
  sourceText, 
  sourcePage,
  className 
}: CurrencyAnswerProps) {
  const hasAnswer = value !== undefined && value !== null;

  return (
    <div className={cn('flex items-start justify-between gap-4 py-3', className)}>
      <p className="text-sm text-foreground flex-1">{questionText}</p>
      
      <div className="flex items-center gap-3 shrink-0">
        {!hasAnswer ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Minus className="h-4 w-4" />
            <span className="text-sm">Not found</span>
          </span>
        ) : (
          <span 
            className="text-sm font-semibold font-mono text-foreground"
            title={formatCurrencyFull(value)}
          >
            {formatCurrency(value)}
          </span>
        )}
        
        {sourceText && sourcePage && (
          <SourceCitation text={sourceText} page={sourcePage} />
        )}
      </div>
    </div>
  );
}

// Compact version for tables/lists
export function CurrencyAnswerCompact({ value }: { value: number | undefined | null }) {
  if (value === undefined || value === null) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  
  return (
    <span 
      className="text-sm font-semibold font-mono"
      title={formatCurrencyFull(value)}
    >
      {formatCurrency(value)}
    </span>
  );
}
