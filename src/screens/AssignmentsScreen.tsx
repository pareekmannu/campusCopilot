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
import { Assignment } from '../types';
import { listenToAssignments, addAssignment } from '../services/firebaseService';
import { formatDate, getTimeAgo, getPriorityColor } from '../utils/dateUtils';

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'medium' as Assignment['priority'],
  });
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Real-time Firestore updates
    const unsubscribe = listenToAssignments((assignments) => {
      setAssignments(assignments);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, selectedFilter]);

  const handleAddAssignment = async () => {
    if (!newAssignment.title.trim()) {
      Alert.alert('Error', 'Please enter an assignment title');
      return;
    }

    try {
      console.log('Adding assignment to Firestore:', {
        title: newAssignment.title.trim(),
        description: newAssignment.description.trim(),
        subject: newAssignment.subject.trim(),
        dueDate,
        priority: newAssignment.priority,
        isCompleted: false,
        submittedAt: null,
        createdAt: new Date(),
      });
      await addAssignment({
        title: newAssignment.title.trim(),
        description: newAssignment.description.trim(),
        subject: newAssignment.subject.trim(),
        dueDate,
        priority: newAssignment.priority,
        isCompleted: false,
        submittedAt: null,
        createdAt: new Date(),
      });
      console.log('Assignment added successfully!');
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Assignment created successfully!');
    } catch (error: any) {
      console.error('Error adding assignment:', error);
      Alert.alert('Error', error.message || 'Failed to add assignment.');
    }
  };

  const resetForm = () => {
    setNewAssignment({
      title: '',
      description: '',
      subject: '',
      priority: 'medium',
    });
    setDueDate(new Date());
  };

  const handleAssignmentPress = (assignment: Assignment) => {
    const status = assignment.isCompleted ? 'Completed' : 'Pending';
    const dueStatus = new Date(assignment.dueDate) < new Date() && !assignment.isCompleted 
      ? ' (Overdue)' : '';
    
    Alert.alert(
      assignment.title,
      `${assignment.description}\n\nSubject: ${assignment.subject}\nDue: ${formatDate(assignment.dueDate, 'MMM dd, yyyy HH:mm')}\nPriority: ${assignment.priority}\nStatus: ${status}${dueStatus}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: assignment.isCompleted ? 'Mark Incomplete' : 'Mark Complete',
          onPress: () => toggleAssignmentComplete(assignment.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAssignment(assignment.id),
        },
      ]
    );
  };

  const toggleAssignmentComplete = (assignmentId: string) => {
    // This function will need to be updated to use Firestore
    // For now, it will just remove the assignment from the local state
    // and potentially re-fetch if real-time updates are not sufficient.
    Alert.alert('Feature Coming Soon', 'Marking assignments as complete/incomplete is not yet implemented for Firestore.');
  };

  const deleteAssignment = (assignmentId: string) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // This function will need to be updated to use Firestore
            Alert.alert('Feature Coming Soon', 'Deleting assignments is not yet implemented for Firestore.');
          },
        },
      ]
    );
  };

  const getDueStatus = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: COLORS.error };
    if (diffDays === 0) return { status: 'today', text: 'Due Today', color: COLORS.warning };
    if (diffDays === 1) return { status: 'tomorrow', text: 'Due Tomorrow', color: COLORS.warning };
    if (diffDays <= 3) return { status: 'soon', text: `Due in ${diffDays} days`, color: COLORS.secondary };
    return { status: 'normal', text: `Due in ${diffDays} days`, color: COLORS.textSecondary };
  };

  const renderAssignmentCard = ({ item }: { item: Assignment }) => {
    const dueStatus = getDueStatus(item.dueDate);
    
    return (
      <TouchableOpacity
        style={[styles.assignmentCard, item.isCompleted && styles.completedAssignment]}
        onPress={() => handleAssignmentPress(item)}
      >
        <View style={styles.assignmentHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: dueStatus.color + '20' }]}>
            <Text style={[styles.statusText, { color: dueStatus.color }]}>
              {dueStatus.text}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.assignmentTitle, item.isCompleted && styles.completedText]}>
          {item.title}
        </Text>
        
        {item.description && (
          <Text style={[styles.assignmentDescription, item.isCompleted && styles.completedText]}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.assignmentDetails}>
          <View style={styles.assignmentDetail}>
            <Ionicons name="book-outline" size={16} color={COLORS.textSecondary} />
            <Text style={[styles.assignmentDetailText, item.isCompleted && styles.completedText]}>
              {item.subject}
            </Text>
          </View>
          
          <View style={styles.assignmentDetail}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={[styles.assignmentDetailText, item.isCompleted && styles.completedText]}>
              {formatDate(item.dueDate, 'MMM dd, HH:mm')}
            </Text>
          </View>
        </View>
        
        {item.isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.completedBadgeText}>
              Completed {item.submittedAt ? getTimeAgo(item.submittedAt) : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'pending', label: 'Pending', icon: 'time' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-circle' },
    { key: 'overdue', label: 'Overdue', icon: 'warning' },
  ];

  const pendingCount = assignments.filter(assignment => !assignment.isCompleted).length;
  const overdueCount = assignments.filter(assignment => 
    !assignment.isCompleted && new Date(assignment.dueDate) < new Date()
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Assignments</Text>
          <Text style={styles.subtitle}>
            {pendingCount > 0 ? `${pendingCount} pending assignments` : 'All assignments completed!'}
            {overdueCount > 0 && ` • ${overdueCount} overdue`}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
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

      {/* Assignments List */}
      <FlatList
        data={filteredAssignments}
        renderItem={renderAssignmentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.assignmentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all' ? 'No assignments' : `No ${selectedFilter} assignments`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? 'Create your first assignment to get started'
                : `No ${selectedFilter} assignments found.`
              }
            </Text>
            {selectedFilter === 'all' && (
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.emptyButtonText}>Add Assignment</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Add Assignment Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Assignment</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assignment Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter assignment title"
                value={newAssignment.title}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter subject/course"
                value={newAssignment.subject}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, subject: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter assignment description"
                value={newAssignment.description}
                onChangeText={(text) => setNewAssignment({ ...newAssignment, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newAssignment.priority === priority && styles.priorityButtonActive
                    ]}
                    onPress={() => setNewAssignment({ ...newAssignment, priority: priority as Assignment['priority'] })}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        newAssignment.priority === priority && styles.priorityButtonTextActive
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Due Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {formatDate(dueDate, 'MMM dd, yyyy HH:mm')}
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
            <TouchableOpacity style={styles.saveButton} onPress={handleAddAssignment}>
              <Text style={styles.saveButtonText}>Create Assignment</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        // <DateTimePicker
        //   value={dueDate}
        //   mode="datetime"
        //   onChange={(event, date) => {
        //     setShowDatePicker(false);
        //     if (date) setDueDate(date);
        //   }}
        // />
        null // Commented out to fix import error
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
  assignmentsList: {
    padding: SPACING.lg,
  },
  assignmentCard: {
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
  completedAssignment: {
    opacity: 0.6,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
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
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  assignmentTitle: {
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
  assignmentDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.regular,
  },
  assignmentDetails: {
    gap: SPACING.xs,
  },
  assignmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  assignmentDetailText: {
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