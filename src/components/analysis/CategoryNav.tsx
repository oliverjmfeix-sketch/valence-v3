import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category } from '@/types';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export function CategoryNav({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  className 
}: CategoryNavProps) {
  return (
    <ScrollArea className={cn('h-full', className)}>
      <nav className="space-y-1 p-2">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          const completionPct = category.questionCount > 0 
            ? Math.round((category.answeredCount / category.questionCount) * 100)
            : 0;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'w-full flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-secondary text-foreground/80 hover:text-foreground'
              )}
            >
              {/* Category code badge */}
              <span 
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {category.code}
              </span>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium truncate',
                  isActive && 'text-foreground'
                )}>
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {category.answeredCount}/{category.questionCount} answered
                </p>
              </div>

              {/* Completion indicator */}
              {category.answeredCount > 0 && (
                <div className="shrink-0 w-10 h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-accent transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
