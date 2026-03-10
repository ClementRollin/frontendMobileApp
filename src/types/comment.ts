import { User } from './auth';

export type TaskComment = {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
};

export type CreateCommentPayload = {
  content: string;
};
