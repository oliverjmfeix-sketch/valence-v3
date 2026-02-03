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
import type { OntologyQuestion, RPProvision, ConceptApplicability } from '@/types';
import { getAnswerForQuestion } from '@/hooks/useRPProvision';

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  questions: OntologyQuestion[];
  provision: RPProvision | undefined;
  defaultOpen?: boolean;
  className?: string;
}

export function CategorySection({
  categoryId,
  categoryName,
  categoryCode,
  questions,
  provision,
  defaultOpen = true,
  className,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Count answered questions
  const answeredCount = questions.filter((q) => {
    const { hasAnswer } = getAnswerForQuestion(provision, q);
    return hasAnswer;
  }).length;

  return (
    <div className={cn('rounded-lg border bg-card', className)} id={`category-${categoryId}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Simplified header */}
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
              {answeredCount}/{questions.length}
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
            {questions.map((question, index) => {
              const { value } = getAnswerForQuestion(provision, question);
              
              // Render based on answer type
              return (
                <div 
                  key={question.question_id} 
                  className={cn(
                    "px-4",
                    index % 2 === 1 && "bg-muted/30"
                  )}
                >
                  {(() => {
                    switch (question.answer_type) {
                      case 'boolean':
                        return (
                          <BooleanAnswer
                            questionText={question.question_text}
                            value={value as boolean | undefined}
                          />
                        );
                      case 'currency':
                        return (
                          <CurrencyAnswer
                            questionText={question.question_text}
                            value={value as number | undefined}
                          />
                        );
                      case 'percentage':
                        return (
                          <PercentageAnswer
                            questionText={question.question_text}
                            value={value as number | undefined}
                          />
                        );
                      case 'number':
                        return (
                          <CurrencyAnswer
                            questionText={question.question_text}
                            value={value as number | undefined}
                          />
                        );
                      case 'multiselect':
                        return (
                          <MultiselectAnswer
                            questionText={question.question_text}
                            concepts={(value as ConceptApplicability[]) || []}
                          />
                        );
                      default:
                        return (
                          <div className="py-3">
                            <p className="text-sm">{question.question_text}</p>
                            <p className="text-sm text-muted-foreground">
                              {value !== undefined ? String(value) : 'Not found'}
                            </p>
                          </div>
                        );
                    }
                  })()}
                </div>
              );
            })}
          </div>
          
          {/* Empty state for no questions */}
          {questions.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No questions in this category
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
