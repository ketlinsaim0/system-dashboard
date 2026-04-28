import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  enterDemo: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  session: null,
  loading: true,
  isDemo: false,
  enterDemo: () => {},
  signOut: async () => {},
});

const DEMO_KEY = "sysdash:demo";

const demoUser = {
  id: "demo-user",
  email: "demo@local",
  app_metadata: {},
  user_metadata: { demo: true },
  aud: "authenticated",
  created_at: new Date(0).toISOString(),
} as unknown as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DEMO_KEY) === "1";
  });

  useEffect(() => {
    // Set listener BEFORE checking session (per Supabase guidance)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        setIsDemo(false);
        localStorage.removeItem(DEMO_KEY);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const realUser = session?.user ?? null;
  const effectiveUser = realUser ?? (isDemo ? demoUser : null);

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        session,
        loading,
        isDemo: isDemo && !realUser,
        enterDemo: () => {
          localStorage.setItem(DEMO_KEY, "1");
          setIsDemo(true);
        },
        signOut: async () => {
          localStorage.removeItem(DEMO_KEY);
          setIsDemo(false);
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);