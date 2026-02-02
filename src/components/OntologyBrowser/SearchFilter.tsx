import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

export function SearchFilter({ 
  value, 
  onChange, 
  placeholder = 'Search questions...', 
  resultCount,
  totalCount 
}: SearchFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 200);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync external changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => {
              setLocalValue('');
              onChange('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {resultCount !== undefined && totalCount !== undefined && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {resultCount} of {totalCount}
        </span>
      )}
    </div>
  );
}
