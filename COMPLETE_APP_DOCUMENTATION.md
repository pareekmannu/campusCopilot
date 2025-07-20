# Campus Copilot - Complete App Documentation

## Overview
Campus Copilot is a comprehensive college management mobile application built with React Native and Expo. The app provides students and administrators with tools to manage academic life, including events, assignments, clubs, notifications, and more.

## Features

### 🔐 Authentication System
- **Role-based login**: Admin and Student roles
- **Registration**: Complete user registration with college information
- **Profile management**: Edit personal information
- **Secure logout**: Proper session management

### 📅 Events Management
- **Create events**: Add new events with title, description, location, type, and priority
- **Event types**: Class, Exam, Club, General Events
- **Priority levels**: High, Medium, Low
- **Date/time picker**: Select start and end times
- **Filter events**: Filter by type (All, Classes, Exams, Clubs, Events)
- **Mark complete**: Track event completion status
- **Delete events**: Remove unwanted events

### 📚 Assignments Management
- **Create assignments**: Add assignments with subject, description, and due date
- **Priority tracking**: Set assignment priority levels
- **Due date management**: Track upcoming and overdue assignments
- **Completion tracking**: Mark assignments as completed
- **Filter options**: All, Pending, Completed, Overdue
- **Subject organization**: Organize by course/subject

### 👥 Clubs & Organizations
- **Discover clubs**: Browse available student organizations
- **Join/Leave clubs**: Easy membership management
- **Club categories**: Academic, Technology, Sports, Arts & Culture, Social
- **Create clubs**: Students can create new clubs
- **Member tracking**: View club membership and event counts
- **Tab navigation**: All Clubs vs My Clubs

### 🔔 Notifications System
- **Real-time notifications**: Stay updated with important information
- **Notification types**: Reminders, Updates, Events, Assignments
- **Read/Unread status**: Track notification status
- **Mark all as read**: Bulk notification management
- **Delete notifications**: Remove unwanted notifications
- **Filter options**: All, Unread, Reminders, Events, Assignments

### ⚙️ Settings & Preferences
- **Profile editing**: Update personal information
- **Notification preferences**: Toggle push notifications
- **Dark mode**: Switch between light and dark themes
- **Auto sync**: Background data synchronization
- **Language settings**: Multi-language support
- **Data management**: Export data and clear cache
- **Account management**: Logout and delete account

### 📊 Dashboard
- **Overview cards**: Quick stats and recent activities
- **Upcoming events**: Next scheduled events
- **Pending assignments**: Due assignments
- **Quick actions**: Fast access to common tasks
- **Role-based content**: Different views for admin and students

### 📱 User Interface
- **Modern design**: Clean, intuitive interface
- **Gradient headers**: Beautiful visual elements
- **Card-based layout**: Organized information display
- **Interactive elements**: Touch feedback and animations
- **Responsive design**: Works on various screen sizes
- **Accessibility**: Proper contrast and touch targets

## Technical Architecture

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development
- **AsyncStorage**: Local data persistence
- **React Navigation**: Screen navigation
- **Expo Vector Icons**: Icon library

### State Management
- **React Hooks**: useState, useEffect for local state
- **AsyncStorage**: Persistent data storage
- **Service classes**: Organized data management

### Data Structure
```typescript
// User
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  college: string;
  department?: string;
  year?: number;
  studentId?: string;
}

// Event
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: 'class' | 'exam' | 'club' | 'event';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdBy: string;
}

// Assignment
interface Assignment {
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

// Club
interface Club {
  id: string;
  name: string;
  description: string;
  events: Event[];
  members: string[];
  isMember: boolean;
  adminId: string;
}

// Notification
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'update' | 'event' | 'assignment';
  timestamp: Date;
  isRead: boolean;
}
```

## Screen Structure

### Authentication Screens
1. **LoginScreen**: Email/password login with role selection
2. **RegisterScreen**: User registration with college information

