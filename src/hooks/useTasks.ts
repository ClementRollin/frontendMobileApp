import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tasksApi } from '../api/tasksApi';
import { commonLabels } from '../constants/labels';
import { queryKeys } from '../constants/queryKeys';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storageService';
import { useAuthStore } from '../store/authStore';
import {
  ConfirmBlockedPayload,
  CreateTaskPayload,
  Task,
  TaskFilters,
  TaskListQueryContext,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from '../types/task';

type TaskListResult = {
  tasks: Task[];
  meta?: Record<string, unknown>;
  fromCache: boolean;
  cacheMessage?: string;
};

const clampPerPage = (perPage?: number): number => {
  if (!perPage) {
    return 15;
  }
  return Math.max(1, Math.min(perPage, 50));
};

const normalizeFilters = (filters: TaskFilters): TaskFilters => {
  const next: TaskFilters = {
    ...filters,
    page: filters.page ?? 1,
    per_page: clampPerPage(filters.per_page),
    scope: filters.scope ?? 'visible',
  };
  if (typeof next.search === 'string') {
    next.search = next.search.trim();
    if (next.search === '') {
      delete next.search;
    }
  }
  return next;
};

const buildFilterHash = (filters: TaskFilters): string => JSON.stringify(filters);

export const useTasks = (filters: TaskFilters) => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const normalized = normalizeFilters(filters);

  return useQuery({
    queryKey: queryKeys.tasks(normalized),
    queryFn: async (): Promise<TaskListResult> => {
      if (!user || !role || !user.organization_id) {
        return { tasks: [], fromCache: false };
      }

      const cacheContext: TaskListQueryContext = {
        organizationId: user.organization_id,
        userId: user.id,
        role,
        scope: normalized.scope ?? 'visible',
        filtersHash: buildFilterHash(normalized),
      };

      try {
        const response = await tasksApi.list(normalized);
        await storageService.setCachedTasks(cacheContext, response.data, response.meta);

        return {
          tasks: response.data,
          meta: response.meta,
          fromCache: false,
        };
      } catch (error) {
        const cached = await storageService.getCachedTasks(cacheContext);
        if (cached) {
          return {
            tasks: cached.tasks,
            meta: cached.meta,
            fromCache: true,
            cacheMessage: commonLabels.fallbackOffline,
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

export const usePatchTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: number; payload: UpdateTaskStatusPayload }) => {
      const response = await tasksApi.updateStatus(taskId, payload);
      return response.data;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskHistories(task.id) });
      queryClient.setQueryData(queryKeys.task(task.id), task);
    },
  });
};

export const useConfirmBlocked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: number; payload?: ConfirmBlockedPayload }) => {
      const response = await tasksApi.confirmBlocked(taskId, payload ?? {});
      return response.data;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskHistories(task.id) });
      queryClient.setQueryData(queryKeys.task(task.id), task);
    },
  });
};
