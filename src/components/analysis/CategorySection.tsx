import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { BooleanAnswer } from './BooleanAnswer';
import { CurrencyAnswer } from './CurrencyAnswer';
import { PercentageAnswer } from './PercentageAnswer';
import { MultiselectAnswer } from './MultiselectAnswer';
import { cn } from '@/lib/utils';
import type { ExtractedAnswer } from '@/types';
import type { ConceptApplicability } from '@/types/mfn.generated';

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  answers: ExtractedAnswer[];
  defaultOpen?: boolean;
  className?: string;
}

export function CategorySection({
  categoryId,
  categoryName,
  categoryCode,
  answers,
  defaultOpen = true,
  className,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Count answered questions
  const answeredCount = answers.filter(a => a.value !== null && a.value !== undefined).length;

  return (
    <div className={cn('rounded-lg border bg-card', className)} id={`category-${categoryId}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-semibold">
              {categoryCode}
            </span>
            <span className="font-medium text-sm">{categoryName}</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                answeredCount === 0 && "opacity-50"
              )}
            >
              {answeredCount}/{answers.length}
            </Badge>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="divide-y divide-border">
            {answers.map((answer, index) => (
              <div 
                key={answer.question_id} 
                className={cn(
                  "px-4",
                  index % 2 === 1 && "bg-muted/30"
                )}
              >
                {(() => {
                  switch (answer.answer_type) {
                    case 'boolean':
                      return (
                        <BooleanAnswer
                          questionText={answer.question_text}
                          value={answer.value as boolean | undefined}
                          sourceText={answer.source_text ?? undefined}
                          sourcePage={answer.source_page ?? undefined}
                        />
                      );
                    case 'currency':
                      return (
                        <CurrencyAnswer
                          questionText={answer.question_text}
                          value={answer.value as number | undefined}
                          sourceText={answer.source_text ?? undefined}
                          sourcePage={answer.source_page ?? undefined}
                        />
                      );
                    case 'percentage':
                      return (
                        <PercentageAnswer
                          questionText={answer.question_text}
                          value={answer.value as number | undefined}
                          sourceText={answer.source_text ?? undefined}
                          sourcePage={answer.source_page ?? undefined}
                        />
                      );
                    case 'number':
                      return (
                        <CurrencyAnswer
                          questionText={answer.question_text}
                          value={answer.value as number | undefined}
                          sourceText={answer.source_text ?? undefined}
                          sourcePage={answer.source_page ?? undefined}
                        />
                      );
                    case 'multiselect':
                      return (
                        <MultiselectAnswer
                          questionText={answer.question_text}
                          concepts={(answer.value as ConceptApplicability[]) || []}
                        />
                      );
                    default:
                      return (
                        <div className="py-3">
                          <p className="text-sm">{answer.question_text}</p>
                          <p className="text-sm text-muted-foreground">
                            {answer.value !== undefined && answer.value !== null ? String(answer.value) : 'Not found'}
                          </p>
                        </div>
                      );
                  }
                })()}
              </div>
            ))}
          </div>
          
          {answers.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No questions in this category
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
