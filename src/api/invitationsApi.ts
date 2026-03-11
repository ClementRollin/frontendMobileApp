import { apiClient } from './client';
import { ApiSuccessResponse } from '../types/api';
import { CreateInvitationPayload, InvitationCode } from '../types/invitation';

export const invitationsApi = {
  list: async () => {
    const response = await apiClient.get<ApiSuccessResponse<InvitationCode[]>>('/invitation-codes');
    return response.data;
  },
  create: async (payload: CreateInvitationPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<InvitationCode>>('/invitation-codes', payload);
    return response.data;
  },
  revoke: async (invitationId: number) => {
    const response = await apiClient.patch<ApiSuccessResponse<InvitationCode>>(`/invitation-codes/${invitationId}/revoke`);
    return response.data;
  },
};
