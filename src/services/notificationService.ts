import * as Notifications from 'expo-notifications';

import { Task } from '../types/task';
import { formatDateTime, isWithinNext24Hours } from '../utils/date';
import { storageService } from './storageService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationResult =
  | { scheduled: true; message: string }
  | { scheduled: false; reason: 'no_due_date' | 'past_due_date' | 'too_far' | 'permission_denied' };

const hasPermission = async (): Promise<boolean> => {
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
      await Notifications.cancelScheduledNotificationAsync(existingId);
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
