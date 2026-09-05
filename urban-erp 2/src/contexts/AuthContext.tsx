import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { authService, UserProfile } from '../services/authService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const userProfile = await authService.getCurrentUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.warn('Failed to fetch profile:', error);
      setProfile(null);
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
      setProfile(null);
      setFirebaseUser(null);
    } catch (error) {
      console.warn('Failed to log out:', error);
    }
  };

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth is not initialized properly. Skipping auth state listener.');
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          await fetchProfile();
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    } catch (error) {
      console.warn("Firebase auth state listener notice:", error);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, refreshProfile: fetchProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
