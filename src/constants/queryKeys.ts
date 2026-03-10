import { TaskScope, TaskStatus } from '../types/task';

export const queryKeys = {
  me: ['me'] as const,
  users: ['users'] as const,
  tasks: (scope: TaskScope, status?: TaskStatus) =>
    ['tasks', { scope, status: status ?? 'all' }] as const,
  task: (taskId: number) => ['task', taskId] as const,
  taskComments: (taskId: number) => ['taskComments', taskId] as const,
};
