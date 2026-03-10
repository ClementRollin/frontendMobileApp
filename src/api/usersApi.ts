import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { User } from '../types/auth';

export const usersApi = {
  list: async () => {
    const response = await apiClient.get<ApiSuccessResponse<User[]>>('/users');
    return response.data;
  },
};
