import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  hasSupabaseAuth,
  getLocalAuthEmail,
  setLocalAuthEmail,
  clearLocalAuthEmail,
} from "@/lib/authConfig";

type AuthContextValue = {
  user: User | null;
  /** Email from Supabase user or local demo login */
  email: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Using localStorage demo login (no Supabase keys) */
  isLocalDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [localEmail, setLocalEmailState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseAuth) {
      setLocalEmailState(getLocalAuthEmail());
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .finally(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  const email = hasSupabaseAuth ? user?.email ?? null : localEmail;

  const isAuthenticated = hasSupabaseAuth ? Boolean(user) : Boolean(localEmail);

  const isLocalDemo = !hasSupabaseAuth && Boolean(localEmail);

  const signIn = useCallback(async (emailIn: string, password: string) => {
    if (!hasSupabaseAuth) {
      if (!emailIn.trim()) {
        return { error: new Error("Enter your email or name.") };
      }
      setLocalAuthEmail(emailIn);
      setLocalEmailState(emailIn.trim());
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: emailIn.trim(),
      password,
    });
    return { error: error as Error | null };
  }, []);

  const signUp = useCallback(async (emailIn: string, password: string) => {
    if (!hasSupabaseAuth) {
      return { error: new Error("Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to use sign up.") };
    }
    const { error } = await supabase.auth.signUp({
      email: emailIn.trim(),
      password,
    });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    if (!hasSupabaseAuth) {
      clearLocalAuthEmail();
      setLocalEmailState(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      email,
      loading,
      isAuthenticated,
      isLocalDemo,
      signIn,
      signUp,
      signOut,
    }),
    [user, email, loading, isAuthenticated, isLocalDemo, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
