export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  year: number;
  avatar?: string;
  role: UserRole;
  department?: string;
  studentId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  type: 'class' | 'exam' | 'club' | 'deadline' | 'event';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  reminderTime?: Date;
  createdBy: string; // Admin ID who created it
  targetAudience?: 'all' | 'specific_department' | 'specific_year';
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  subject: string;
  type: 'assignment' | 'project' | 'exam' | 'presentation';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  reminderTime?: Date;
  createdBy: string; // Admin ID who created it
  targetAudience?: 'all' | 'specific_department' | 'specific_year';
  submissionLink?: string;
  maxMarks?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  submittedAt: Date | null;
  createdBy: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  events: Event[];
  members: string[];
  isMember: boolean;
  adminId: string; // Admin who manages the club
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'update' | 'event' | 'assignment';
  timestamp: Date;
  isRead: boolean;
  relatedId?: string;
  sentBy: string; // Admin ID who sent it
  targetAudience?: 'all' | 'specific_department' | 'specific_year';
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  color?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  reminderTime: number; // minutes before event
  calendarSync: boolean;
  language: string;
}

export interface AdminDashboard {
  totalStudents: number;
  totalEvents: number;
  totalAssignments: number;
  pendingSubmissions: number;
  recentActivities: Notification[];
}

export interface StudentDashboard {
  upcomingEvents: Event[];
  upcomingDeadlines: Deadline[];
  recentNotifications: Notification[];
  attendancePercentage: number;
} 