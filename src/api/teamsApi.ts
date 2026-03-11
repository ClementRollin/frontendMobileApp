import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { TeamMembership, TeamSummary } from '../types/task';

export type CreateTeamPayload = {
  name: string;
  description?: string | null;
};

export const teamsApi = {
  list: async () => {
    const response = await apiClient.get<ApiSuccessResponse<TeamSummary[]>>('/teams');
    return response.data;
  },
  create: async (payload: CreateTeamPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<TeamSummary>>('/teams', payload);
    return response.data;
  },
  memberships: async (teamId: number) => {
    const response = await apiClient.get<ApiSuccessResponse<TeamMembership[]>>(`/teams/${teamId}/memberships`);
    return response.data;
  },
};
