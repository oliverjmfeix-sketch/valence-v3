import { Check, X, FileText, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OntologyQuestion, DealAnswer } from '@/types';

interface QuestionRowProps {
  question: OntologyQuestion;
  answer?: DealAnswer;
  onViewProvenance: (attribute: string) => void;
  style?: React.CSSProperties;
}

export function QuestionRow({ question, answer, onViewProvenance, style }: QuestionRowProps) {
  const renderAnswer = () => {
    if (!answer || answer.answer === null) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="text-sm">Not found</span>
        </span>
      );
    }

    if (typeof answer.answer === 'boolean') {
      return answer.answer ? (
        <span className="flex items-center gap-1 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Yes</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-destructive">
          <X className="h-4 w-4" />
          <span className="text-sm font-medium">No</span>
        </span>
      );
    }

    return (
      <span className="text-sm font-medium">
        {String(answer.answer)}
      </span>
    );
  };

  return (
    <div 
      style={style}
      className="flex items-center gap-4 border-b px-4 py-3 hover:bg-secondary/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed truncate" title={question.question_text}>
          {question.question_text}
        </p>
        {question.category_name && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {question.category_name}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-24 flex justify-end">
          {renderAnswer()}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewProvenance(question.target_attribute || question.question_id)}
          disabled={!answer?.has_provenance}
          className={cn(
            'h-8 gap-1.5',
            !answer?.has_provenance && 'opacity-50'
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Source
        </Button>
      </div>
    </div>
  );
}
