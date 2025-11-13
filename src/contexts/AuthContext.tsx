import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
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

interface SupabaseProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: Profile['role'];
  company_name?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

const AUTH_STORAGE_KEY = 'homecredit_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = (authUser: AuthUser, authProfile: Profile) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: authUser, profile: authProfile }),
    );
  };

  const clearPersistedSession = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hydrateFromStorage = () => {
    if (typeof window === 'undefined') return null;

    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { user?: AuthUser; profile?: Profile };
      if (!parsed.user || !parsed.profile) return null;
      return parsed as { user: AuthUser; profile: Profile };
    } catch {
      return null;
    }
  };

  const parseMetadata = (metadata: Record<string, unknown> | undefined) => {
    const fullName =
      metadata && typeof metadata.full_name === 'string' ? metadata.full_name : undefined;
    const rawRole = metadata && typeof metadata.role === 'string' ? metadata.role : undefined;
    const role: Profile['role'] | undefined =
      rawRole && ['admin', 'advisor', 'client'].includes(rawRole)
        ? (rawRole as Profile['role'])
        : undefined;
    const phone = metadata && typeof metadata.phone === 'string' ? metadata.phone : undefined;

    return { fullName, role, phone };
  };

  const mapSupabaseProfile = (row: SupabaseProfileRow): Profile => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    company_name: row.company_name ?? undefined,
    phone: row.phone ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ? mapSupabaseProfile(data as SupabaseProfileRow) : null;
  };

  const ensureProfile = async (
    userId: string,
    {
      email,
      fullName,
      role,
      phone,
    }: {
      email?: string | null;
      fullName?: string | null;
      role?: Profile['role'] | null;
      phone?: string | null;
    } = {},
  ) => {
    const existing = await fetchProfile(userId);
    if (existing) {
      return existing;
    }

    const normalizedEmail = email?.toLowerCase();
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: normalizedEmail ?? '',
          full_name: fullName?.trim() || normalizedEmail || 'Usuario HomeCredit',
          role: role ?? 'advisor',
          phone: phone ?? null,
        },
        { onConflict: 'id' },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapSupabaseProfile(data as SupabaseProfileRow);
  };

  const syncSessionState = async (
    sessionUser: User | null,
    fallback?: { user?: AuthUser; profile?: Profile },
    shouldUpdate?: () => boolean,
  ) => {
    const canUpdate = () => (shouldUpdate ? shouldUpdate() : true);

    if (!sessionUser) {
      if (canUpdate()) {
        setUser(null);
        setProfile(null);
        clearPersistedSession();
      }
      return;
    }

    const metadata = parseMetadata(sessionUser.user_metadata as Record<string, unknown>);
    const authUser: AuthUser = {
      id: sessionUser.id,
      email: sessionUser.email ?? fallback?.user?.email ?? '',
    };

    if (canUpdate()) {
      setUser(authUser);
    }

    try {
      const ensuredProfile = await ensureProfile(authUser.id, {
        email: sessionUser.email ?? fallback?.profile?.email,
        fullName: metadata.fullName ?? fallback?.profile?.full_name,
        role: metadata.role ?? fallback?.profile?.role,
        phone: metadata.phone ?? fallback?.profile?.phone,
      });

      if (canUpdate()) {
        setProfile(ensuredProfile);
        persistSession(authUser, ensuredProfile);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      try {
        const cached = hydrateFromStorage();
        if (cached && isMounted) {
          setUser(cached.user);
          setProfile(cached.profile);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        await syncSessionState(session?.user ?? null, cached ?? undefined, () => isMounted);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      syncSessionState(session?.user ?? null, undefined, () => isMounted).catch((error) =>
        console.error(error),
      );
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Ingresa tu correo y contraseña');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      const supabaseUser = data.user;
      if (!supabaseUser) {
        throw new Error('No se pudo iniciar sesión. Inténtalo nuevamente.');
      }

      await syncSessionState(supabaseUser, {
        user: { id: supabaseUser.id, email: supabaseUser.email ?? normalizedEmail },
      });

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
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      const supabaseUser = data.user;
      if (!supabaseUser) {
        return {
          error: new Error('Tu cuenta fue creada. Revisa tu correo para confirmar antes de iniciar sesión.'),
        };
      }

      if (!data.session) {
        return {
          error: new Error(
            'Tu cuenta fue creada. Revisa tu correo para confirmar antes de iniciar sesión.',
          ),
        };
      }

      await syncSessionState(supabaseUser, {
        user: { id: supabaseUser.id, email: supabaseUser.email ?? normalizedEmail },
        profile: {
          id: supabaseUser.id,
          email: supabaseUser.email ?? normalizedEmail,
          full_name: fullName.trim(),
          role,
          company_name: undefined,
          phone: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearPersistedSession();
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
