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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../utils/constants';
import { loginUser } from '../services/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onShowRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onShowRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Login with Firebase Auth
      const user = await loginUser(email, password);
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          onLoginSuccess({ uid: user.uid, ...userDoc.data() });
        } else {
          Alert.alert('Error', 'User profile not found.');
        }
      } else {
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
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
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="school" size={60} color="white" />
            <Text style={styles.title}>Campus Copilot</Text>
            <Text style={styles.subtitle}>Your Personal College Assistant</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.instructionText}>Sign in to continue</Text>

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

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
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

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity style={styles.registerLink} onPress={onShowRegister}>
              <Text style={styles.registerLinkText}>
                Don't have an account? <Text style={styles.registerLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  welcomeText: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  instructionText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: FONTS.regular,
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
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: FONTS.bold,
  },
  demoContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.medium,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  demoButton: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  demoButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    fontFamily: FONTS.medium,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  registerLinkText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  registerLinkBold: {
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
}); 