import { cn } from '@/lib/utils';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  { 
    label: "J.Crew risk", 
    question: "What's the J.Crew risk in this deal? Analyze the blocker provisions and any gaps." 
  },
  { 
    label: "Builder basket", 
    question: "What's the builder basket capacity and how does it build over time?" 
  },
  { 
    label: "Ratio threshold", 
    question: "What's the ratio threshold for unlimited dividends and what conditions apply?" 
  },
  { 
    label: "Mgmt equity cap", 
    question: "What's the management equity repurchase cap and who is covered?" 
  },
  { 
    label: "Unsub risks", 
    question: "What are the Unrestricted Subsidiary risks? How easy is designation?" 
  },
  { 
    label: "Key exceptions", 
    question: "What are the key exceptions and carve-outs I should watch for?" 
  },
  { 
    label: "Dividend summary", 
    question: "Summarize all the dividend restriction baskets and their key terms." 
  },
  { 
    label: "Cross-references", 
    question: "What cross-references between provisions create risk or opportunity?" 
  },
];

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.question)}
            disabled={disabled}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border",
              "bg-muted/50 hover:bg-muted transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
