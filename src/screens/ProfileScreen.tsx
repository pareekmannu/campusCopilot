import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES } from '../utils/constants';
import { User } from '../types';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  autoSync: boolean;
  reminderTime: number;
  language: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: false,
    autoSync: true,
    reminderTime: 30,
    language: 'English',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    studentId: '',
  });

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      const [userData, settingsData] = await Promise.all([
        StorageService.getUserData(),
        StorageService.getSettings(),
      ]);
      setUser(userData);
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading user and settings:', error);
    }
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

      await StorageService.saveUserData(updatedUser);
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
              await AuthService.logout();
              // The App.tsx will handle navigation back to login
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleSettingChange = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await AuthService.logout();
            } catch (error) {
              console.error('Delete account error:', error);
            }
          },
        },
      ]
    );
  };

  const handleSwitchRole = async () => {
    if (!user) return;
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    try {
      // Update in Firestore if user has a uid
      if (user.uid) {
        await updateDoc(doc(db, 'users', user.uid), { role: newRole });
      }
      setUser({ ...user, role: newRole });
      Alert.alert('Role Switched', `You are now using the app as a ${newRole}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch role.');
    }
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.profileHeader}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons
            name={user?.role === 'admin' ? 'shield-checkmark' : 'person'}
            size={40}
            color="white"
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile Information</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
          </View>
        </View>

        {user?.department && (
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{user.department}</Text>
            </View>
          </View>
        )}

        {user?.year && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Year</Text>
              <Text style={styles.infoValue}>Year {user.year}</Text>
            </View>
          </View>
        )}

        {user?.studentId && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{user.studentId}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <View style={styles.settingsCard}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowSettingsModal(true)}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>App Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => handleSettingChange('notifications', value)}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={settings.notifications ? COLORS.primary : COLORS.textSecondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => handleSettingChange('darkMode', value)}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={settings.darkMode ? COLORS.primary : COLORS.textSecondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="sync-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Auto Sync</Text>
          </View>
          <Switch
            value={settings.autoSync}
            onValueChange={(value) => handleSettingChange('autoSync', value)}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={settings.autoSync ? COLORS.primary : COLORS.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Actions</Text>
      <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleSwitchRole}>
        <Ionicons name="swap-horizontal" size={20} color={COLORS.secondary} />
        <Text style={styles.actionButtonText}>
          Switch to {user?.role === 'admin' ? 'Student' : 'Admin'} Mode
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLogoutSection = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderProfileSection()}
        {renderSettingsSection()}
        {renderActionsSection()}
        {renderLogoutSection()}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                keyboardType="email-address"
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
              <Text style={styles.inputLabel}>Year</Text>
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
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>App Settings</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Notifications</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => handleSettingChange('notifications', value)}
                />
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Appearance</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => handleSettingChange('darkMode', value)}
                />
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Data</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Auto Sync</Text>
                <Switch
                  value={settings.autoSync}
                  onValueChange={(value) => handleSettingChange('autoSync', value)}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={() => setShowSettingsModal(false)}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs,
  },
  userRole: {
    fontSize: SIZES.md,
    color: 'white',
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: SIZES.sm,
    color: 'white',
    opacity: 0.8,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  editButtonText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingLabel: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionLabel: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: SPACING.sm,
  },
  deleteAccountText: {
    color: COLORS.error,
    fontSize: SIZES.md,
    fontWeight: '600',
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
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveButtonText: {
    color: 'white',
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  settingGroup: {
    marginBottom: SPACING.lg,
  },
  settingGroupTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  actionButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
  },
}); 