import { UserRole, UserSummary } from './auth';
import { TeamSummary } from './task';

export type InvitationCode = {
  id: number;
  code: string;
  organization_id: number;
  team_id: number | null;
  target_role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  created_by_user_id: number | null;
  used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  team?: TeamSummary | null;
  created_by?: UserSummary | null;
};

export type CreateInvitationPayload = {
  team_id: number;
  target_role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
};
