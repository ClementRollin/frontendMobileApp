import Constants from 'expo-constants';

import { Task } from '../types/task';
import { formatDateTime, isWithinNext24Hours } from '../utils/date';
import { storageService } from './storageService';

type NotificationsModule = typeof import('expo-notifications');
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
const isExpoGo = Constants.appOwnership === 'expo';

const loadNotificationsModule = async (): Promise<NotificationsModule | null> => {
  if (isExpoGo) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').then((module) => {
      module.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      return module;
    });
  }

  return notificationsModulePromise;
};

export type NotificationResult =
  | { scheduled: true; message: string }
  | {
      scheduled: false;
      reason: 'no_due_date' | 'past_due_date' | 'too_far' | 'permission_denied' | 'unavailable_in_expo_go';
    };

const hasPermission = async (): Promise<boolean> => {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const notificationService = {
  async cancelTaskNotification(taskId: number): Promise<void> {
    const existingId = await storageService.getTaskNotification(taskId);
    if (existingId) {
      const Notifications = await loadNotificationsModule();
      if (Notifications) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      }
      await storageService.removeTaskNotification(taskId);
    }
  },

  async syncTaskDueNotification(task: Task): Promise<NotificationResult> {
    await this.cancelTaskNotification(task.id);

    if (!task.due_date) {
      return { scheduled: false, reason: 'no_due_date' };
    }

    const dueDate = new Date(task.due_date);
    if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) {
      return { scheduled: false, reason: 'past_due_date' };
    }

    if (!isWithinNext24Hours(task.due_date)) {
      return { scheduled: false, reason: 'too_far' };
    }

    const Notifications = await loadNotificationsModule();
    if (!Notifications) {
      return { scheduled: false, reason: 'unavailable_in_expo_go' };
    }

    const allowed = await hasPermission();
    if (!allowed) {
      return { scheduled: false, reason: 'permission_denied' };
    }

    const triggerTimestamp = Math.max(Date.now() + 5_000, dueDate.getTime() - 30 * 60 * 1000);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Echeance proche',
        body: `La tache "${task.title}" est prevue a ${formatDateTime(task.due_date)}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerTimestamp),
      },
    });

    await storageService.setTaskNotification(task.id, notificationId);

    return { scheduled: true, message: 'Rappel programme.' };
  },
};
