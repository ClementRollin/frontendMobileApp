import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { TaskLink } from '../types/task';

export type CreateTaskLinkPayload = {
  linked_task_id: number;
  link_type?: string | null;
};

export const taskLinksApi = {
  list: async (taskId: number) => {
    const response = await apiClient.get<ApiSuccessResponse<TaskLink[]>>(`/tasks/${taskId}/links`);
    return response.data;
  },
  create: async (taskId: number, payload: CreateTaskLinkPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<TaskLink>>(`/tasks/${taskId}/links`, payload);
    return response.data;
  },
  delete: async (taskLinkId: number) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`/task-links/${taskLinkId}`);
    return response.data;
  },
};
