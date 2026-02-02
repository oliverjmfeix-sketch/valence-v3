import { List } from 'react-window';
import { QuestionRow } from './QuestionRow';
import type { OntologyQuestion, DealAnswer } from '@/types';

interface QuestionListProps {
  questions: OntologyQuestion[];
  answers: Map<string, DealAnswer>;
  onViewProvenance: (attribute: string) => void;
  height: number;
}

const ITEM_HEIGHT = 64;

interface RowProps {
  questions: OntologyQuestion[];
  answers: Map<string, DealAnswer>;
  onViewProvenance: (attribute: string) => void;
}

function Row({ 
  index, 
  style, 
  questions, 
  answers, 
  onViewProvenance 
}: { 
  index: number; 
  style: React.CSSProperties;
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
} & RowProps) {
  const question = questions[index];
  const answer = answers.get(question.id);

  return (
    <QuestionRow
      question={question}
      answer={answer}
      onViewProvenance={onViewProvenance}
      style={style}
    />
  );
}

export function QuestionList({ questions, answers, onViewProvenance, height }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No questions match your search
      </div>
    );
  }

  return (
    <List<RowProps>
      rowCount={questions.length}
      rowHeight={ITEM_HEIGHT}
      rowComponent={Row}
      rowProps={{ questions, answers, onViewProvenance }}
      style={{ height }}
      className="scrollbar-thin"
    />
  );
}
