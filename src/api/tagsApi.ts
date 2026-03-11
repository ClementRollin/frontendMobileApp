import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { Tag } from '../types/task';

export type TagPayload = {
  name: string;
  color?: string | null;
};

export const tagsApi = {
  list: async () => {
    const response = await apiClient.get<ApiSuccessResponse<Tag[]>>('/tags');
    return response.data;
  },
  create: async (payload: TagPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<Tag>>('/tags', payload);
    return response.data;
  },
  update: async (tagId: number, payload: TagPayload) => {
    const response = await apiClient.put<ApiSuccessResponse<Tag>>(`/tags/${tagId}`, payload);
    return response.data;
  },
  delete: async (tagId: number) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`/tags/${tagId}`);
    return response.data;
  },
};
