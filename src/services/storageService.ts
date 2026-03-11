import AsyncStorage from '@react-native-async-storage/async-storage';

import { storageKeys } from '../constants/storageKeys';
import { PaginatedMeta } from '../types/api';
import { Task, TaskListQueryContext } from '../types/task';

type CachedTasksPayload = {
  tasks: Task[];
  meta?: PaginatedMeta;
  cached_at: string;
};

type NotificationMap = Record<string, string>;

const buildTaskCacheKey = (context: TaskListQueryContext) =>
  `${storageKeys.cachedTasksPrefix}:${context.organizationId}:${context.userId}:${context.role}:${context.scope}:${context.filtersHash}`;

const getCacheIndex = async (): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(storageKeys.cachedTasksIndex);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const upsertCacheIndex = async (key: string): Promise<void> => {
  const index = await getCacheIndex();
  if (!index.includes(key)) {
    index.push(key);
    await AsyncStorage.setItem(storageKeys.cachedTasksIndex, JSON.stringify(index));
  }
};

export const storageService = {
  async setCachedTasks(context: TaskListQueryContext, tasks: Task[], meta?: PaginatedMeta) {
    const payload: CachedTasksPayload = {
      tasks,
      meta,
      cached_at: new Date().toISOString(),
    };

    const key = buildTaskCacheKey(context);
    await AsyncStorage.setItem(key, JSON.stringify(payload));
    await upsertCacheIndex(key);
  },

  async getCachedTasks(context: TaskListQueryContext): Promise<CachedTasksPayload | null> {
    const raw = await AsyncStorage.getItem(buildTaskCacheKey(context));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CachedTasksPayload;
    } catch {
      return null;
    }
  },

  async clearTaskCachesForUser(organizationId: number, userId: number): Promise<void> {
    const prefix = `${storageKeys.cachedTasksPrefix}:${organizationId}:${userId}:`;
    const index = await getCacheIndex();
    const keysToDelete = index.filter((key) => key.startsWith(prefix));
    if (keysToDelete.length === 0) {
      return;
    }
    await AsyncStorage.multiRemove(keysToDelete);
    const remaining = index.filter((key) => !key.startsWith(prefix));
    await AsyncStorage.setItem(storageKeys.cachedTasksIndex, JSON.stringify(remaining));
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
