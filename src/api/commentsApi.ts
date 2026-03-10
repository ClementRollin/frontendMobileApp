import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { CreateCommentPayload, TaskComment } from '../types/comment';

export const commentsApi = {
  list: async (taskId: number) => {
    const response = await apiClient.get<ApiSuccessResponse<TaskComment[]>>(`/tasks/${taskId}/comments`);
    return response.data;
  },
  create: async (taskId: number, payload: CreateCommentPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<TaskComment>>(`/tasks/${taskId}/comments`, payload);
    return response.data;
  },
};
