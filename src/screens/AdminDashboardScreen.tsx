import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';

import { COLORS, SPACING, SIZES } from '../utils/constants';
import { User, AdminDashboard } from '../types';
import { getEvents, getAssignments } from '../services/firebaseService';
import { formatDate, getTimeAgo } from '../utils/dateUtils';

interface AdminDashboardScreenProps {
  navigation: any;
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const route = useRoute();
  const user = route.params?.user as User;
  
  const [dashboardData, setDashboardData] = useState<AdminDashboard>({
    totalStudents: 0,
    totalEvents: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
    recentActivities: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('AdminDashboardScreen: User loaded:', user);
      loadDashboardData();
    } else {
      console.log('AdminDashboardScreen: No user data available');
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      console.log('AdminDashboardScreen: Loading dashboard data...');
      const [events, deadlines] = await Promise.all([
        getEvents(),
        getAssignments(),
      ]);

      console.log('AdminDashboardScreen: Data loaded - Events:', events.length, 'Assignments:', deadlines.length);

      setDashboardData({
        totalStudents: 150, // Demo data
        totalEvents: events.length,
        totalAssignments: deadlines.length,
        pendingSubmissions: 23, // Demo data
        recentActivities: [
          {
            id: '1',
            title: 'New Assignment Posted',
            message: 'Web Development Project assigned to CS Year 3',
            type: 'assignment',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: false,
            sentBy: user.id,
            targetAudience: 'specific_year',
          },
          {
            id: '2',
            title: 'Event Created',
            message: 'Tech Talk: AI in Education scheduled for tomorrow',
            type: 'event',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            isRead: false,
            sentBy: user.id,
            targetAudience: 'all',
          },
        ],
      });
      console.log('AdminDashboardScreen: Dashboard data set successfully');
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      // Set default data to prevent crashes
      setDashboardData({
        totalStudents: 150,
        totalEvents: 0,
        totalAssignments: 0,
        pendingSubmissions: 23,
        recentActivities: [],
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAddAssignment = () => {
    navigation.navigate('AddAssignment');
  };

  const handleAddEvent = () => {
    navigation.navigate('AddEvent');
  };

  const handleManageStudents = () => {
    navigation.navigate('ManageStudents');
  };

  const handleViewSubmissions = () => {
    navigation.navigate('ViewSubmissions');
  };

  const handleSendNotification = () => {
    navigation.navigate('SendNotification');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('Analytics');
  };

  const handleProfile = () => {
    navigation.navigate('AdminProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      {!user ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      ) : (
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
            <Text style={styles.greeting}>Welcome, {user.name}</Text>
            <Text style={styles.role}>Administrator</Text>
            <Text style={styles.department}>{user.department} Department</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
            <Ionicons name="shield-checkmark" size={40} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>{dashboardData.totalEvents}</Text>
            <Text style={styles.statLabel}>Active Events</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>{dashboardData.totalAssignments}</Text>
            <Text style={styles.statLabel}>Assignments</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={COLORS.error} />
            <Text style={styles.statNumber}>{dashboardData.pendingSubmissions}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddAssignment}>
              <Ionicons name="add-circle" size={32} color={COLORS.warning} />
              <Text style={styles.actionText}>Add Assignment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddEvent}>
              <Ionicons name="calendar" size={32} color={COLORS.success} />
              <Text style={styles.actionText}>Add Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleManageStudents}>
              <Ionicons name="people" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Manage Students</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleSendNotification}>
              <Ionicons name="notifications" size={32} color={COLORS.secondary} />
              <Text style={styles.actionText}>Send Notification</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={handleViewAnalytics}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons 
                    name={activity.type === 'assignment' ? 'document-text' : 'calendar'} 
                    size={20} 
                    color={COLORS.primary} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                  <Text style={styles.activityTime}>
                    {getTimeAgo(activity.timestamp)}
                  </Text>
                </View>
                <View style={styles.activityStatus}>
                  <View style={styles.statusDot} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color={COLORS.secondary} />
              <Text style={styles.emptyText}>No recent activities</Text>
            </View>
          )}
        </View>

        {/* Pending Submissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Submissions</Text>
            <TouchableOpacity onPress={handleViewSubmissions}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.submissionCard}>
            <View style={styles.submissionIcon}>
              <Ionicons name="time-outline" size={24} color={COLORS.warning} />
            </View>
            <View style={styles.submissionContent}>
              <Text style={styles.submissionTitle}>Web Development Project</Text>
              <Text style={styles.submissionInfo}>23 submissions pending review</Text>
              <Text style={styles.submissionDeadline}>Due: Tomorrow</Text>
            </View>
            <TouchableOpacity style={styles.reviewButton} onPress={handleViewSubmissions}>
              <Text style={styles.reviewButtonText}>Review</Text>
            </TouchableOpacity>
          </View>
                  </View>
        </ScrollView>
      )}
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
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: SIZES.lg,
    color: 'white',
    fontWeight: '600',
  },
  role: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
  },
  department: {
    fontSize: SIZES.sm,
    color: 'white',
    opacity: 0.8,
    marginTop: SPACING.xs,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
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
  },
  seeAllText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: SIZES.xs,
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  activityCard: {
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
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityMessage: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  activityTime: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  activityStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  submissionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  submissionContent: {
    flex: 1,
  },
  submissionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  submissionInfo: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  submissionDeadline: {
    fontSize: SIZES.xs,
    color: COLORS.warning,
    marginTop: SPACING.xs,
  },
  reviewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  reviewButtonText: {
    fontSize: SIZES.sm,
    color: 'white',
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
  },
}); 