### Main App Screens
1. **DashboardScreen**: Overview and quick actions
2. **EventsScreen**: Event management and creation
3. **AssignmentsScreen**: Assignment tracking and creation
4. **ClubsScreen**: Club discovery and management
5. **NotificationsScreen**: Notification center
6. **ProfileScreen**: User profile and settings
7. **SettingsScreen**: App preferences and configuration

### Admin Screens
1. **AdminDashboardScreen**: Admin-specific dashboard with management tools

## Services

### AuthService
- User authentication and registration
- Session management
- Role-based access control

### StorageService
- Local data persistence
- Sample data initialization
- Data synchronization

### DateUtils
- Date formatting and manipulation
- Time ago calculations
- Priority and type color mapping

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Install additional dependencies: `npm install @react-native-community/datetimepicker`
4. Start the development server: `npx expo start`
5. Run on device or simulator

### Dependencies
```json
{
  "@expo/vector-icons": "^13.0.0",
  "@react-native-async-storage/async-storage": "^1.19.0",
  "@react-native-community/datetimepicker": "^7.0.0",
  "expo": "~49.0.0",
  "expo-linear-gradient": "~12.3.0",
  "expo-status-bar": "~1.6.0",
  "react": "18.2.0",
  "react-native": "0.72.0",
  "react-native-safe-area-context": "4.6.3",
  "react-native-screens": "~3.22.0"
}
```

## Usage Guide

### For Students
1. **Registration**: Create account with college information
2. **Dashboard**: View upcoming events and assignments
3. **Events**: Create and manage personal events
4. **Assignments**: Track homework and project deadlines
5. **Clubs**: Discover and join student organizations
6. **Notifications**: Stay updated with important reminders
7. **Profile**: Manage personal information and settings

### For Administrators
1. **Admin Dashboard**: Access administrative tools
2. **Event Management**: Create and manage college-wide events
3. **Assignment Management**: Create assignments for students
4. **Club Oversight**: Monitor and manage student clubs
5. **User Management**: Manage student accounts and permissions

## Data Flow

1. **Authentication**: User logs in/registers
2. **Data Loading**: App loads user-specific data from storage
3. **User Interaction**: User performs actions (create, edit, delete)
4. **State Update**: Local state is updated immediately
5. **Persistence**: Changes are saved to AsyncStorage
6. **UI Update**: Interface reflects the changes

## Future Enhancements

### Planned Features
- **Backend Integration**: Real-time data synchronization
- **Push Notifications**: Real-time notifications
- **Calendar Integration**: Sync with device calendar
- **File Upload**: Assignment submission with files
- **Chat System**: Club and course communication
- **Analytics**: Progress tracking and insights
- **Offline Support**: Enhanced offline functionality

### Technical Improvements
- **State Management**: Redux or Context API for global state
- **Database**: SQLite or cloud database integration
- **API Layer**: RESTful API integration
- **Testing**: Unit and integration tests
- **Performance**: Optimization and caching
- **Security**: Enhanced authentication and encryption

## Troubleshooting

### Common Issues
1. **Metro bundler errors**: Clear cache with `npx expo start --clear`
2. **Dependency conflicts**: Delete node_modules and reinstall
3. **Date picker issues**: Ensure @react-native-community/datetimepicker is installed
4. **Storage errors**: Check AsyncStorage permissions

### Development Tips
- Use Expo Go for quick testing
- Enable hot reload for faster development
- Use console.log for debugging
- Test on both Android and iOS devices

## Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use consistent naming conventions
- Add proper error handling
- Include comments for complex logic
- Test on multiple devices

### Code Structure
- Components in `/src/components`
- Screens in `/src/screens`
- Services in `/src/services`
- Types in `/src/types`
- Utils in `/src/utils`

## License
This project is licensed under the MIT License.

---

**Campus Copilot v1.0.0** - Your all-in-one college management companion 