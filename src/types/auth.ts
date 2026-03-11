export type UserRole = 'cto' | 'lead_dev' | 'developer' | 'po';

export type UserSummary = {
  id: number;
  organization_id: number;
  role: UserRole;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
};

export type User = UserSummary & {
  created_at: string;
  updated_at: string;
};

export type AuthPayload = {
  token: string;
  user: User;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  invitation_code: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type RegisterCtoFormValues = {
  organization_name: string;
  organization_slug?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type AuthSession = {
  token: string;
  user: User;
  role: UserRole;
  organization_id: number;
};
