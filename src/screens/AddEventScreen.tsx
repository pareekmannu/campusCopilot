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
import { Event } from '../types';

export default function AddEventScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
    type: 'event' as 'class' | 'exam' | 'club' | 'deadline' | 'event',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetAudience: 'all' as 'all' | 'specific_department' | 'specific_year',
  });

  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.endDate <= formData.startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location.trim(),
        type: formData.type,
        priority: formData.priority,
        isCompleted: false,
        createdBy: user?.id || 'admin',
        targetAudience: formData.targetAudience,
      };

      // Get existing events and add new one
      const existingEvents = await StorageService.getEvents();
      const updatedEvents = [...existingEvents, newEvent];
      await StorageService.saveEvents(updatedEvents);

      // Create notification for students
      const newNotification = {
        id: Date.now().toString(),
        title: 'New Event Added',
        message: `${formData.title} - ${formData.location || 'No location specified'}`,
        type: 'event' as const,
        timestamp: new Date(),
        isRead: false,
        sentBy: user?.id || 'admin',
        targetAudience: formData.targetAudience,
        relatedId: newEvent.id,
      };

      const existingNotifications = await StorageService.getNotifications();
      const updatedNotifications = [...existingNotifications, newNotification];
      await StorageService.saveNotifications(updatedNotifications);

      Alert.alert(
        'Success',
        'Event created successfully! Students will be notified.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, startDate: selectedDate });
      // Auto-update end date if it's before start date
      if (formData.endDate <= selectedDate) {
        const newEndDate = new Date(selectedDate.getTime() + 60 * 60 * 1000); // +1 hour
        setFormData({ ...formData, startDate: selectedDate, endDate: newEndDate });
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, endDate: selectedDate });
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
        <Text style={styles.headerTitle}>Add Event</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter event title"
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
              placeholder="Enter event description"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="e.g., Room 301, Engineering Building"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Event Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Type</Text>
            <View style={styles.typeButtons}>
              {(['class', 'exam', 'club', 'event'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date & Time *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {formData.startDate.toLocaleDateString()} at {formData.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date & Time *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {formData.endDate.toLocaleDateString()} at {formData.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              <Text style={styles.submitButtonText}>Create Event</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showStartDatePicker && (
        <Modal
          visible={showStartDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Select Start Date</Text>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  const newStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
                  setFormData({ ...formData, startDate: newStartDate, endDate: new Date(newStartDate.getTime() + 60 * 60 * 1000) });
                  setShowStartDatePicker(false);
                }}
              >
                <Text>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  const newStartDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Next week
                  setFormData({ ...formData, startDate: newStartDate, endDate: new Date(newStartDate.getTime() + 60 * 60 * 1000) });
                  setShowStartDatePicker(false);
                }}
              >
                <Text>Next Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStartDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showEndDatePicker && (
        <Modal
          visible={showEndDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Select End Date</Text>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setFormData({ ...formData, endDate: new Date(formData.startDate.getTime() + 60 * 60 * 1000) }); // 1 hour later
                  setShowEndDatePicker(false);
                }}
              >
                <Text>1 Hour Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setFormData({ ...formData, endDate: new Date(formData.startDate.getTime() + 2 * 60 * 60 * 1000) }); // 2 hours later
                  setShowEndDatePicker(false);
                }}
              >
                <Text>2 Hours Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEndDatePicker(false)}
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
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
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