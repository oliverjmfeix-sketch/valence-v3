import { Percent, Minus } from 'lucide-react';
import { SourceCitation } from './SourceCitation';
import { cn } from '@/lib/utils';

interface PercentageAnswerProps {
  questionText: string;
  value: number | undefined | null;
  sourceText?: string;
  sourcePage?: number;
  className?: string;
}

// Format percentage - if value is already a decimal (0-1), multiply by 100
function formatPercentage(value: number): string {
  // If value is between 0 and 1, it's likely a decimal percentage
  const displayValue = value <= 1 && value > 0 ? value * 100 : value;
  return `${displayValue.toFixed(0)}%`;
}

export function PercentageAnswer({ 
  questionText, 
  value, 
  sourceText, 
  sourcePage,
  className 
}: PercentageAnswerProps) {
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
          <span className="text-sm font-semibold font-mono text-foreground">
            {formatPercentage(value)}
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
export function PercentageAnswerCompact({ value }: { value: number | undefined | null }) {
  if (value === undefined || value === null) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  
  return (
    <span className="text-sm font-semibold font-mono">
      {formatPercentage(value)}
    </span>
  );
}
