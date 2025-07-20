export const COLORS = {
  primary: '#2563eb', // Deep blue
  primaryDark: '#1e40af', // Darker blue
  secondary: '#06b6d4', // Cyan
  accent: '#f472b6', // Pink accent
  success: '#22c55e', // Green
  warning: '#fbbf24', // Yellow
  error: '#ef4444', // Red
  background: '#f1f5f9', // Light gray-blue
  surface: '#ffffff',
  card: '#f9fafb', // Softer card background
  text: '#0f172a', // Dark blue-gray
  textSecondary: '#64748b', // Muted blue-gray
  border: '#e2e8f0',
  shadow: '#000000',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONTS = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
  light: 'Poppins-Light',
};

export const API_ENDPOINTS = {
  base: 'https://api.campuscopilot.com',
  events: '/events',
  deadlines: '/deadlines',
  clubs: '/clubs',
  notifications: '/notifications',
  user: '/user',
};

export const STORAGE_KEYS = {
  user: 'campus_copilot_user',
  settings: 'campus_copilot_settings',
  events: 'campus_copilot_events',
  deadlines: 'campus_copilot_deadlines',
  notifications: 'campus_copilot_notifications',
};

export const NOTIFICATION_TYPES = {
  deadline: 'deadline',
  event: 'event',
  reminder: 'reminder',
  update: 'update',
};

export const EVENT_TYPES = {
  class: 'class',
  exam: 'exam',
  club: 'club',
  deadline: 'deadline',
  event: 'event',
};

export const PRIORITY_LEVELS = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

export const REMINDER_TIMES = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
]; 