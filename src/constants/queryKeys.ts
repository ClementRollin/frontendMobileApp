import { TaskFilters } from '../types/task';

export const queryKeys = {
  me: ['me'] as const,
  users: ['users'] as const,
  teams: ['teams'] as const,
  invitations: ['invitations'] as const,
  teamMemberships: (teamId: number | null) => ['teamMemberships', teamId] as const,
  tags: ['tags'] as const,
  tasks: (filters: TaskFilters) => ['tasks', filters] as const,
  task: (taskId: number) => ['task', taskId] as const,
  taskComments: (taskId: number) => ['taskComments', taskId] as const,
  taskHistories: (taskId: number) => ['taskHistories', taskId] as const,
  taskLinks: (taskId: number) => ['taskLinks', taskId] as const,
};
