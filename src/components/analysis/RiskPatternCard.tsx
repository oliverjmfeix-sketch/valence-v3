import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type RiskLevel = 'high' | 'moderate' | 'low' | 'none';

interface RiskPatternCardProps {
  title: string;
  riskLevel: RiskLevel;
  description: string;
  details?: string;
  className?: string;
}

const riskConfig: Record<RiskLevel, { 
  icon: typeof AlertTriangle; 
  className: string; 
  bgClassName: string;
  label: string;
}> = {
  high: {
    icon: ShieldAlert,
    className: 'text-risk-high',
    bgClassName: 'bg-risk-high/10 border-risk-high/20',
    label: 'HIGH',
  },
  moderate: {
    icon: AlertTriangle,
    className: 'text-risk-moderate',
    bgClassName: 'bg-risk-moderate/10 border-risk-moderate/20',
    label: 'MODERATE',
  },
  low: {
    icon: ShieldCheck,
    className: 'text-risk-low',
    bgClassName: 'bg-risk-low/10 border-risk-low/20',
    label: 'LOW',
  },
  none: {
    icon: Shield,
    className: 'text-muted-foreground',
    bgClassName: 'bg-muted/50 border-muted',
    label: 'NONE',
  },
};

export function RiskPatternCard({ 
  title, 
  riskLevel, 
  description, 
  details,
  className 
}: RiskPatternCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <Card className={cn('border', config.bgClassName, className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={cn('h-5 w-5', config.className)} />
              <div>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  'font-semibold text-xs px-2 py-0.5',
                  config.className,
                  riskLevel === 'high' && 'border-risk-high/50',
                  riskLevel === 'moderate' && 'border-risk-moderate/50',
                  riskLevel === 'low' && 'border-risk-low/50'
                )}
              >
                {config.label}
              </Badge>
              {details && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>
        </CardHeader>
        
        {details && (
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              <div className="pl-8 border-l-2 border-muted ml-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {details}
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        )}
      </Collapsible>
    </Card>
  );
}

// Container for multiple risk patterns
export function RiskPatternsSection({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-semibold">Risk Patterns Detected</h3>
      </div>
      {children}
    </div>
  );
}
