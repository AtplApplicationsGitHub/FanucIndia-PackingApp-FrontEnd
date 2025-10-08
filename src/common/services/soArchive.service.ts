import { apiClient } from '@/common/lib/apiClient';
import { API } from '@/common/lib/endpoints';

export const soArchiveService = {
  archive: async (soNumber: string) => {
    return apiClient.post(API.SO_ARCHIVE.ARCHIVE(soNumber));
  },
  delete: async (soNumber: string) => {
    return apiClient.delete(API.SO_ARCHIVE.DELETE(soNumber));
  },
};