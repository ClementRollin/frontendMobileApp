import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { invitationsApi } from '../api/invitationsApi';
import { queryKeys } from '../constants/queryKeys';

export const useInvitations = () =>
  useQuery({
    queryKey: queryKeys.invitations,
    queryFn: async () => {
      const response = await invitationsApi.list();
      return response.data;
    },
  });

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invitationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations });
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invitationsApi.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations });
    },
  });
};
