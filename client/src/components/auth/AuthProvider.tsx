import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, handleGoogleRedirect } from '@/services/firebase';
import { firestore } from '@/services/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useLocation } from 'wouter';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle Google OAuth redirect on page load
    handleGoogleRedirect().catch(console.error);

    // Listen for auth state changes
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);
      setLoading(false);

      // If user exists, check if profile exists in Firestore
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          // Create user profile document
          await setDoc(userRef, {
            firebaseUid: user.uid,
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            createdAt: new Date().toISOString(),
            provider: user.providerId || "google",
          });
        }
        // REMOVE setLocation('/dashboard') from here
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
