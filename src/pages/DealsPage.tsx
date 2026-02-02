import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Plus, Loader2 } from 'lucide-react';
import { getDeals } from '@/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

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

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">View and analyze credit agreements</p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Deal
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>Failed to load deals</p>
          <p className="text-sm">Please check your API connection</p>
        </div>
      ) : filteredDeals?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-card">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No deals found</p>
          <p className="text-muted-foreground mb-4">
            {search ? 'Try a different search term' : 'Upload your first credit agreement'}
          </p>
          {!search && (
            <Button onClick={() => navigate('/upload')}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Deal
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Upload Date</TableHead>
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
                    {deal.upload_date && !isNaN(new Date(deal.upload_date).getTime())
                      ? format(new Date(deal.upload_date), 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
