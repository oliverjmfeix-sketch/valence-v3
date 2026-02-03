import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Plus, Loader2, Building2, Calendar } from 'lucide-react';
import { getDeals, deleteDeal } from '@/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DealRowActions } from '@/components/deals/DealRowActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
// Tooltip used inside DealRowActions
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Deal, DealStatus } from '@/types';

// Status+Delete actions are now handled per-row in DealRowActions to avoid
// re-rendering the whole page on every status poll.

export default function DealsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: getDeals,
  });

  const deleteMutation = useMutation({
    mutationFn: (dealId: string) => deleteDeal(dealId),
    onSuccess: () => {
      toast({ title: "Deal deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setDeletingDeal(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete deal",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredDeals = deals?.filter((deal) =>
    deal.deal_name.toLowerCase().includes(search.toLowerCase()) ||
    (deal.borrower?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const useCards = !filteredDeals || filteredDeals.length < 10;

  // Delete eligibility is computed inside DealRowActions using deal status query cache.

  const handleDeleteClick = (deal: Deal) => {
    setDeletingDeal(deal);
  };

  const handleConfirmDelete = () => {
    if (deletingDeal) {
      deleteMutation.mutate(deletingDeal.deal_id);
    }
  };

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
                  <DealRowActions
                    deal={deal}
                    isDeleting={deleteMutation.isPending && deletingDeal?.deal_id === deal.deal_id}
                    onDelete={handleDeleteClick}
                  />
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
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
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
                  <TableCell colSpan={2}>
                    <DealRowActions
                      deal={deal}
                      isDeleting={deleteMutation.isPending && deletingDeal?.deal_id === deal.deal_id}
                      onDelete={handleDeleteClick}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDeal} onOpenChange={(open) => !open && setDeletingDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingDeal?.deal_name}" and all extracted data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
