import { UserRole } from '../types/auth';
import { Task, TaskStatus } from '../types/task';

const transitionsByRole: Record<UserRole, Partial<Record<TaskStatus, TaskStatus[]>>> = {
  developer: {
    todo: ['in_progress'],
    in_progress: ['blocked', 'in_review'],
  },
  lead_dev: {
    todo: ['in_progress'],
    in_progress: ['blocked'],
    blocked: ['in_progress'],
    in_review: ['waiting_for_test', 'in_progress'],
    tested: ['deployed'],
  },
  po: {
    waiting_for_test: ['tested', 'in_progress'],
  },
  cto: {},
};

export const getAllowedTransitions = (role: UserRole, currentStatus: TaskStatus): TaskStatus[] =>
  transitionsByRole[role][currentStatus] ?? [];

export const canCreateOrEditTask = (role: UserRole) => role === 'lead_dev';

export const canManageTags = (role: UserRole) => role === 'lead_dev';

export const canManageTaskLinks = (role: UserRole) => role === 'lead_dev';

export const canCommentTask = (role: UserRole) => role !== 'cto';

export const canDeleteTask = (role: UserRole) => role === 'lead_dev';

export const canEditTask = (role: UserRole) => role === 'lead_dev';

export const canConfirmBlocked = (role: UserRole, task: Task) =>
  role === 'lead_dev' && task.status === 'blocked' && !task.blocked_confirmed_at;
