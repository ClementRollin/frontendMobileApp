import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { commentsApi } from '../api/commentsApi';
import { queryKeys } from '../constants/queryKeys';
import { CreateCommentPayload } from '../types/comment';

export const useTaskComments = (taskId: number) =>
  useQuery({
    queryKey: queryKeys.taskComments(taskId),
    queryFn: async () => {
      const response = await commentsApi.list(taskId);
      return response.data;
    },
  });

export const useAddComment = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => commentsApi.create(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskComments(taskId) });
    },
  });
};
