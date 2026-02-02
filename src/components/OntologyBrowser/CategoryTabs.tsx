import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  label: string;
  count: number;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  children: React.ReactNode;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange, children }: CategoryTabsProps) {
  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="flex flex-col h-full">
      <TabsList className="w-full justify-start h-auto p-1 bg-secondary/50">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id}
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            {cat.label}
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {cat.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1 mt-4">
        {children}
      </div>
    </Tabs>
  );
}
