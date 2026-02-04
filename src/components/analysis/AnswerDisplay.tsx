import { useMemo, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AnswerDisplayProps {
  answer: string;
  isLoading: boolean;
  onCitationClick?: (page: number) => void;
}

// Parse markdown-like content into React elements
function parseAnswer(answer: string, onCitationClick?: (page: number) => void): React.ReactNode[] {
  const lines = answer.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (!line.trim()) {
      elements.push(<div key={lineIndex} className="h-2" />);
      return;
    }

    // Check for bullet points
    const bulletMatch = line.match(/^(\s*)([-•✓⚠])\s+(.*)$/);
    const isBullet = !!bulletMatch;
    const bulletChar = bulletMatch?.[2];
    const bulletContent = bulletMatch?.[3] || line;

    // Parse inline formatting
    const parseLine = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let keyIndex = 0;

      while (remaining) {
        // Check for bold
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        // Check for citation [p.XX] or [p.XX-YY]
        const citationMatch = remaining.match(/\[p\.(\d+)(?:-\d+)?\]/);

        if (boldMatch && (!citationMatch || boldMatch.index! < citationMatch.index!)) {
          // Add text before bold
          if (boldMatch.index! > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          // Add bold text
          parts.push(
            <strong key={`bold-${keyIndex++}`} className="font-semibold">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
        } else if (citationMatch) {
          // Add text before citation
          if (citationMatch.index! > 0) {
            parts.push(remaining.slice(0, citationMatch.index));
          }
          // Add citation badge
          const pageNum = parseInt(citationMatch[1], 10);
          parts.push(
            <button
              key={`citation-${keyIndex++}`}
              onClick={() => onCitationClick?.(pageNum)}
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 mx-0.5",
                "text-xs font-medium rounded",
                "bg-primary/10 text-primary hover:bg-primary/20",
                "transition-colors cursor-pointer"
              )}
            >
              p.{pageNum}
            </button>
          );
          remaining = remaining.slice(citationMatch.index! + citationMatch[0].length);
        } else {
          // No more formatting, add remaining text
          parts.push(remaining);
          break;
        }
      }

      return parts;
    };

    const content = parseLine(bulletContent);

    if (isBullet) {
      const bulletStyle = bulletChar === '✓' 
        ? 'text-teal-600' 
        : bulletChar === '⚠' 
        ? 'text-amber-600' 
        : 'text-muted-foreground';
      
      elements.push(
        <div key={lineIndex} className="flex items-start gap-2 py-0.5">
          <span className={cn("flex-shrink-0 w-5", bulletStyle)}>{bulletChar}</span>
          <span className="flex-1">{content}</span>
        </div>
      );
    } else {
      // Check if it looks like a heading (ends with colon or all caps start)
      const isHeading = /^[A-Z][^.]*:/.test(line) || /^[A-Z\s]+$/.test(line.trim());
      
      elements.push(
        <p 
          key={lineIndex} 
          className={cn(
            "py-0.5",
            isHeading && "font-semibold text-foreground"
          )}
        >
          {content}
        </p>
      );
    }
  });

  return elements;
}

export function AnswerDisplay({ answer, isLoading, onCitationClick }: AnswerDisplayProps) {
  const parsedContent = useMemo(
    () => parseAnswer(answer, onCitationClick),
    [answer, onCitationClick]
  );

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <div className="h-2" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    );
  }

  if (!answer) {
    return null;
  }

  return (
    <div className="prose prose-sm max-w-none text-foreground leading-relaxed animate-in fade-in duration-300">
      {parsedContent}
    </div>
  );
}
