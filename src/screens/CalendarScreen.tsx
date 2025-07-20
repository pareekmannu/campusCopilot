import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../utils/constants';
import { Event, Assignment, User } from '../types';
import { listenToAssignments, listenToEvents, addAssignment, addEvent } from '../services/firebaseService';
import { formatDate, getEventTypeColor, getPriorityColor, getMonthDays, getWeekDays } from '../utils/dateUtils';

interface CalendarItem {
  id: string;
  title: string;
  type: 'event' | 'assignment';
  date: Date;
  color: string;
  priority: string;
  description?: string;
  location?: string;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<CalendarItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    location: '',
    type: 'event' as 'event' | 'assignment',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [itemDate, setItemDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Real-time Firestore updates
    const unsubAssignments = listenToAssignments((assignments) => {
      setCalendarItems((prev) => [
        ...prev.filter(item => item.type !== 'assignment'),
        ...assignments.map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          type: 'assignment' as 'assignment',
          date: new Date(assignment.dueDate),
          color: getPriorityColor(assignment.priority),
          priority: assignment.priority,
          description: assignment.description,
        }))
      ]);
    });
    const unsubEvents = listenToEvents((events) => {
      setCalendarItems((prev) => [
        ...prev.filter(item => item.type !== 'event'),
        ...events.map(event => ({
          id: event.id,
          title: event.title,
          type: 'event' as 'event',
          date: new Date(event.startDate),
          color: getEventTypeColor(event.type),
          priority: event.priority,
          description: event.description,
          location: event.location,
        }))
      ]);
    });
    return () => {
      unsubAssignments();
      unsubEvents();
    };
  }, []);

  useEffect(() => {
    filterItemsForSelectedDate();
  }, [selectedDate, calendarItems]);

  const filterItemsForSelectedDate = () => {
    const items = calendarItems.filter(item => {
      const itemDate = new Date(item.date);
      const selected = new Date(selectedDate);
      return (
        itemDate.getDate() === selected.getDate() &&
        itemDate.getMonth() === selected.getMonth() &&
        itemDate.getFullYear() === selected.getFullYear()
      );
    });
    setSelectedItems(items);
  };

  const getItemsForDate = (date: Date) => {
    return calendarItems.filter(item => {
      const itemDate = new Date(item.date);
      const targetDate = new Date(date);
      return (
        itemDate.getDate() === targetDate.getDate() &&
        itemDate.getMonth() === targetDate.getMonth() &&
        itemDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    try {
      if (newItem.type === 'event') {
        await addEvent({
          title: newItem.title.trim(),
          description: newItem.description.trim(),
          startDate: itemDate,
          endDate: new Date(itemDate.getTime() + 60 * 60 * 1000),
          location: newItem.location.trim(),
          type: 'event',
          priority: newItem.priority,
          isCompleted: false,
          createdAt: new Date(),
        });
      } else {
        await addAssignment({
          title: newItem.title.trim(),
          description: newItem.description.trim(),
          subject: 'General',
          dueDate: itemDate,
          priority: newItem.priority,
          isCompleted: false,
          submittedAt: null,
          createdAt: new Date(),
        });
      }
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', `${newItem.type === 'event' ? 'Event' : 'Assignment'} created successfully!`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item.');
    }
  };

  const resetForm = () => {
    setNewItem({
      title: '',
      description: '',
      location: '',
      type: 'event',
      priority: 'medium',
    });
    setItemDate(new Date());
  };

  const handleItemPress = (item: CalendarItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleDeleteItem = async (item: CalendarItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (item.type === 'event') {
              // This part needs to be updated to use firebaseService for deletion
              // For now, we'll just remove it from the state, which won't persist
              // until the listener updates.
              setCalendarItems(prev => prev.filter(event => event.id !== item.id));
              Alert.alert('Info', 'Event deletion is not yet fully implemented for real-time updates.');
            } else {
              // This part needs to be updated to use firebaseService for deletion
              // For now, we'll just remove it from the state, which won't persist
              // until the listener updates.
              setCalendarItems(prev => prev.filter(assignment => assignment.id !== item.id));
              Alert.alert('Info', 'Assignment deletion is not yet fully implemented for real-time updates.');
            }
            // setShowItemModal(false); // This line was removed as per the new_code
          },
        },
      ]
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendarDay = (date: Date, isCurrentMonth: boolean) => {
    const items = getItemsForDate(date);
    const isSelected = selectedDate.toDateString() === date.toDateString();
    const isToday = new Date().toDateString() === date.toDateString();

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.calendarDay,
          isSelected && styles.selectedDay,
          isToday && styles.today,
          !isCurrentMonth && styles.otherMonth,
        ]}
        onPress={() => handleDateSelect(date)}
      >
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.selectedDayText,
            isToday && styles.todayText,
            !isCurrentMonth && styles.otherMonthText,
          ]}
        >
          {date.getDate()}
        </Text>
        {items.length > 0 && (
          <View style={styles.dayIndicators}>
            {items.slice(0, 3).map((item, index) => (
              <View
                key={`${item.id}-${index}`}
                style={[styles.dayIndicator, { backgroundColor: item.color }]}
              />
            ))}
            {items.length > 3 && (
              <Text style={styles.moreIndicator}>+{items.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getMonthDays(year, month);
    const weekDays = getWeekDays();

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysHeader}>
          {weekDays.map(day => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month;
            return renderCalendarDay(date, isCurrentMonth);
          })}
        </View>
      </View>
    );
  };

  const renderSelectedDateItems = () => (
    <View style={styles.selectedDateSection}>
      <Text style={styles.selectedDateTitle}>
        {selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>
      
      {selectedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No events or assignments for this date</Text>
          {user?.role === 'admin' && (
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.itemsContainer}>
          {selectedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, { borderLeftColor: item.color }]}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.itemHeader}>
                <View style={[styles.itemTypeBadge, { backgroundColor: item.color }]}>
                  <Ionicons
                    name={item.type === 'event' ? 'calendar' : 'document-text'}
                    size={12}
                    color="white"
                  />
                  <Text style={styles.itemTypeText}>
                    {item.type === 'event' ? 'Event' : 'Assignment'}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.priorityText}>{item.priority}</Text>
                </View>
              </View>
              
              <Text style={styles.itemTitle}>{item.title}</Text>
              
              {item.description && (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              
              <View style={styles.itemDetails}>
                <View style={styles.itemDetail}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.itemDetailText}>
                    {formatDate(item.date, 'HH:mm')}
                  </Text>
                </View>
                
                {item.location && (
                  <View style={styles.itemDetail}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.itemDetailText}>{item.location}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>View all events and deadlines</Text>
        </View>
        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <View style={styles.content}>
        {renderCalendar()}
        {renderSelectedDateItems()}
      </View>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeButtons}>
                {['event', 'assignment'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newItem.type === type && styles.typeButtonActive
                    ]}
                    onPress={() => setNewItem({ ...newItem, type: type as 'event' | 'assignment' })}
                  >
                    <Ionicons
                      name={type === 'event' ? 'calendar' : 'document-text'}
                      size={16}
                      color={newItem.type === type ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        newItem.type === type && styles.typeButtonTextActive
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={newItem.title}
                onChangeText={(text) => setNewItem({ ...newItem, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description"
                value={newItem.description}
                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            {newItem.type === 'event' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter location"
                  value={newItem.location}
                  onChangeText={(text) => setNewItem({ ...newItem, location: text })}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newItem.priority === priority && styles.priorityButtonActive
                    ]}
                    onPress={() => setNewItem({ ...newItem, priority: priority as 'low' | 'medium' | 'high' })}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        newItem.priority === priority && styles.priorityButtonTextActive
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {formatDate(itemDate, 'MMM dd, yyyy HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleAddItem}>
              <Text style={styles.createButtonText}>Create {newItem.type}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        visible={showItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Item Details</Text>
            <TouchableOpacity onPress={() => setShowItemModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {selectedItem && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.itemTypeBadge, { backgroundColor: selectedItem.color }]}>
                <Ionicons
                  name={selectedItem.type === 'event' ? 'calendar' : 'document-text'}
                  size={16}
                  color="white"
                />
                <Text style={styles.itemTypeText}>
                  {selectedItem.type === 'event' ? 'Event' : 'Assignment'}
                </Text>
              </View>

              <Text style={styles.itemDetailTitle}>{selectedItem.title}</Text>
              
              {selectedItem.description && (
                <Text style={styles.itemDetailDescription}>{selectedItem.description}</Text>
              )}

              <View style={styles.itemDetailInfo}>
                <View style={styles.itemDetailRow}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.itemDetailText}>
                    {formatDate(selectedItem.date, 'MMM dd, yyyy HH:mm')}
                  </Text>
                </View>

                <View style={styles.itemDetailRow}>
                  <Ionicons name="flag-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.itemDetailText}>
                    Priority: {selectedItem.priority}
                  </Text>
                </View>

                {selectedItem.location && (
                  <View style={styles.itemDetailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.itemDetailText}>{selectedItem.location}</Text>
                  </View>
                )}
              </View>

              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(selectedItem)}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={styles.deleteButtonText}>Delete Item</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Date Picker - Simple Implementation */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Select Date & Time</Text>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setItemDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
                  setShowDatePicker(false);
                }}
              >
                <Text>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setItemDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Next week
                  setShowDatePicker(false);
                }}
              >
                <Text>Next Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setItemDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)); // 2 weeks
                  setShowDatePicker(false);
                }}
              >
                <Text>2 Weeks Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: COLORS.card,
    margin: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  monthTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDay: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  today: {
    backgroundColor: COLORS.success + '20',
  },
  otherMonth: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedDayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  todayText: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  otherMonthText: {
    color: COLORS.textSecondary,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    width: '80%',
    maxWidth: 300,
  },
  datePickerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  dateOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dayIndicators: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 1,
  },
  dayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreIndicator: {
    fontSize: 8,
    color: COLORS.textSecondary,
  },
  selectedDateSection: {
    margin: SPACING.lg,
  },
  selectedDateTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
  },
  itemTypeText: {
    fontSize: SIZES.xs,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  priorityBadge: {
    backgroundColor: COLORS.warning,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  priorityText: {
    fontSize: SIZES.xs,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  itemTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  itemDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.sm,
  },
  itemDetails: {
    gap: SPACING.xs,
  },
  itemsContainer: {
    marginTop: SPACING.lg,
  },
  itemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  itemDetailText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    gap: SPACING.xs,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary + '20',
  },
  typeButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: COLORS.primary + '20',
  },
  priorityButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: COLORS.primary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  dateButtonText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  createButtonText: {
    color: 'white',
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  addButtonText: {
    color: 'white',
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  itemDetailTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemDetailDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  itemDetailInfo: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  itemDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: SIZES.md,
    fontWeight: '600',
  },
}); 