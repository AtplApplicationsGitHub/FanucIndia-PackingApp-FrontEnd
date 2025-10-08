import { useState } from 'react';
import { soArchiveService } from '@/common/services/soArchive.service';
import { toast } from 'sonner';

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const useSoArchive = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'archive' | 'delete' | null>(null);
  const [soNumberToProcess, setSoNumberToProcess] = useState<string | null>(null);

  const handleArchive = async () => {
    if (!soNumberToProcess) return;
    setIsLoading(true);
    try {
      await soArchiveService.archive(soNumberToProcess);
      toast.success(`Sales Order ${soNumberToProcess} archived successfully.`);
      onSuccess?.();
    } catch (error: unknown) { 
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Failed to archive Sales Order.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    if (!soNumberToProcess) return;
    setIsLoading(true);
    try {
      await soArchiveService.delete(soNumberToProcess);
      toast.success(`Sales Order ${soNumberToProcess} deleted successfully.`);
      onSuccess?.();
    } catch (error: unknown) { 
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Failed to delete Sales Order.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  const openConfirmation = (action: 'archive' | 'delete', soNumber: string) => {
    setSoNumberToProcess(soNumber);
    setConfirmAction(action);
  };

  const closeConfirmation = () => {
    setConfirmAction(null);
    setSoNumberToProcess(null);
  };

  return {
    isLoading,
    confirmAction,
    handleArchive,
    handleDelete,
    openConfirmation,
    closeConfirmation,
    soNumberToProcess,
  };
};