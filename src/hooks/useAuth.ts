import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authApi } from '../api/authApi';
import { queryKeys } from '../constants/queryKeys';
import { storageService } from '../services/storageService';
import { useAuthStore } from '../store/authStore';
import { LoginFormValues, RegisterCtoFormValues, RegisterFormValues } from '../types/auth';

export const useMe = (enabled = true) => {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const response = await authApi.me();
      setUser(response.data);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginFormValues) => authApi.login(payload),
    onSuccess: (response) => {
      setSession(response.data.token, response.data.user);
    },
  });
};

export const useRegister = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: RegisterFormValues) => authApi.register(payload),
    onSuccess: (response) => {
      setSession(response.data.token, response.data.user);
    },
  });
};

export const useRegisterCto = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: RegisterCtoFormValues) => authApi.registerCto(payload),
    onSuccess: (response) => {
      setSession(response.data.token, response.data.user);
    },
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      if (user) {
        await storageService.clearTaskCachesForUser(user.organization_id, user.id);
      }
      clearSession();
      queryClient.clear();
    },
  });
};
