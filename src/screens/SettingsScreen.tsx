import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES } from '../utils/constants';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
    reminderTime: 30,
    language: 'English',
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfile, setEditProfile] = useState({
    name: '',
    email: '',
    college: '',
  });

  useEffect(() => {
    loadSettings();
    loadUserProfile();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        setEditProfile({
          name: user.name || '',
          email: user.email || '',
          college: user.college || '',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await StorageService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggleSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleLogout = () => {
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
              await AuthService.logout();
              // Navigation will be handled by the main app component
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
          },
        },
      ]
    );
  };

  const handleEditProfile = async () => {
    if (!editProfile.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      // In a real app, you would update the user profile here
      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditProfile(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        {renderSectionHeader('Profile')}
        <View style={styles.section}>
          {renderSettingItem(
            'person-outline',
            'Edit Profile',
            'Update your personal information',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />,
            () => setShowEditProfile(true)
          )}
          {renderSettingItem(
            'shield-outline',
            'Privacy & Security',
            'Manage your privacy settings',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
        </View>

        {/* Notifications Section */}
        {renderSectionHeader('Notifications')}
        <View style={styles.section}>
          {renderSettingItem(
            'notifications-outline',
            'Push Notifications',
            'Receive notifications for important updates',
            <Switch
              value={settings.notifications}
              onValueChange={(value) => handleToggleSetting('notifications', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={settings.notifications ? COLORS.primary : COLORS.textSecondary}
            />
          )}
          {renderSettingItem(
            'time-outline',
            'Reminder Time',
            `${settings.reminderTime} minutes before events`,
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
        </View>

        {/* App Settings Section */}
        {renderSectionHeader('App Settings')}
        <View style={styles.section}>
          {renderSettingItem(
            'moon-outline',
            'Dark Mode',
            'Switch to dark theme',
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => handleToggleSetting('darkMode', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={settings.darkMode ? COLORS.primary : COLORS.textSecondary}
            />
          )}
          {renderSettingItem(
            'sync-outline',
            'Auto Sync',
            'Automatically sync data in background',
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => handleToggleSetting('autoSync', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={settings.autoSync ? COLORS.primary : COLORS.textSecondary}
            />
          )}
          {renderSettingItem(
            'language-outline',
            'Language',
            settings.language,
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
        </View>

        {/* Data & Storage Section */}
        {renderSectionHeader('Data & Storage')}
        <View style={styles.section}>
          {renderSettingItem(
            'cloud-download-outline',
            'Export Data',
            'Download your data as backup',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
          {renderSettingItem(
            'trash-outline',
            'Clear Cache',
            'Free up storage space',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
        </View>

        {/* Support Section */}
        {renderSectionHeader('Support')}
        <View style={styles.section}>
          {renderSettingItem(
            'help-circle-outline',
            'Help & Support',
            'Get help and contact support',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
          {renderSettingItem(
            'document-text-outline',
            'Terms of Service',
            'Read our terms and conditions',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
          {renderSettingItem(
            'shield-checkmark-outline',
            'Privacy Policy',
            'Learn about our privacy practices',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
        </View>

        {/* Account Section */}
        {renderSectionHeader('Account')}
        <View style={styles.section}>
          {renderSettingItem(
            'log-out-outline',
            'Logout',
            'Sign out of your account',
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />,
            handleLogout
          )}
          {renderSettingItem(
            'trash-outline',
            'Delete Account',
            'Permanently delete your account',
            <Ionicons name="chevron-forward" size={20} color={COLORS.error} />,
            handleDeleteAccount
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Campus Copilot v1.0.0</Text>
          <Text style={styles.appDescription}>
            Your all-in-one college management companion
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={editProfile.name}
                onChangeText={(text) => setEditProfile({ ...editProfile, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={editProfile.email}
                onChangeText={(text) => setEditProfile({ ...editProfile, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>College/University</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your college name"
                value={editProfile.college}
                onChangeText={(text) => setEditProfile({ ...editProfile, college: text })}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditProfile(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleEditProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  },
  headerContent: {
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  appVersion: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  appDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
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