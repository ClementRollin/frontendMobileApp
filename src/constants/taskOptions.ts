import { TaskPriority, TaskScope, TaskStatus } from '../types/task';

export const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

export const taskPriorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const taskScopeOptions: Array<{ label: string; value: TaskScope }> = [
  { label: 'Toutes', value: 'visible' },
  { label: 'Créées', value: 'created' },
  { label: 'Assignées', value: 'assigned' },
];
