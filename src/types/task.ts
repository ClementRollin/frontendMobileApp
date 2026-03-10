import { User } from './auth';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskScope = 'visible' | 'created' | 'assigned';

export type Task = {
  id: number;
  creator_id: number;
  assignee_id: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  creator?: User;
  assignee?: User | null;
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  assignee_id?: number | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
};

export type UpdateTaskPayload = CreateTaskPayload;

export type UpdateTaskStatusPayload = {
  status: TaskStatus;
};
