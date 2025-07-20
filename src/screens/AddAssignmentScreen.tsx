import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, SIZES } from '../utils/constants';
import { StorageService } from '../services/storageService';
import { Assignment } from '../types';

export default function AddAssignmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: 'medium' as 'low' | 'medium' | 'high',
    maxMarks: '',
    submissionLink: '',
    targetAudience: 'all' as 'all' | 'specific_department' | 'specific_year',
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.subject.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        dueDate: formData.dueDate,
        priority: formData.priority,
        isCompleted: false,
        submittedAt: null,
        createdBy: user?.id || 'admin',
      };

      // Get existing assignments and add new one
      const existingAssignments = await StorageService.getAssignments();
      const updatedAssignments = [...existingAssignments, newAssignment];
      await StorageService.saveAssignments(updatedAssignments);

      // Create notification for students
      const newNotification = {
        id: Date.now().toString(),
        title: 'New Assignment Posted',
        message: `${formData.title} - ${formData.subject}`,
        type: 'assignment' as const,
        timestamp: new Date(),
        isRead: false,
        sentBy: user?.id || 'admin',
        targetAudience: formData.targetAudience,
        relatedId: newAssignment.id,
      };

      const existingNotifications = await StorageService.getNotifications();
      const updatedNotifications = [...existingNotifications, newNotification];
      await StorageService.saveNotifications(updatedNotifications);

      Alert.alert(
        'Success',
        'Assignment created successfully! Students will be notified.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating assignment:', error);
      Alert.alert('Error', 'Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dueDate: selectedDate });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Assignment</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assignment Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter assignment title"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder="e.g., Computer Science, Mathematics"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter detailed assignment description"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {formData.dueDate.toLocaleDateString()} at {formData.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityButtons}>
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority && styles.priorityButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, priority })}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      formData.priority === priority && styles.priorityButtonTextActive,
                    ]}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max Marks */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Marks</Text>
            <TextInput
              style={styles.input}
              value={formData.maxMarks}
              onChangeText={(text) => setFormData({ ...formData, maxMarks: text })}
              placeholder="e.g., 100"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
            />
          </View>

          {/* Target Audience */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Audience</Text>
            <View style={styles.audienceButtons}>
              {(['all', 'specific_department', 'specific_year'] as const).map((audience) => (
                <TouchableOpacity
                  key={audience}
                  style={[
                    styles.audienceButton,
                    formData.targetAudience === audience && styles.audienceButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, targetAudience: audience })}
                >
                  <Text
                    style={[
                      styles.audienceButtonText,
                      formData.targetAudience === audience && styles.audienceButtonTextActive,
                    ]}
                  >
                    {audience === 'all' ? 'All Students' : 
                     audience === 'specific_department' ? 'Department' : 'Year'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Assignment</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Select Due Date</Text>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setFormData({ ...formData, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }); // Tomorrow
                  setShowDatePicker(false);
                }}
              >
                <Text>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setFormData({ ...formData, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }); // Next week
                  setShowDatePicker(false);
                }}
              >
                <Text>Next Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setFormData({ ...formData, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }); // 2 weeks
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priorityButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: 'white',
  },
  audienceButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  audienceButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  audienceButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  audienceButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  audienceButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: 'white',
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
}); 