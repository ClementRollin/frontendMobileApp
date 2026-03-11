import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CreateTaskLinkPayload, taskLinksApi } from '../api/taskLinksApi';
import { queryKeys } from '../constants/queryKeys';

export const useTaskLinks = (taskId: number) =>
  useQuery({
    queryKey: queryKeys.taskLinks(taskId),
    queryFn: async () => {
      const response = await taskLinksApi.list(taskId);
      return response.data;
    },
  });

export const useCreateTaskLink = (taskId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskLinkPayload) => taskLinksApi.create(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskLinks(taskId) });
    },
  });
};

export const useDeleteTaskLink = (taskId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskLinkId: number) => taskLinksApi.delete(taskLinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskLinks(taskId) });
    },
  });
};
