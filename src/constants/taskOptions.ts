import { TaskPriority, TaskScope, TaskStatus } from '../types/task';

export const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: 'A faire', value: 'todo' },
  { label: 'En cours', value: 'in_progress' },
  { label: 'Terminee', value: 'done' },
];

export const taskPriorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Basse', value: 'low' },
  { label: 'Moyenne', value: 'medium' },
  { label: 'Haute', value: 'high' },
];

export const taskScopeOptions: Array<{ label: string; value: TaskScope }> = [
  { label: 'Toutes', value: 'visible' },
  { label: 'Creees', value: 'created' },
  { label: 'Assignees', value: 'assigned' },
];
