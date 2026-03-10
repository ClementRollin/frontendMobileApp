import { useQuery } from '@tanstack/react-query';

import { usersApi } from '../api/usersApi';
import { queryKeys } from '../constants/queryKeys';

export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const response = await usersApi.list();
      return response.data;
    },
  });
