import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../utils/constants';
import { registerUser } from '../services/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserRole } from '../types';

interface RegisterScreenProps {
  onRegisterSuccess: (user: any) => void;
  onBackToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onBackToLogin }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    department: '',
    year: '',
    studentId: '',
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.college.trim()) {
      Alert.alert('Error', 'Please enter your college name');
      return false;
    }
    if (selectedRole === 'student' && !formData.department.trim()) {
      Alert.alert('Error', 'Please enter your department');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        department: formData.department.trim(),
        year: selectedRole === 'student' ? parseInt(formData.year) || 1 : 0,
        role: selectedRole,
        studentId: selectedRole === 'student' ? formData.studentId.trim() : undefined,
      };

      // Register with Firebase Auth and Firestore
      const user = await registerUser(formData.email.trim().toLowerCase(), formData.password, userData);
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          Alert.alert(
            'Registration Successful!',
            'Your account has been created successfully.',
            [
              {
                text: 'OK',
                onPress: () => onRegisterSuccess({ uid: user.uid, ...userDoc.data() }),
              },
            ]
          );
        } else {
          Alert.alert('Error', 'User profile not found after registration.');
        }
      } else {
        Alert.alert('Registration Failed', 'Could not create user.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Ionicons name="school" size={60} color="white" />
              <Text style={styles.title}>Campus Copilot</Text>
              <Text style={styles.subtitle}>Create Your Account</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Select Role:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'student' && styles.roleButtonActive
                  ]}
                  onPress={() => setSelectedRole('student')}
                >
                  <Ionicons
                    name="person" 
                    size={24} 
                    color={selectedRole === 'student' ? COLORS.primary : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === 'student' && styles.roleButtonTextActive
                  ]}>
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'admin' && styles.roleButtonActive
                  ]}
                  onPress={() => setSelectedRole('admin')}
                >
                  <Ionicons
                    name="shield-checkmark" 
                    size={24} 
                    color={selectedRole === 'admin' ? COLORS.primary : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === 'admin' && styles.roleButtonTextActive
                  ]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="business" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="College/University Name"
                  value={formData.college}
                  onChangeText={(value) => handleInputChange('college', value)}
                  autoCapitalize="words"
                />
              </View>

              {selectedRole === 'student' && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="library" size={20} color={COLORS.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Department (e.g., Computer Science)"
                      value={formData.department}
                      onChangeText={(value) => handleInputChange('department', value)}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Year (1-4)"
                      value={formData.year}
                      onChangeText={(value) => handleInputChange('year', value)}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="card" size={20} color={COLORS.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Student ID (Optional)"
                      value={formData.studentId}
                      onChangeText={(value) => handleInputChange('studentId', value)}
                      autoCapitalize="characters"
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginLink} onPress={onBackToLogin}>
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl * 2,
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
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.md,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
    fontFamily: FONTS.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  roleContainer: {
    marginBottom: SPACING.lg,
  },
  roleLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.medium,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  roleButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  roleButtonTextActive: {
    color: COLORS.primary,
  },
  form: {
    gap: SPACING.md,
  },
  inputContainer: {
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
  input: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: FONTS.bold,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginLinkText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
}); 