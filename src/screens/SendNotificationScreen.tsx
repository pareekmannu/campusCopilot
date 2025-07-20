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
import { useRoute, useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, SIZES } from '../utils/constants';
import { StorageService } from '../services/storageService';

export default function SendNotificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'update' as 'reminder' | 'update' | 'event' | 'assignment',
    targetAudience: 'all' as 'all' | 'specific_department' | 'specific_year',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newNotification = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        timestamp: new Date(),
        isRead: false,
        sentBy: user?.id || 'admin',
        targetAudience: formData.targetAudience,
      };

      // Get existing notifications and add new one
      const existingNotifications = await StorageService.getNotifications();
      const updatedNotifications = [...existingNotifications, newNotification];
      await StorageService.saveNotifications(updatedNotifications);

      Alert.alert(
        'Success',
        'Notification sent successfully! Students will receive this notification.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Send Notification</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notification Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter notification title"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              placeholder="Enter notification message"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Notification Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notification Type</Text>
            <View style={styles.typeButtons}>
              {(['reminder', 'update', 'event', 'assignment'] as const).map((type) => (
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
              <Text style={styles.submitButtonText}>Send Notification</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    height: 120,
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
}); 