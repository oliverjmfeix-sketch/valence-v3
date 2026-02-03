import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Plus, Loader2, Building2, Calendar } from 'lucide-react';
import { getDeals, getDealStatus } from '@/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DealStatusBadge } from '@/components/deals/DealStatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import type { Deal, DealStatus } from '@/types';

// Component to fetch and display status for a deal
function DealStatusCell({ dealId }: { dealId: string }) {
  const { data: status } = useQuery<DealStatus>({
    queryKey: ['deal-status', dealId],
    queryFn: () => getDealStatus(dealId),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === 'pending' || s === 'extracting' || s === 'storing') {
        return 5000;
      }
      return false;
    },
  });

  return <DealStatusBadge status={status?.status || 'pending'} />;
}

export default function DealsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: getDeals,
  });

  const filteredDeals = deals?.filter((deal) =>
    deal.deal_name.toLowerCase().includes(search.toLowerCase()) ||
    (deal.borrower?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const useCards = !filteredDeals || filteredDeals.length < 10;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Deals</h1>
          <p className="text-muted-foreground mt-1">View and analyze credit agreements</p>
        </div>
        <Button onClick={() => navigate('/upload')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Upload Deal
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals by name or borrower..."
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="text-lg font-medium">Failed to load deals</p>
          <p className="text-sm">Please check your API connection</p>
        </div>
      ) : filteredDeals?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No deals found</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              {search ? 'Try a different search term' : 'Upload your first credit agreement to get started'}
            </p>
            {!search && (
              <Button onClick={() => navigate('/upload')}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Deal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : useCards ? (
        // Card grid for fewer deals
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeals?.map((deal) => (
            <Card
              key={deal.deal_id}
              className="cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => navigate(`/deals/${deal.deal_id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                    {deal.deal_name}
                  </h3>
                  <DealStatusCell dealId={deal.deal_id} />
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {deal.borrower && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{deal.borrower}</span>
                    </div>
                  )}
                  {(deal.created_at || deal.upload_date) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {(() => {
                          const dateStr = deal.created_at || deal.upload_date;
                          if (!dateStr || isNaN(new Date(dateStr).getTime())) return '—';
                          return format(new Date(dateStr), 'MMM d, yyyy');
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Table for many deals
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals?.map((deal) => (
                <TableRow
                  key={deal.deal_id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/deals/${deal.deal_id}`)}
                >
                  <TableCell className="font-medium">{deal.deal_name}</TableCell>
                  <TableCell>{deal.borrower ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {(() => {
                      const dateStr = deal.created_at || deal.upload_date;
                      if (!dateStr || isNaN(new Date(dateStr).getTime())) return '—';
                      return format(new Date(dateStr), 'MMM d, yyyy');
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DealStatusCell dealId={deal.deal_id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
