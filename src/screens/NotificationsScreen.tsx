import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES } from '../utils/constants';
import { Notification } from '../types';
import { listenToNotifications } from '../services/firebaseService';
import { getTimeAgo } from '../utils/dateUtils';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Real-time Firestore updates
    const unsubscribe = listenToNotifications((notifications) => {
      setNotifications(notifications);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedFilter]);

  const filterNotifications = () => {
    if (selectedFilter === 'all') {
      setFilteredNotifications(notifications);
    } else if (selectedFilter === 'unread') {
      setFilteredNotifications(notifications.filter(notification => !notification.isRead));
    } else {
      setFilteredNotifications(notifications.filter(notification => notification.type === selectedFilter));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // No longer need to load notifications from storage, as they are real-time
    setRefreshing(false);
  };

  const markAsRead = (notificationId: string) => {
    // Update Firestore directly
    // For now, we'll just remove it from the local state if it's read
    const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
    setNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: () => {
            // Update Firestore directly
            setNotifications([]); // Clear all notifications
          },
        },
      ]
    );
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Update Firestore directly
            const updatedNotifications = notifications.filter(
              notification => notification.id !== notificationId
            );
            setNotifications(updatedNotifications);
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    Alert.alert(
      notification.title,
      notification.message,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notification.id),
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'time';
      case 'update':
        return 'refresh';
      case 'event':
        return 'calendar';
      case 'assignment':
        return 'document-text';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return COLORS.warning;
      case 'update':
        return COLORS.primary;
      case 'event':
        return COLORS.success;
      case 'assignment':
        return COLORS.error;
      default:
        return COLORS.secondary;
    }
  };

  const renderNotificationCard = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.notificationIcon, { backgroundColor: getNotificationColor(item.type) + '20' }]}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>
        <View style={styles.notificationActions}>
          {!item.isRead && (
            <View style={styles.unreadDot} />
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteNotification(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'notifications' },
    { key: 'unread', label: 'Unread', icon: 'mail-unread' },
    { key: 'reminder', label: 'Reminders', icon: 'time' },
    { key: 'event', label: 'Events', icon: 'calendar' },
    { key: 'assignment', label: 'Assignments', icon: 'document-text' },
  ];

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={20} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.key ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter.key && styles.filterTabTextActive
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all' ? 'No notifications' : `No ${selectedFilter} notifications`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? 'You\'re all caught up! Check back later for updates.'
                : `No ${selectedFilter} notifications found.`
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: SIZES.md,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  markAllButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    gap: SPACING.xs,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary + '20',
  },
  filterTabText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  notificationsList: {
    padding: SPACING.lg,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  unreadText: {
    color: COLORS.primary,
  },
  notificationMessage: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  notificationActions: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
}); 