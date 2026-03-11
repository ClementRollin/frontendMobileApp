import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { teamsApi } from '../api/teamsApi';
import { queryKeys } from '../constants/queryKeys';

export const useTeams = () =>
  useQuery({
    queryKey: queryKeys.teams,
    queryFn: async () => {
      const response = await teamsApi.list();
      return response.data;
    },
  });

export const useTeamMemberships = (teamId: number | null) =>
  useQuery({
    queryKey: queryKeys.teamMemberships(teamId),
    queryFn: async () => {
      if (!teamId) {
        return [];
      }
      const response = await teamsApi.memberships(teamId);
      return response.data;
    },
    enabled: Boolean(teamId),
  });

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
};
