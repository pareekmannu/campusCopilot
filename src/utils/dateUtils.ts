import { COLORS } from './constants';

export const formatDate = (date: Date, format: string = 'MMM dd, yyyy'): string => {
  const options: Intl.DateTimeFormatOptions = {};
  
  if (format.includes('MMM')) options.month = 'short';
  if (format.includes('dd')) options.day = '2-digit';
  if (format.includes('yyyy')) options.year = 'numeric';
  if (format.includes('HH')) options.hour = '2-digit';
  if (format.includes('mm')) options.minute = '2-digit';
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const formatTime = (date: Date, formatString: string = 'HH:mm'): string => {
  return formatDate(date, formatString);
};

export const formatDateTime = (date: Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

// Helper functions
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getRelativeDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return formatDate(date);
};

export const getDaysUntil = (date: Date): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (date: Date): boolean => {
  return new Date() > date;
};

export const getWeekDays = (): string[] => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(addDays(firstDay, -i - 1));
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add days from next month to fill last week
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
    days.push(addDays(lastDay, i));
  }
  
  return days;
};

export const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return COLORS.error;
    case 'medium':
      return COLORS.warning;
    case 'low':
      return COLORS.success;
    default:
      return COLORS.secondary;
  }
};

export const getEventTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'class':
      return COLORS.primary;
    case 'exam':
      return COLORS.error;
    case 'club':
      return COLORS.success;
    case 'event':
      return COLORS.secondary;
    default:
      return COLORS.textSecondary;
  }
}; 