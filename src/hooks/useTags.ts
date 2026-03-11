import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TagPayload, tagsApi } from '../api/tagsApi';
import { queryKeys } from '../constants/queryKeys';

export const useTags = () =>
  useQuery({
    queryKey: queryKeys.tags,
    queryFn: async () => {
      const response = await tagsApi.list();
      return response.data;
    },
  });

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TagPayload) => tagsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, payload }: { tagId: number; payload: TagPayload }) => tagsApi.update(tagId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: number) => tagsApi.delete(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
};
