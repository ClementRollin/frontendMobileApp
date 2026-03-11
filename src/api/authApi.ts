import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { AuthPayload, LoginFormValues, RegisterCtoFormValues, RegisterFormValues, User } from '../types/auth';

export const authApi = {
  register: async (payload: RegisterFormValues) => {
    const response = await apiClient.post<ApiSuccessResponse<AuthPayload>>('/register', payload);
    return response.data;
  },
  registerCto: async (payload: RegisterCtoFormValues) => {
    const response = await apiClient.post<ApiSuccessResponse<AuthPayload>>('/register-cto', payload);
    return response.data;
  },
  login: async (payload: LoginFormValues) => {
    const response = await apiClient.post<ApiSuccessResponse<AuthPayload>>('/login', payload);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post<ApiSuccessResponse<null>>('/logout');
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get<ApiSuccessResponse<User>>('/me');
    return response.data;
  },
};
