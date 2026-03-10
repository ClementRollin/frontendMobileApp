import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { queryKeys } from '../constants/queryKeys';
import { useAuthStore } from '../store/authStore';

export const useMe = () => {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const response = await authApi.me();
      setUser(response.data);
      return response.data;
    },
    enabled: Boolean(token),
    retry: false,
  });
};

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setSession(response.data.token, response.data.user);
    },
  });
};

export const useRegister = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      setSession(response.data.token, response.data.user);
    },
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
};
