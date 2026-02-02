import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { uploadDeal } from '@/api/client';
import { UploadDropzone } from '@/components/UploadDropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UploadStatus } from '@/types';

export default function UploadPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string>();

  const mutation = useMutation({
    mutationFn: uploadDeal,
    onMutate: () => {
      setStatus('uploading');
      setError(undefined);
    },
    onSuccess: (data) => {
      setStatus('extracting');
      // Simulate extraction time, then redirect
      setTimeout(() => {
        setStatus('complete');
        setTimeout(() => {
          navigate(`/deals/${data.deal_id}`);
        }, 1500);
      }, 2000);
    },
    onError: (err) => {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    },
  });

  const handleUpload = async (file: File) => {
    await mutation.mutateAsync(file);
  };

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
        <CardContent>
          <UploadDropzone
            onUpload={handleUpload}
            status={status}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
