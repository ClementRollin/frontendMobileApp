import { priorityLabelFr, scopeLabelFr, statusLabelFr } from './labels';
import { TaskPriority, TaskScope, TaskStatus } from '../types/task';

export const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: statusLabelFr.todo, value: 'todo' },
  { label: statusLabelFr.in_progress, value: 'in_progress' },
  { label: statusLabelFr.blocked, value: 'blocked' },
  { label: statusLabelFr.in_review, value: 'in_review' },
  { label: statusLabelFr.waiting_for_test, value: 'waiting_for_test' },
  { label: statusLabelFr.tested, value: 'tested' },
  { label: statusLabelFr.deployed, value: 'deployed' },
];

export const taskPriorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: priorityLabelFr.low, value: 'low' },
  { label: priorityLabelFr.medium, value: 'medium' },
  { label: priorityLabelFr.high, value: 'high' },
];

export const taskScopeOptions: Array<{ label: string; value: TaskScope }> = [
  { label: scopeLabelFr.visible, value: 'visible' },
  { label: scopeLabelFr.created, value: 'created' },
  { label: scopeLabelFr.assigned, value: 'assigned' },
  { label: scopeLabelFr.unassigned, value: 'unassigned' },
];
