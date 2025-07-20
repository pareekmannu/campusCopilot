import * as Calendar from 'expo-calendar';
import { Event, CalendarEvent } from '../types';

export class CalendarService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  }

  static async getCalendars(): Promise<Calendar.Calendar[]> {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      return calendars;
    } catch (error) {
      console.error('Error getting calendars:', error);
      return [];
    }
  }

  static async getDefaultCalendar(): Promise<Calendar.Calendar | null> {
    try {
      const calendars = await this.getCalendars();
      const defaultCalendar = calendars.find(calendar => 
        calendar.isPrimary || calendar.source.name === 'Default'
      );
      return defaultCalendar || calendars[0] || null;
    } catch (error) {
      console.error('Error getting default calendar:', error);
      return null;
    }
  }

  static async createCalendarEvent(event: Event): Promise<string | null> {
    try {
      const calendar = await this.getDefaultCalendar();
      if (!calendar) {
        console.error('No calendar available');
        return null;
      }

      const eventDetails: any = {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        notes: event.description,
        alarms: event.reminderTime ? [
          {
            relativeOffset: -15, // 15 minutes before
            method: Calendar.AlarmMethod.ALERT,
          }
        ] : undefined,
      };

      const eventId = await Calendar.createEventAsync(calendar.id, eventDetails);
      return eventId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  static async updateCalendarEvent(eventId: string, event: Event): Promise<boolean> {
    try {
      const eventDetails: any = {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        notes: event.description,
        alarms: event.reminderTime ? [
          {
            relativeOffset: -15,
            method: Calendar.AlarmMethod.ALERT,
          }
        ] : undefined,
      };

      await Calendar.updateEventAsync(eventId, eventDetails);
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return false;
    }
  }

  static async deleteCalendarEvent(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  static async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const calendar = await this.getDefaultCalendar();
      if (!calendar) return [];

      const events = await Calendar.getEventsAsync([calendar.id], startDate, endDate);
      
      return events.map(event => ({
        id: event.id,
        title: event.title,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        location: event.location || undefined,
        notes: event.notes,
        color: (event as any).color,
      }));
    } catch (error) {
      console.error('Error getting calendar events:', error);
      return [];
    }
  }

  static async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getEvents(startOfDay, endOfDay);
  }

  static async getWeekEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.getEvents(startOfWeek, endOfWeek);
  }

  static async syncEventsWithCalendar(events: Event[]): Promise<void> {
    try {
      for (const event of events) {
        if (!event.id.includes('calendar_')) {
          const calendarEventId = await this.createCalendarEvent(event);
          if (calendarEventId) {
            // Update the event with calendar ID
            event.id = `calendar_${calendarEventId}`;
          }
        }
      }
    } catch (error) {
      console.error('Error syncing events with calendar:', error);
    }
  }

  static async createReminder(event: Event, minutesBefore: number = 15): Promise<string | null> {
    try {
      const reminderTime = new Date(event.startDate.getTime() - minutesBefore * 60 * 1000);
      
      const calendar = await this.getDefaultCalendar();
      if (!calendar) return null;

      const eventDetails: any = {
        title: `Reminder: ${event.title}`,
        startDate: reminderTime,
        endDate: new Date(reminderTime.getTime() + 5 * 60 * 1000), // 5 minutes duration
        notes: `Reminder for: ${event.title}`,
        alarms: [
          {
            relativeOffset: 0,
            method: Calendar.AlarmMethod.ALERT,
          }
        ],
      };

      const reminderId = await Calendar.createEventAsync(calendar.id, eventDetails);
      return reminderId;
    } catch (error) {
      console.error('Error creating reminder:', error);
      return null;
    }
  }

  static async checkCalendarAvailability(startDate: Date, endDate: Date): Promise<boolean> {
    try {
      const events = await this.getEvents(startDate, endDate);
      return events.length === 0;
    } catch (error) {
      console.error('Error checking calendar availability:', error);
      return true;
    }
  }

  static async getNextEvent(): Promise<CalendarEvent | null> {
    try {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      const events = await this.getEvents(now, endOfDay);
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      console.error('Error getting next event:', error);
      return null;
    }
  }
} 