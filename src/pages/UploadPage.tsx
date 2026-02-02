import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { uploadDeal, getDealStatus } from '@/api/client';
import { UploadDropzone } from '@/components/UploadDropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UploadStatus, DealStatus } from '@/types';

export default function UploadPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string>();
  const [dealName, setDealName] = useState('');
  const [borrower, setBorrower] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const startPolling = (dealId: string) => {
    const poll = async () => {
      try {
        const statusData: DealStatus = await getDealStatus(dealId);
        setProgress(statusData.progress);
        setCurrentStep(statusData.current_step);

        if (statusData.status === 'complete') {
          stopPolling();
          setStatus('complete');
          setTimeout(() => {
            navigate(`/deals/${dealId}`);
          }, 1500);
        } else if (statusData.status === 'error') {
          stopPolling();
          setStatus('error');
          setError(statusData.error || 'Extraction failed');
        }
      } catch (err) {
        stopPolling();
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to check status');
      }
    };

    // Poll immediately, then every 20 seconds
    poll();
    pollingRef.current = setInterval(poll, 20000);
  };

  const mutation = useMutation({
    mutationFn: (file: File) => uploadDeal(file, dealName, borrower),
    onMutate: () => {
      setStatus('uploading');
      setError(undefined);
      setProgress(0);
      setCurrentStep(null);
    },
    onSuccess: (data) => {
      setStatus('extracting');
      startPolling(data.deal_id);
    },
    onError: (err) => {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    },
  });

  const handleUpload = async (file: File) => {
    await mutation.mutateAsync(file);
  };

  const isFormValid = dealName.trim() !== '' && borrower.trim() !== '';

  return (
    <div className="container py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Deals
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Upload Credit Agreement</CardTitle>
          <CardDescription>
            Upload a PDF document for legal analysis. The system will extract
            primitives and enable structured Q&A.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-name">Deal Name</Label>
              <Input
                id="deal-name"
                placeholder="e.g., Acme Corp Credit Agreement"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                disabled={status !== 'idle' && status !== 'error'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borrower">Borrower</Label>
              <Input
                id="borrower"
                placeholder="e.g., Acme Corp"
                value={borrower}
                onChange={(e) => setBorrower(e.target.value)}
                disabled={status !== 'idle' && status !== 'error'}
              />
            </div>
          </div>
          
          <UploadDropzone
            onUpload={handleUpload}
            status={status}
            error={error}
            progress={progress}
            currentStep={currentStep}
            disabled={!isFormValid}
          />
        </CardContent>
      </Card>
    </div>
  );
}
