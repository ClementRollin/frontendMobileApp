import { useQuery } from '@tanstack/react-query';

import { taskHistoriesApi } from '../api/taskHistoriesApi';
import { queryKeys } from '../constants/queryKeys';

export const useTaskHistories = (taskId: number) =>
  useQuery({
    queryKey: queryKeys.taskHistories(taskId),
    queryFn: async () => {
      const response = await taskHistoriesApi.list(taskId);
      return response.data;
    },
  });
