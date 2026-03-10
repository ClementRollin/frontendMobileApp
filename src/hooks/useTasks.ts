import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tasksApi } from '../api/tasksApi';
import { queryKeys } from '../constants/queryKeys';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storageService';
import { useAuthStore } from '../store/authStore';
import {
  CreateTaskPayload,
  Task,
  TaskScope,
  TaskStatus,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from '../types/task';

type TaskListResult = {
  tasks: Task[];
  meta?: Record<string, unknown>;
  fromCache: boolean;
  cacheMessage?: string;
};

export const useTasks = (scope: TaskScope, status?: TaskStatus) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: queryKeys.tasks(scope, status),
    queryFn: async (): Promise<TaskListResult> => {
      if (!user) {
        return { tasks: [], fromCache: false };
      }

      try {
        const response = await tasksApi.list({ scope, status, page: 1, per_page: 15 });
        await storageService.setCachedTasks(user.id, scope, response.data, response.meta, status);

        return {
          tasks: response.data,
          meta: response.meta,
          fromCache: false,
        };
      } catch (error) {
        const cached = await storageService.getCachedTasks(user.id, scope, status);
        if (cached) {
          return {
            tasks: cached.tasks,
            meta: cached.meta,
            fromCache: true,
            cacheMessage: 'API indisponible. Affichage des dernières données locales.',
          };
        }

        throw error;
      }
    },
  });
};

export const useTask = (taskId: number) =>
  useQuery({
    queryKey: queryKeys.task(taskId),
    queryFn: async () => {
      const response = await tasksApi.getById(taskId);
      return response.data;
    },
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await tasksApi.create(payload);
      const notificationResult = await notificationService.syncTaskDueNotification(response.data);
      return {
        task: response.data,
        notificationResult,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: number; payload: UpdateTaskPayload }) => {
      const response = await tasksApi.update(taskId, payload);
      const notificationResult = await notificationService.syncTaskDueNotification(response.data);
      return {
        task: response.data,
        notificationResult,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(queryKeys.task(result.task.id), result.task);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      const response = await tasksApi.delete(taskId);
      await notificationService.cancelTaskNotification(taskId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: number; payload: UpdateTaskStatusPayload }) => {
      const response = await tasksApi.updateStatus(taskId, payload);
      return response.data;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(queryKeys.task(task.id), task);
    },
  });
};
