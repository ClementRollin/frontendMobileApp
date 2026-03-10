import { Task } from './task';

export type RootStackParamList = {
  Welcome: undefined;
  AuthStack: undefined;
  MainStack: undefined;
};

export type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskCreate: undefined;
  TaskEdit: { task: Task };
  Settings: undefined;
  Profile: undefined;
};
