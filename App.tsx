import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import EventsScreen from './src/screens/EventsScreen';
import ClubsScreen from './src/screens/ClubsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ManageStudentsScreen from './src/screens/ManageStudentsScreen';

// Admin Screens
import AddAssignmentScreen from './src/screens/AddAssignmentScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import SendNotificationScreen from './src/screens/SendNotificationScreen';

// Services
import { StorageService } from './src/services/storageService';
import { AuthService } from './src/services/authService';

// Types
import { User } from './src/types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={styles.errorHint}>
            Please restart the app or contact support
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
    // Firebase connection check
    try {
      const auth = getAuth();
      const db = getFirestore();
      if (auth && db) {
        console.log('✅ Firebase is connected!');
        Alert.alert('Firebase Connected', 'Your app is connected to Firebase!');
      }
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      Alert.alert('Firebase Error', 'Could not connect to Firebase.');
    }
  }, []);

  const initializeApp = async () => {
    try {
      console.log('App: Initializing app...');
      // Initialize sample data
      await StorageService.initializeSampleData();
      console.log('App: Sample data initialized');
      
      // Check authentication
      const user = await AuthService.getCurrentUser();
      console.log('App: Current user check result:', user);
      if (user) {
        console.log('App: User found, setting authenticated state');
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        console.log('App: No user found, staying on login screen');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to initialize app. Please restart.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    console.log('App: Login successful for user:', user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.errorHint}>Please restart the app</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show login or register screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          {showRegister ? (
            <RegisterScreen 
              onRegisterSuccess={handleRegisterSuccess} 
              onBackToLogin={handleBackToLogin} 
            />
          ) : (
            <LoginScreen 
              onLoginSuccess={handleLoginSuccess} 
              onShowRegister={handleShowRegister} 
            />
          )}
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  // Admin Stack Navigator
  const AdminStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        initialParams={{ user: currentUser }}
      />
      <Stack.Screen 
        name="AddAssignment" 
        component={AddAssignmentScreen}
        initialParams={{ user: currentUser }}
      />
      <Stack.Screen 
        name="AddEvent" 
        component={AddEventScreen}
        initialParams={{ user: currentUser }}
      />
      <Stack.Screen 
        name="SendNotification" 
        component={SendNotificationScreen}
        initialParams={{ user: currentUser }}
      />
      <Stack.Screen 
        name="ManageStudents" 
        component={ManageStudentsScreen}
      />
    </Stack.Navigator>
  );

  // Student Stack Navigator
  const StudentStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="StudentDashboard" 
        component={DashboardScreen}
        initialParams={{ user: currentUser }}
      />
    </Stack.Navigator>
  );

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Dashboard') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Calendar') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Events') {
                  iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'Clubs') {
                  iconName = focused ? 'people' : 'people-outline';
                } else if (route.name === 'Notifications') {
                  iconName = focused ? 'notifications' : 'notifications-outline';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                } else {
                  iconName = 'help-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#2563eb',
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopColor: '#e2e8f0',
                paddingBottom: 5,
                paddingTop: 5,
                height: 60,
              },
              tabBarPressColor: '#2563eb20',
              tabBarPressOpacity: 0.7,
            })}
          >
            <Tab.Screen 
              name="Dashboard" 
              component={currentUser?.role === 'admin' ? AdminStack : StudentStack}
              options={{ title: 'Dashboard' }}
            />
            <Tab.Screen 
              name="Calendar" 
              component={CalendarScreen}
              options={{ title: 'Calendar' }}
            />
            <Tab.Screen 
              name="Events" 
              component={EventsScreen}
              options={{ title: 'Events' }}
            />
            <Tab.Screen 
              name="Clubs" 
              component={ClubsScreen}
              options={{ title: 'Clubs' }}
            />
            <Tab.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ title: 'Notifications' }}
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
});
