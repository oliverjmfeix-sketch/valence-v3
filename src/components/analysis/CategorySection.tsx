import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className={cn('', className)} id={`category-${categoryId}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-semibold">
                {categoryCode}
              </span>
              <CardTitle className="text-base">{categoryName}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {answeredCount}/{questions.length}
              </Badge>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="divide-y">
              {questions.map((question) => {
                const { value } = getAnswerForQuestion(provision, question);
                
                // Render based on answer type
                switch (question.answer_type) {
                  case 'boolean':
                    return (
                      <BooleanAnswer
                        key={question.question_id}
                        questionText={question.question_text}
                        value={value as boolean | undefined}
                      />
                    );
                  case 'currency':
                    return (
                      <CurrencyAnswer
                        key={question.question_id}
                        questionText={question.question_text}
                        value={value as number | undefined}
                      />
                    );
                  case 'percentage':
                    return (
                      <PercentageAnswer
                        key={question.question_id}
                        questionText={question.question_text}
                        value={value as number | undefined}
                      />
                    );
                  case 'number':
                    return (
                      <CurrencyAnswer
                        key={question.question_id}
                        questionText={question.question_text}
                        value={value as number | undefined}
                      />
                    );
                  case 'multiselect':
                    return (
                      <MultiselectAnswer
                        key={question.question_id}
                        questionText={question.question_text}
                        concepts={(value as ConceptApplicability[]) || []}
                      />
                    );
                  default:
                    return (
                      <div key={question.question_id} className="py-3">
                        <p className="text-sm">{question.question_text}</p>
                        <p className="text-sm text-muted-foreground">
                          {value !== undefined ? String(value) : 'Not found'}
                        </p>
                      </div>
                    );
                }
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
