import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING, SIZES, FONTS } from '../utils/constants';
import { Event, Deadline, User } from '../types';
import { StorageService } from '../services/storageService';
import { formatDate, getRelativeDate, getDaysUntil } from '../utils/dateUtils';
import { listenToAssignments, listenToEvents } from '../services/firebaseService';

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    studentId: '',
  });

  useEffect(() => {
    // Real-time Firestore updates
    const unsubAssignments = listenToAssignments((assignments) => {
      setUpcomingDeadlines(assignments.filter(deadline => {
        const due = new Date(deadline.dueDate);
        return due > new Date() && due <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && !deadline.isCompleted;
      }).slice(0, 5));
    });
    const unsubEvents = listenToEvents((events) => {
      setUpcomingEvents(events.filter(event => {
        const start = new Date(event.startDate);
        return start > new Date() && start <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }).slice(0, 5));
    });
    return () => {
      unsubAssignments();
      unsubEvents();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // No longer needed as data is real-time
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleAddEvent = () => {
    if (user?.role === 'admin') {
      Alert.alert('Add Event', 'Navigate to Events tab to add new events');
    } else {
      Alert.alert('View Only', 'Only administrators can add events. Please contact your admin.');
    }
  };

  const handleAddDeadline = () => {
    if (user?.role === 'admin') {
      Alert.alert('Add Deadline', 'Navigate to Calendar tab to add new assignments/deadlines');
    } else {
      Alert.alert('View Only', 'Only administrators can add deadlines. Please contact your admin.');
    }
  };

  const handleJoinClub = () => {
    Alert.alert('Join Club', 'Navigate to Clubs tab to join student organizations');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Navigate to Profile tab to access settings');
  };

  const handleProfile = () => {
    setShowProfileModal(true);
  };

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year?.toString() || '',
        studentId: user.studentId || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      const updatedUser = {
        ...user,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        department: editForm.department.trim(),
        year: parseInt(editForm.year) || user?.year || 1,
        studentId: editForm.studentId.trim(),
      };

      await StorageService.saveUser(updatedUser);
      setUser(updatedUser);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeData('campus_copilot_user');
              // The App.tsx will handle navigation back to login
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleSeeAllEvents = () => {
    Alert.alert('All Events', 'This feature will be implemented soon!');
  };

  const handleSeeAllDeadlines = () => {
    Alert.alert('All Deadlines', 'This feature will be implemented soon!');
  };

  const handleEventPress = (event: Event) => {
    Alert.alert('Event Details', `${event.title}\n\n${event.description}`);
  };

  const handleDeadlinePress = (deadline: Deadline) => {
    Alert.alert('Deadline Details', `${deadline.title}\n\n${deadline.description}`);
  };

  const handleStatPress = (statName: string) => {
    Alert.alert('Stat Pressed', `You pressed on ${statName}`);
  };

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setShowProfileModal(false)}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* User Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons 
                name={user?.role === 'admin' ? 'shield-checkmark' : 'person'} 
                size={60} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>{user?.role === 'admin' ? 'Administrator' : 'Student'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {user?.department && (
              <Text style={styles.profileDepartment}>{user?.department}</Text>
            )}
            {user?.studentId && (
              <Text style={styles.profileId}>ID: {user?.studentId}</Text>
            )}
          </View>

          {/* Profile Actions */}
          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.profileAction} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={24} color={COLORS.primary} />
              <Text style={styles.profileActionText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileAction} onPress={handleSettings}>
              <Ionicons name="settings-outline" size={24} color={COLORS.secondary} />
              <Text style={styles.profileActionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileAction} onPress={() => Alert.alert('Help', 'Help and support will be available soon!')}>
              <Ionicons name="help-circle-outline" size={24} color={COLORS.success} />
              <Text style={styles.profileActionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileAction} onPress={() => Alert.alert('About', 'Campus Copilot v1.0.0\nYour college management companion')}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.warning} />
              <Text style={styles.profileActionText}>About</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your department"
              value={editForm.department}
              onChangeText={(text) => setEditForm({ ...editForm, department: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Year of Study</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your year (1-4)"
              value={editForm.year}
              onChangeText={(text) => setEditForm({ ...editForm, year: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Student ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your student ID"
              value={editForm.studentId}
              onChangeText={(text) => setEditForm({ ...editForm, studentId: text })}
              autoCapitalize="characters"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
            <Text style={styles.subtitle}>Your personal college assistant</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
            <Ionicons name="person-circle" size={40} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCard} onPress={() => handleStatPress('Events')}>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{upcomingEvents.length}</Text>
            <Text style={styles.statLabel}>Today's Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => handleStatPress('Deadlines')}>
            <Ionicons name="time" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>{upcomingDeadlines.length}</Text>
            <Text style={styles.statLabel}>Upcoming Deadlines</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => handleStatPress('Notifications')}>
            <Ionicons name="notifications" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>New Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddEvent}>
              <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Add Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddDeadline}>
              <Ionicons name="document-text" size={32} color={COLORS.warning} />
              <Text style={styles.actionText}>Add Deadline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleJoinClub}>
              <Ionicons name="people" size={32} color={COLORS.success} />
              <Text style={styles.actionText}>Join Club</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
              <Ionicons name="settings" size={32} color={COLORS.secondary} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={handleSeeAllEvents}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => handleEventPress(event)}>
                <View style={styles.eventIcon}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={20} 
                    color={COLORS.primary} 
                  />
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>
                    {formatDate(event.startDate, 'MMM dd, HH:mm')}
                  </Text>
                  {event.location && (
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  )}
                </View>
                <View style={styles.eventStatus}>
                  <Text style={styles.eventDays}>
                    {getDaysUntil(event.startDate)}d
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.secondary} />
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          )}
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <TouchableOpacity onPress={handleSeeAllDeadlines}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.map((deadline) => (
              <TouchableOpacity key={deadline.id} style={styles.deadlineCard} onPress={() => handleDeadlinePress(deadline)}>
                <View style={styles.deadlineIcon}>
                  <Ionicons 
                    name="time-outline" 
                    size={20} 
                    color={COLORS.warning} 
                  />
                </View>
                <View style={styles.deadlineContent}>
                  <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                  <Text style={styles.deadlineSubject}>{deadline.subject}</Text>
                  <Text style={styles.deadlineTime}>
                    Due: {formatDate(deadline.dueDate, 'MMM dd, HH:mm')}
                  </Text>
                </View>
                <View style={styles.deadlineStatus}>
                  <Text style={styles.deadlineDays}>
                    {getDaysUntil(deadline.dueDate)}d
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={COLORS.secondary} />
              <Text style={styles.emptyText}>No upcoming deadlines</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Profile Modal */}
      {renderProfileModal()}

      {/* Edit Profile Modal */}
      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    // Add shadow for depth
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: SIZES.md,
    color: 'white',
    opacity: 0.9,
    fontFamily: FONTS.regular,
  },
  userName: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: 'white',
    opacity: 0.8,
    marginTop: SPACING.xs,
    fontFamily: FONTS.medium,
  },
  profileButton: {
    padding: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontFamily: FONTS.medium,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: SIZES.sm,
    color: COLORS.accent,
    fontWeight: '500',
    fontFamily: FONTS.medium,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 16,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: {
    fontSize: SIZES.sm,
    color: COLORS.secondary,
    fontFamily: FONTS.medium,
    marginTop: SPACING.xs,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  eventTime: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  eventLocation: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  eventStatus: {
    alignItems: 'center',
  },
  eventDays: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  deadlineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deadlineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  deadlineSubject: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  deadlineTime: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  deadlineStatus: {
    alignItems: 'center',
  },
  deadlineDays: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  profileRole: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  profileDepartment: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  profileId: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  profileActions: {
    marginBottom: SPACING.lg,
  },
  profileAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileActionText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.error + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutButtonText: {
    marginLeft: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    fontSize: SIZES.md,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
  },
}); 