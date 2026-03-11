import { apiClient } from './client';
import { ApiSuccessResponse, PaginatedResponse } from '../types/api';
import {
  ConfirmBlockedPayload,
  CreateTaskPayload,
  Task,
  TaskFilters,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from '../types/task';

export const tasksApi = {
  list: async (params: TaskFilters) => {
    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return response.data;
  },
  getById: async (taskId: number) => {
    const response = await apiClient.get<ApiSuccessResponse<Task>>(`/tasks/${taskId}`);
    return response.data;
  },
  create: async (payload: CreateTaskPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<Task>>('/tasks', payload);
    return response.data;
  },
  update: async (taskId: number, payload: UpdateTaskPayload) => {
    const response = await apiClient.put<ApiSuccessResponse<Task>>(`/tasks/${taskId}`, payload);
    return response.data;
  },
  delete: async (taskId: number) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`/tasks/${taskId}`);
    return response.data;
  },
  updateStatus: async (taskId: number, payload: UpdateTaskStatusPayload) => {
    const response = await apiClient.patch<ApiSuccessResponse<Task>>(`/tasks/${taskId}/status`, payload);
    return response.data;
  },
  confirmBlocked: async (taskId: number, payload: ConfirmBlockedPayload = {}) => {
    const response = await apiClient.patch<ApiSuccessResponse<Task>>(`/tasks/${taskId}/confirm-blocked`, payload);
    return response.data;
  },
};
