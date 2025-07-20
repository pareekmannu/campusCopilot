import { Event, Deadline, User } from '../types';

export const sampleUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@college.edu',
  college: 'Tech University',
  year: 3,
  avatar: undefined,
};

export const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Computer Science Lecture',
    description: 'Advanced Algorithms and Data Structures',
    startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    endDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    location: 'Room 301, Engineering Building',
    type: 'class',
    priority: 'high',
    isCompleted: false,
    reminderTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000), // 1.5 hours from now
  },
  {
    id: '2',
    title: 'Coding Club Meeting',
    description: 'Weekly coding challenges and project discussions',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
    location: 'Student Center, Room 205',
    type: 'club',
    priority: 'medium',
    isCompleted: false,
    reminderTime: new Date(Date.now() + 23 * 60 * 60 * 1000), // 1 hour before
  },
  {
    id: '3',
    title: 'Midterm Exam - Database Systems',
    description: 'Comprehensive exam covering SQL, normalization, and database design',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 3 days + 2 hours
    location: 'Exam Hall A',
    type: 'exam',
    priority: 'high',
    isCompleted: false,
    reminderTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 1 day before
  },
];

export const sampleDeadlines: Deadline[] = [
  {
    id: '1',
    title: 'Web Development Project',
    description: 'Create a responsive website using HTML, CSS, and JavaScript',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    subject: 'Web Technologies',
    type: 'project',
    priority: 'high',
    isCompleted: false,
    reminderTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 1 day before
  },
  {
    id: '2',
    title: 'Research Paper - AI Ethics',
    description: 'Write a 10-page research paper on ethical considerations in AI development',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    subject: 'Ethics in Technology',
    type: 'assignment',
    priority: 'medium',
    isCompleted: false,
    reminderTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 1 day before
  },
  {
    id: '3',
    title: 'Group Presentation - Machine Learning',
    description: 'Present findings on recent advances in machine learning algorithms',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    subject: 'Machine Learning',
    type: 'presentation',
    priority: 'medium',
    isCompleted: false,
    reminderTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 1 day before
  },
];

export const initializeSampleData = async () => {
  const { StorageService } = await import('../services/storageService');
  
  // Save sample data
  await StorageService.saveUser(sampleUser);
  await StorageService.saveEvents(sampleEvents);
  await StorageService.saveDeadlines(sampleDeadlines);
  
  console.log('Sample data initialized successfully!');
}; 