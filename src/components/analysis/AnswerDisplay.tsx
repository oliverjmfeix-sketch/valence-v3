import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AnswerDisplayProps {
  answer: string;
  isLoading: boolean;
  onCitationClick?: (page: number) => void;
}

/** Parse inline formatting: **bold**, [p.XX] citations */
function parseInline(text: string, onCitationClick?: (page: number) => void): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const citationMatch = remaining.match(/\[p\.(\d+)(?:-\d+)?\]/);

    if (boldMatch && (!citationMatch || boldMatch.index! < citationMatch.index!)) {
      if (boldMatch.index! > 0) parts.push(remaining.slice(0, boldMatch.index));
      parts.push(<strong key={`b-${keyIndex++}`} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
    } else if (citationMatch) {
      if (citationMatch.index! > 0) parts.push(remaining.slice(0, citationMatch.index));
      const pageNum = parseInt(citationMatch[1], 10);
      parts.push(
        <button
          key={`c-${keyIndex++}`}
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
      parts.push(remaining);
      break;
    }
  }
  return parts;
}

/** Parse a markdown table block (array of lines starting with |) */
function parseTable(lines: string[], startKey: number, onCitationClick?: (page: number) => void): React.ReactNode {
  // Filter out separator rows (e.g. |---|---|)
  const dataRows = lines.filter(l => !l.match(/^\|[\s\-:|]+\|$/));
  if (dataRows.length === 0) return null;

  const parseRow = (line: string) =>
    line.split('|').slice(1, -1).map(cell => cell.trim());

  const headerCells = parseRow(dataRows[0]);
  const bodyRows = dataRows.slice(1).map(parseRow);

  return (
    <div key={`table-${startKey}`} className="my-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headerCells.map((cell, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">
                {parseInline(cell, onCitationClick)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-muted-foreground">
                  {parseInline(cell, onCitationClick)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function parseAnswer(answer: string, onCitationClick?: (page: number) => void): React.ReactNode[] {
  const lines = answer.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line → spacer
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="my-4 border-border" />);
      i++;
      continue;
    }

    // Markdown headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const Tag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
      const sizes: Record<number, string> = {
        1: 'text-lg font-bold mt-5 mb-2',
        2: 'text-base font-bold mt-4 mb-1.5',
        3: 'text-sm font-semibold mt-3 mb-1 uppercase tracking-wide text-muted-foreground',
        4: 'text-sm font-semibold mt-2 mb-1',
      };
      elements.push(
        <Tag key={i} className={cn(sizes[level] || sizes[4], 'text-foreground')}>
          {parseInline(text, onCitationClick)}
        </Tag>
      );
      i++;
      continue;
    }

    // Blockquote (collect consecutive > lines)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-2 pl-3 border-l-2 border-primary/30 text-sm italic text-muted-foreground leading-relaxed"
        >
          {quoteLines.map((ql, qi) => (
            <span key={qi}>
              {parseInline(ql, onCitationClick)}
              {qi < quoteLines.length - 1 && <br />}
            </span>
          ))}
        </blockquote>
      );
      continue;
    }

    // Table block (collect consecutive | lines)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const tableEl = parseTable(tableLines, i, onCitationClick);
        if (tableEl) elements.push(tableEl);
        continue;
      }
      // Fallback: treat as normal lines
      i -= tableLines.length;
    }

    // Bullet points
    const bulletMatch = trimmed.match(/^([-•✓⚠])\s+(.*)$/);
    if (bulletMatch) {
      const bulletChar = bulletMatch[1];
      const bulletContent = bulletMatch[2];
      const bulletStyle = bulletChar === '✓'
        ? 'text-teal-600'
        : bulletChar === '⚠'
        ? 'text-amber-600'
        : 'text-muted-foreground';
      elements.push(
        <div key={i} className="flex items-start gap-2 py-0.5 pl-1">
          <span className={cn("flex-shrink-0 w-4 text-center", bulletStyle)}>{bulletChar}</span>
          <span className="flex-1">{parseInline(bulletContent, onCitationClick)}</span>
        </div>
      );
      i++;
      continue;
    }

    // Regular paragraph
    const isHeading = /^[A-Z][^.]*:$/.test(trimmed);
    elements.push(
      <p key={i} className={cn("py-0.5", isHeading && "font-semibold text-foreground mt-2")}>
        {parseInline(trimmed, onCitationClick)}
      </p>
    );
    i++;
  }

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

  if (!answer) return null;

  return (
    <div className="prose prose-sm max-w-none text-foreground leading-relaxed animate-in fade-in duration-300">
      {parsedContent}
    </div>
  );
}
