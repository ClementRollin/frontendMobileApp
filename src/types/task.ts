import { UserSummary } from './auth';

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'in_review'
  | 'waiting_for_test'
  | 'tested'
  | 'deployed';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskScope = 'visible' | 'created' | 'assigned' | 'unassigned';

export type TeamSummary = {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMembership = {
  id: number;
  organization_id: number;
  team_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: UserSummary;
};

export type Tag = {
  id: number;
  organization_id: number;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: number;
  organization_id: number;
  team_id: number;
  creator_id: number;
  assignee_id: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  blocked_reason: string | null;
  blocked_confirmed_at: string | null;
  blocked_confirmed_by: number | null;
  deployed_at: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  creator?: UserSummary;
  assignee?: UserSummary | null;
  team?: TeamSummary;
  blocked_confirmed_user?: UserSummary | null;
  tags?: Tag[];
};

export type LinkedTaskSummary = {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: UserSummary | null;
};

export type TaskLink = {
  id: number;
  organization_id: number;
  task_low_id: number;
  task_high_id: number;
  link_type: string | null;
  linked_task: LinkedTaskSummary | null;
  created_at: string;
  updated_at: string;
};

export type TaskStatusHistory = {
  id: number;
  user: UserSummary | null;
  old_status: TaskStatus | null;
  new_status: TaskStatus;
  comment: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type CreateTaskPayload = {
  team_id: number;
  title: string;
  description?: string | null;
  assignee_id?: number | null;
  status: TaskStatus;
  priority: TaskPriority;
  blocked_reason?: string | null;
  due_date?: string | null;
  tag_ids?: number[];
};

export type UpdateTaskPayload = {
  team_id: number;
  title: string;
  description?: string | null;
  assignee_id?: number | null;
  priority: TaskPriority;
  blocked_reason?: string | null;
  due_date?: string | null;
  tag_ids?: number[];
};

export type UpdateTaskStatusPayload = {
  status: TaskStatus;
  comment?: string;
  blocked_reason?: string | null;
  metadata?: Record<string, unknown>;
};

export type ConfirmBlockedPayload = {
  comment?: string;
  metadata?: Record<string, unknown>;
};

export type TaskFilters = {
  scope?: TaskScope;
  status?: TaskStatus;
  priority?: TaskPriority;
  team_id?: number;
  assignee_id?: number;
  creator_id?: number;
  due_before?: string;
  due_after?: string;
  tag_ids?: number[];
  search?: string;
  page?: number;
  per_page?: number;
};

export type TaskListQueryContext = {
  organizationId: number;
  userId: number;
  role: string;
  scope: TaskScope;
  filtersHash: string;
};
