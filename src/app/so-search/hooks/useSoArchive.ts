import { useState } from 'react';
import { soArchiveService } from '@/common/services/soArchive.service';
import { toast } from 'sonner';

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
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive Sales Order.');
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete Sales Order.');
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