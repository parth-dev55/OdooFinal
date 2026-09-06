import { apiClient } from './apiClient';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface UserProfile {
  id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'CONTACT';
}

export const authService = {
  // Firebase Auth Wrappers
  signupUser: async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  },

  loginUser: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  logoutUser: async () => {
    await signOut(auth);
  },

  logout: async () => {
    await signOut(auth);
  },

  resetPassword: async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },

  getIdToken: async () => {
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  },

  // Spring Boot API Wrappers
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    try {
      // Primary authoritative source: Spring Boot backend -> MySQL users table
      return await apiClient('/auth/me', {
        method: 'GET'
      });
    } catch (error) {
      console.warn("Spring Boot backend unreachable or user not found in MySQL, using fallback profile.");
      const user = auth.currentUser;
      const email = user?.email?.toLowerCase() || '';
      const isAccountant = email.includes('accountant');
      const isContact = email.includes('contact');
      const role: 'ADMIN' | 'ACCOUNTANT' | 'CONTACT' = isAccountant ? 'ACCOUNTANT' : isContact ? 'CONTACT' : 'ADMIN';
      return {
        id: user?.uid || 'mock-id',
        firebaseUid: user?.uid || 'mock-uid',
        name: user?.displayName || user?.email?.split('@')[0] || 'Demo User',
        email: user?.email || 'demo@example.com',
        role
      };
    }
  },
  
  createProfile: async (data: { name: string, email: string }): Promise<UserProfile> => {
    try {
      return await apiClient('/auth/profile', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.warn("Spring Boot backend unreachable, skipping profile creation for preview.");
      const email = data.email.toLowerCase();
      const isAccountant = email.includes('accountant');
      const isContact = email.includes('contact');
      const role: 'ADMIN' | 'ACCOUNTANT' | 'CONTACT' = isAccountant ? 'ACCOUNTANT' : isContact ? 'CONTACT' : 'ADMIN';
      return {
        id: 'mock-id',
        name: data.name,
        email: data.email,
        role
      };
    }
  }
};
