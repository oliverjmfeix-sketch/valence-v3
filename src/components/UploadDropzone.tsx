import { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { UploadStatus } from '@/types';

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  status: UploadStatus;
  error?: string;
  progress?: number;
  currentStep?: string | null;
  disabled?: boolean;
}

export function UploadDropzone({ 
  onUpload, 
  status, 
  error, 
  progress = 0, 
  currentStep,
  disabled = false 
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        setFileName(file.name);
        await onUpload(file);
      }
    },
    [onUpload, disabled]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        await onUpload(file);
      }
    },
    [onUpload, disabled]
  );

  const getStatusContent = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Uploading {fileName}...</p>
              <Progress value={33} className="mt-2 w-48" />
            </div>
          </div>
        );
      case 'extracting':
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Extracting primitives...</p>
              {currentStep && (
                <p className="text-sm text-muted-foreground">{currentStep}</p>
              )}
              {!currentStep && (
                <p className="text-sm text-muted-foreground">Analyzing legal document structure</p>
              )}
              <Progress value={progress} className="mt-2 w-48" />
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          </div>
        );
      case 'complete':
        return (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <p className="font-medium text-green-600">Extraction complete!</p>
              <p className="text-sm text-muted-foreground">Redirecting to deal details...</p>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <p className="font-medium text-destructive">Upload failed</p>
              <p className="text-sm text-muted-foreground">{error || 'Please try again'}</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className={cn(
              'rounded-full p-4 transition-colors',
              isDragOver ? 'bg-primary/20' : 'bg-secondary',
              disabled && 'opacity-50'
            )}>
              <Upload className={cn(
                'h-8 w-8 transition-colors',
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            <div className="text-center">
              <p className={cn('font-medium', disabled && 'text-muted-foreground')}>
                {disabled 
                  ? 'Enter deal name and borrower first'
                  : isDragOver 
                    ? 'Drop your PDF here' 
                    : 'Drag and drop a PDF'}
              </p>
              {!disabled && <p className="text-sm text-muted-foreground">or click to browse</p>}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Credit agreements, loan documents</span>
            </div>
          </>
        );
    }
  };

  const isInteractive = (status === 'idle' || status === 'error') && !disabled;

  return (
    <div
      onDragOver={isInteractive ? handleDragOver : undefined}
      onDragLeave={isInteractive ? handleDragLeave : undefined}
      onDrop={isInteractive ? handleDrop : undefined}
      className={cn(
        'relative flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors',
        isDragOver && 'border-primary bg-primary/5',
        isInteractive && 'cursor-pointer hover:border-primary/50 hover:bg-secondary/50',
        status === 'error' && 'border-destructive/50',
        disabled && status === 'idle' && 'opacity-60 cursor-not-allowed'
      )}
    >
      {getStatusContent()}
      {isInteractive && (
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      )}
    </div>
  );
}
