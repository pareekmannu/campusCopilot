import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event, Assignment, Club, Notification, User } from '../types';

// Sample data for demonstration
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Computer Science Lecture',
    description: 'Introduction to Data Structures and Algorithms',
    startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    endDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    location: 'Room 301, Engineering Building',
    type: 'class',
    priority: 'high',
    isCompleted: false,
    createdBy: 'current-user',
  },
  {
    id: '2',
    title: 'Math Quiz',
    description: 'Calculus II - Chapter 3 Quiz',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
    location: 'Room 205, Science Building',
    type: 'exam',
    priority: 'high',
    isCompleted: false,
    createdBy: 'current-user',
  },
  {
    id: '3',
    title: 'Coding Club Meeting',
    description: 'Weekly meeting to discuss new projects',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 3 days + 2 hours
    location: 'Student Center, Room 101',
    type: 'club',
    priority: 'medium',
    isCompleted: false,
    createdBy: 'current-user',
  },
];

const sampleAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Data Structures Project',
    description: 'Implement a binary search tree with insertion, deletion, and traversal operations',
    subject: 'Computer Science',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: 'high',
    isCompleted: false,
    submittedAt: null,
    createdBy: 'current-user',
  },
  {
    id: '2',
    title: 'Calculus Homework',
    description: 'Complete exercises 1-15 from Chapter 3',
    subject: 'Mathematics',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    priority: 'medium',
    isCompleted: false,
    submittedAt: null,
    createdBy: 'current-user',
  },
  {
    id: '3',
    title: 'Research Paper',
    description: 'Write a 10-page research paper on machine learning applications',
    subject: 'Computer Science',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    priority: 'low',
    isCompleted: false,
    submittedAt: null,
    createdBy: 'current-user',
  },
];

const sampleClubs: Club[] = [
  {
    id: '1',
    name: 'Coding Club',
    description: 'A community of programming enthusiasts who share knowledge and work on exciting projects together.',
    events: [],
    members: ['current-user', 'user2', 'user3'],
    isMember: true,
    adminId: 'user2',
  },
  {
    id: '2',
    name: 'Debate Society',
    description: 'Develop public speaking skills and engage in intellectual discussions on various topics.',
    events: [],
    members: ['user4', 'user5', 'user6'],
    isMember: false,
    adminId: 'user4',
  },
  {
    id: '3',
    name: 'Photography Club',
    description: 'Capture beautiful moments and learn photography techniques from experienced members.',
    events: [],
    members: ['current-user', 'user7', 'user8'],
    isMember: true,
    adminId: 'user7',
  },
];

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Assignment Due Soon',
    message: 'Your Data Structures Project is due in 2 days. Don\'t forget to submit!',
    type: 'reminder',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
  },
  {
    id: '2',
    title: 'New Event Added',
    message: 'A new coding workshop has been scheduled for next week.',
    type: 'event',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
  },
  {
    id: '3',
    title: 'Club Meeting Reminder',
    message: 'Coding Club meeting starts in 30 minutes at Student Center.',
    type: 'reminder',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: false,
  },
];

export class StorageService {
  // Events
  static async getEvents(): Promise<Event[]> {
    try {
      const events = await AsyncStorage.getItem('events');
      if (events) {
        const parsedEvents = JSON.parse(events);
        // Convert date strings back to Date objects
        return parsedEvents.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
        }));
      }
      // Return sample data if no events exist
      await this.saveEvents(sampleEvents);
      return sampleEvents;
    } catch (error) {
      console.error('Error getting events:', error);
      return sampleEvents;
    }
  }

  static async saveEvents(events: Event[]): Promise<void> {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }

  // Assignments
  static async getAssignments(): Promise<Assignment[]> {
    try {
      const assignments = await AsyncStorage.getItem('assignments');
      if (assignments) {
        const parsedAssignments = JSON.parse(assignments);
        // Convert date strings back to Date objects
        return parsedAssignments.map((assignment: any) => ({
          ...assignment,
          dueDate: new Date(assignment.dueDate),
          submittedAt: assignment.submittedAt ? new Date(assignment.submittedAt) : null,
        }));
      }
      // Return sample data if no assignments exist
      await this.saveAssignments(sampleAssignments);
      return sampleAssignments;
    } catch (error) {
      console.error('Error getting assignments:', error);
      return sampleAssignments;
    }
  }

  static async saveAssignments(assignments: Assignment[]): Promise<void> {
    try {
      await AsyncStorage.setItem('assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  }

  // Clubs
  static async getClubs(): Promise<Club[]> {
    try {
      const clubs = await AsyncStorage.getItem('clubs');
      if (clubs) {
        return JSON.parse(clubs);
      }
      // Return sample data if no clubs exist
      await this.saveClubs(sampleClubs);
      return sampleClubs;
    } catch (error) {
      console.error('Error getting clubs:', error);
      return sampleClubs;
    }
  }

  static async saveClubs(clubs: Club[]): Promise<void> {
    try {
      await AsyncStorage.setItem('clubs', JSON.stringify(clubs));
    } catch (error) {
      console.error('Error saving clubs:', error);
    }
  }

  // Notifications
  static async getNotifications(): Promise<Notification[]> {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      if (notifications) {
        const parsedNotifications = JSON.parse(notifications);
        // Convert date strings back to Date objects
        return parsedNotifications.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
        }));
      }
      // Return sample data if no notifications exist
      await this.saveNotifications(sampleNotifications);
      return sampleNotifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return sampleNotifications;
    }
  }

  static async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Settings
  static async getSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        return JSON.parse(settings);
      }
      // Return default settings if none exist
      const defaultSettings = {
        notifications: true,
        darkMode: false,
        autoSync: true,
        reminderTime: 30,
        language: 'English',
      };
      await this.saveSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        notifications: true,
        darkMode: false,
        autoSync: true,
        reminderTime: 30,
        language: 'English',
      };
    }
  }

  static async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // User data
  static async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async saveUserData(userData: User): Promise<void> {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Clear all data (for logout)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'events',
        'assignments',
        'clubs',
        'notifications',
        'settings',
        'userData',
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Initialize sample data
  static async initializeSampleData(): Promise<void> {
    try {
      await this.saveEvents(sampleEvents);
      await this.saveAssignments(sampleAssignments);
      await this.saveClubs(sampleClubs);
      await this.saveNotifications(sampleNotifications);
      console.log('Sample data initialized successfully!');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
} 