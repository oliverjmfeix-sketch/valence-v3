import { Link, useLocation } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Deals', icon: FileText },
    { path: '/upload', label: 'Upload', icon: Upload },
  ];

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
            V
          </div>
          <span className="text-xl font-semibold tracking-tight">Valence</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === path
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
