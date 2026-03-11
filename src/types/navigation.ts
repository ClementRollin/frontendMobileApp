import { Task } from './task';

export type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  RegisterCto: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskCreate: undefined;
  TaskEdit: { task: Task };
  InvitationManagement: undefined;
  TagManagement: undefined;
  Settings: undefined;
  Profile: undefined;
  AccessDenied: undefined;
};
