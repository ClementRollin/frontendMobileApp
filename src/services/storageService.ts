import AsyncStorage from '@react-native-async-storage/async-storage';

import { storageKeys } from '../constants/storageKeys';
import { PaginatedMeta } from '../types/api';
import { Task, TaskScope, TaskStatus } from '../types/task';

type CachedTasksPayload = {
  tasks: Task[];
  meta?: PaginatedMeta;
  cached_at: string;
};

type NotificationMap = Record<string, string>;

const getTasksCacheKey = (userId: number, scope: TaskScope, status?: TaskStatus) =>
  `${storageKeys.cachedTasksPrefix}:${userId}:${scope}:${status ?? 'all'}`;

export const storageService = {
  async setCachedTasks(userId: number, scope: TaskScope, tasks: Task[], meta?: PaginatedMeta, status?: TaskStatus) {
    const payload: CachedTasksPayload = {
      tasks,
      meta,
      cached_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(getTasksCacheKey(userId, scope, status), JSON.stringify(payload));
  },

  async getCachedTasks(userId: number, scope: TaskScope, status?: TaskStatus): Promise<CachedTasksPayload | null> {
    const raw = await AsyncStorage.getItem(getTasksCacheKey(userId, scope, status));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CachedTasksPayload;
    } catch {
      return null;
    }
  },

  async getNotificationMap(): Promise<NotificationMap> {
    const raw = await AsyncStorage.getItem(storageKeys.notificationMap);
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as NotificationMap;
    } catch {
      return {};
    }
  },

  async setTaskNotification(taskId: number, notificationId: string): Promise<void> {
    const map = await this.getNotificationMap();
    map[String(taskId)] = notificationId;
    await AsyncStorage.setItem(storageKeys.notificationMap, JSON.stringify(map));
  },

  async getTaskNotification(taskId: number): Promise<string | null> {
    const map = await this.getNotificationMap();
    return map[String(taskId)] ?? null;
  },

  async removeTaskNotification(taskId: number): Promise<void> {
    const map = await this.getNotificationMap();
    delete map[String(taskId)];
    await AsyncStorage.setItem(storageKeys.notificationMap, JSON.stringify(map));
  },
};
