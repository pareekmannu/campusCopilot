import { User, LoginCredentials, UserRole } from '../types';
import { StorageService } from './storageService';

// Sample users for demo
const sampleUsers = {
  admin: {
    id: 'admin1',
    name: 'Dr. Sarah Johnson',
    email: 'admin@college.edu',
    college: 'Tech University',
    year: 0,
    role: 'admin' as UserRole,
    department: 'Computer Science',
  },
  student: {
    id: 'student1',
    name: 'John Doe',
    email: 'john.doe@college.edu',
    college: 'Tech University',
    year: 3,
    role: 'student' as UserRole,
    department: 'Computer Science',
    studentId: 'CS2021001',
  },
};

// Store registered users in memory (in real app, this would be a database)
let registeredUsers: { [email: string]: any } = {
  'admin@college.edu': { ...sampleUsers.admin, password: 'admin123' },
  'student@college.edu': { ...sampleUsers.student, password: 'student123' },
};

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists in registered users
      const userData = registeredUsers[credentials.email.toLowerCase()];
      
      if (userData && userData.password === credentials.password && userData.role === credentials.role) {
        // Remove password from user object before saving
        const { password, ...user } = userData;
        await StorageService.saveUserData(user);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  static async register(userData: any): Promise<boolean> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const email = userData.email.toLowerCase();
      
      // Check if user already exists
      if (registeredUsers[email]) {
        return false;
      }

      // Add user to registered users
      registeredUsers[email] = userData;
      
      // Save user data to storage
      const { password, ...user } = userData;
      await StorageService.saveUserData(user);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await StorageService.clearAllData();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      return await StorageService.getUserData();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  }

  static async checkRole(requiredRole: UserRole): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.role === requiredRole;
    } catch (error) {
      console.error('Check role error:', error);
      return false;
    }
  }

  // Demo credentials for easy testing
  static getDemoCredentials() {
    return {
      admin: {
        email: 'admin@college.edu',
        password: 'admin123',
        role: 'admin' as UserRole,
      },
      student: {
        email: 'student@college.edu',
        password: 'student123',
        role: 'student' as UserRole,
      },
    };
  }
} 