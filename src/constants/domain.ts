import { UserRole } from '../types/auth';
import { TaskPriority, TaskScope, TaskStatus } from '../types/task';

export const USER_ROLES: UserRole[] = ['cto', 'lead_dev', 'developer', 'po'];

export const TASK_STATUSES: TaskStatus[] = [
  'todo',
  'in_progress',
  'blocked',
  'in_review',
  'waiting_for_test',
  'tested',
  'deployed',
];

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export const TASK_SCOPES: TaskScope[] = ['visible', 'created', 'assigned', 'unassigned'];
