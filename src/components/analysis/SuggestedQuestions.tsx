import { cn } from '@/lib/utils';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
  mfnExtracted?: boolean;
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

const MFN_QUESTIONS = [
  { label: "MFN strength", question: "How strong is the MFN protection in this deal?" },
  { label: "MFN loopholes", question: "What loopholes exist in the MFN provision?" },
  { label: "MFN reclassification", question: "Can the borrower avoid MFN through reclassification?" },
  { label: "MFN yield components", question: "What yield components are included in the MFN calculation?" },
];

export function SuggestedQuestions({ onSelect, disabled, mfnExtracted }: SuggestedQuestionsProps) {
  const questions = mfnExtracted ? [...SUGGESTED_QUESTIONS, ...MFN_QUESTIONS] : SUGGESTED_QUESTIONS;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((item) => (
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
