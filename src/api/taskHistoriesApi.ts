import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { TaskStatusHistory } from '../types/task';

export const taskHistoriesApi = {
  list: async (taskId: number) => {
    const response = await apiClient.get<ApiSuccessResponse<TaskStatusHistory[]>>(
      `/tasks/${taskId}/status-histories`,
    );
    return response.data;
  },
};
