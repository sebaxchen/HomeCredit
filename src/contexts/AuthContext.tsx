import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mockApi } from '../lib/mockApi';
import { Profile } from '../types/database';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: Profile['role']
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

interface AuthUser {
  id: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      try {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('homecredit_auth_session') : null;

        if (stored) {
          const parsed = JSON.parse(stored) as { user: AuthUser; profile: Profile };
          if (parsed.user && parsed.profile) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            return;
          }
        }

        const defaultProfile = await mockApi.getProfileByUserId(mockApi.demoUserId);
        if (defaultProfile) {
          const defaultUser: AuthUser = {
            id: defaultProfile.id,
            email: defaultProfile.email,
          };
          setUser(defaultUser);
          setProfile(defaultProfile);
          persistSession(defaultUser, defaultProfile);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = (authUser: AuthUser, authProfile: Profile) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'homecredit_auth_session',
      JSON.stringify({ user: authUser, profile: authProfile }),
    );
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Ingresa tu correo y contraseña');
      }

      const existingProfile = await mockApi.getProfileByEmail(email);
      const authProfile =
        existingProfile ??
        (await mockApi.upsertProfile({
          email,
          full_name: 'Asesor Demo',
          role: 'advisor',
        }));

      const authUser: AuthUser = { id: authProfile.id, email: authProfile.email };
      setUser(authUser);
      setProfile(authProfile);
      persistSession(authUser, authProfile);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: Profile['role'] = 'advisor',
  ) => {
    try {
      if (!email || !password || !fullName) {
        throw new Error('Completa todos los campos para registrarte');
      }

      const authProfile = await mockApi.upsertProfile({
        email,
        full_name: fullName,
        role,
        phone: '+51 999 000 000',
      });

      const authUser: AuthUser = { id: authProfile.id, email: authProfile.email };
      setUser(authUser);
      setProfile(authProfile);
      persistSession(authUser, authProfile);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await mockApi.clearAuthSession();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('homecredit_auth_session');
    }
    setProfile(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
