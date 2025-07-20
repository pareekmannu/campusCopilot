import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Event, Deadline } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }
      
      return true;
    } else {
      console.log('Must use physical device for Push Notifications');
      return false;
    }
  }

  static async getExpoPushToken(): Promise<string | null> {
    try {
      // Note: Push notifications are limited in Expo Go
      // For full functionality, use a development build
      console.log('Push notifications are limited in Expo Go. Use development build for full functionality.');
      return null;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  static async scheduleEventReminder(event: Event): Promise<string | null> {
    if (!event.reminderTime) return null;

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder',
          body: `${event.title} starts in 15 minutes`,
          data: { 
            type: 'event',
            eventId: event.id,
            title: event.title,
            location: event.location,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: event.reminderTime,
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling event reminder:', error);
      return null;
    }
  }

  static async scheduleDeadlineReminder(deadline: Deadline): Promise<string | null> {
    if (!deadline.reminderTime) return null;

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Deadline Reminder',
          body: `${deadline.title} is due soon!`,
          data: { 
            type: 'deadline',
            deadlineId: deadline.id,
            title: deadline.title,
            subject: deadline.subject,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: deadline.reminderTime,
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling deadline reminder:', error);
      return null;
    }
  }

  static async scheduleCustomReminder(
    title: string,
    body: string,
    date: Date,
    data?: any
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling custom reminder:', error);
      return null;
    }
  }

  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  static async addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Promise<Notifications.Subscription> {
    return Notifications.addNotificationReceivedListener(listener);
  }

  static async addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Promise<Notifications.Subscription> {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  static async removeNotificationSubscription(
    subscription: Notifications.Subscription
  ): Promise<void> {
    subscription.remove();
  }

  // Helper method to create reminder time
  static createReminderTime(eventDate: Date, minutesBefore: number = 15): Date {
    return new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
  }

  // Helper method to check if notification is scheduled
  static async isNotificationScheduled(identifier: string): Promise<boolean> {
    try {
      const notifications = await this.getScheduledNotifications();
      return notifications.some(notification => notification.identifier === identifier);
    } catch (error) {
      console.error('Error checking if notification is scheduled:', error);
      return false;
    }
  }
} 