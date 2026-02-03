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
      <nav className="space-y-1 p-3">
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
                'w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-all',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'hover:bg-secondary/80 text-foreground/80 hover:text-foreground'
              )}
            >
              {/* Category code badge */}
              <span 
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {category.code}
              </span>
              
              <div className="flex-1 min-w-0">
                {/* Category name - allow wrapping */}
                <p className={cn(
                  'text-sm font-medium leading-snug',
                  isActive && 'text-foreground'
                )}>
                  {category.name}
                </p>
                
                {/* Answer count */}
                <p className="text-xs text-muted-foreground mt-1">
                  {category.answeredCount}/{category.questionCount} answered
                </p>
                
                {/* Progress bar - always visible */}
                <div className={cn(
                  'w-full h-1 rounded-full overflow-hidden mt-1.5',
                  isActive ? 'bg-accent-foreground/20' : 'bg-muted'
                )}>
                  <div 
                    className={cn(
                      'h-full transition-all',
                      completionPct > 0 
                        ? isActive ? 'bg-primary' : 'bg-accent'
                        : 'bg-transparent'
                    )}
                    style={{ width: `${Math.max(completionPct, 0)}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
