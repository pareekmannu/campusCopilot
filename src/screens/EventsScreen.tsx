import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, SIZES, FONTS } from '../utils/constants';
import { Event } from '../types';
import { listenToEvents, addEvent } from '../services/firebaseService';
import { formatDate, getEventTypeColor, getPriorityColor } from '../utils/dateUtils';
import { User } from '../types';


export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    type: 'event' as Event['type'],
    priority: 'medium' as Event['priority'],
  });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Add the missing filterEvents function
  const filterEvents = () => {
    if (selectedFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.type === selectedFilter));
    }
  };

  useEffect(() => {
    // Real-time Firestore updates
    const unsubscribe = listenToEvents((events) => {
      setEvents(events);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedFilter]);

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    try {
      await addEvent({
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        location: newEvent.location.trim(),
        startDate,
        endDate,
        type: newEvent.type,
        priority: newEvent.priority,
        isCompleted: false,
        createdAt: new Date(),
        // Optionally add createdBy: userId
      });
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Event created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add event.');
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      location: '',
      type: 'event',
      priority: 'medium',
    });
    setStartDate(new Date());
    setEndDate(new Date());
  };

  const handleEventPress = (event: Event) => {
    const actions = [
      { text: 'Close', style: 'cancel' },
    ];

    if (user?.role === 'admin') {
      actions.push(
        {
          text: 'Mark Complete',
          onPress: () => toggleEventComplete(event.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEvent(event.id),
        }
      );
    }

    Alert.alert(
      event.title,
      `${event.description}\n\nLocation: ${event.location || 'No location'}\nStart: ${formatDate(event.startDate, 'MMM dd, yyyy HH:mm')}\nEnd: ${formatDate(event.endDate, 'MMM dd, yyyy HH:mm')}\nType: ${event.type}\nPriority: ${event.priority}`,
      actions
    );
  };

  const handleFilterPress = (filter: string) => {
    console.log('Filter pressed:', filter);
    setSelectedFilter(filter);
  };

  const toggleEventComplete = (eventId: string) => {
    // This function needs to be updated to use Firestore
    // For now, it will just remove the event from the local state
    // and potentially re-fetch if needed for real-time updates
    const updatedEvents = events.map(event =>
      event.id === eventId ? { ...event, isCompleted: !event.isCompleted } : event
    );
    setEvents(updatedEvents);
    // StorageService.saveEvents(updatedEvents); // This line is removed
  };

  const deleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // This function needs to be updated to use Firestore
            // For now, it will just remove the event from the local state
            // and potentially re-fetch if needed for real-time updates
            const updatedEvents = events.filter(event => event.id !== eventId);
            setEvents(updatedEvents);
            // StorageService.saveEvents(updatedEvents); // This line is removed
          },
        },
      ]
    );
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[styles.eventCard, item.isCompleted && styles.completedEvent]}
      onPress={() => handleEventPress(item)}
    >
      <View style={styles.eventHeader}>
        <View style={[styles.eventTypeBadge, { backgroundColor: getEventTypeColor(item.type) }]}>
          <Text style={styles.eventTypeText}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
      
      <Text style={[styles.eventTitle, item.isCompleted && styles.completedText]}>
        {item.title}
      </Text>
      
      {item.description && (
        <Text style={[styles.eventDescription, item.isCompleted && styles.completedText]}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={[styles.eventDetailText, item.isCompleted && styles.completedText]}>
            {formatDate(item.startDate, 'MMM dd, HH:mm')}
          </Text>
        </View>
        
        {item.location && (
          <View style={styles.eventDetail}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={[styles.eventDetailText, item.isCompleted && styles.completedText]}>
              {item.location}
            </Text>
          </View>
        )}
      </View>
      
      {item.isCompleted && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.completedBadgeText}>Completed</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const filterOptions = [
    { key: 'all', label: 'All Events', icon: 'calendar' },
    { key: 'class', label: 'Classes', icon: 'school' },
    { key: 'exam', label: 'Exams', icon: 'document-text' },
    { key: 'club', label: 'Clubs', icon: 'people' },
    { key: 'event', label: 'Events', icon: 'star' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Manage campus events and activities</Text>
        </View>
        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color="white" />
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
            onPress={() => handleFilterPress(filter.key)}
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

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? 'Create your first event to get started'
                : `No ${selectedFilter} events found`
              }
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter event title"
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter event description"
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter event location"
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Type</Text>
              <View style={styles.typeButtons}>
                {['class', 'exam', 'club', 'event'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newEvent.type === type && styles.typeButtonActive
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, type: type as Event['type'] })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newEvent.type === type && styles.typeButtonTextActive
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newEvent.priority === priority && styles.priorityButtonActive
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, priority: priority as Event['priority'] })}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        newEvent.priority === priority && styles.priorityButtonTextActive
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {formatDate(startDate, 'MMM dd, yyyy HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {formatDate(endDate, 'MMM dd, yyyy HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddEvent}>
              <Text style={styles.saveButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="datetime"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="datetime"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
    fontFamily: FONTS.medium,
  },
  addButton: {
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
    backgroundColor: COLORS.card,
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
    fontFamily: FONTS.medium,
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  eventsList: {
    padding: SPACING.lg,
  },
  eventCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  completedEvent: {
    opacity: 0.6,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  eventTypeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: SIZES.xs,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: SIZES.xs,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  eventTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  eventDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.regular,
  },
  eventDetails: {
    gap: SPACING.xs,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventDetailText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completedBadgeText: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
    fontFamily: FONTS.medium,
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
    fontFamily: FONTS.bold,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.regular,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: SIZES.md,
    color: 'white',
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priorityButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  dateButtonText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: SIZES.md,
    color: 'white',
    fontWeight: '600',
  },
}); 