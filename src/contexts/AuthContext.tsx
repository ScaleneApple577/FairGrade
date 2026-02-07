import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export type UserRole = "teacher" | "student" | null;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);

  // Fetch user role from database
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      
      return data?.role as UserRole || null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  }, []);

  // Build AuthUser from Supabase user and role
  const buildAuthUser = useCallback((supabaseUser: User, userRole: UserRole): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      fullName: supabaseUser.user_metadata?.full_name || null,
      role: userRole,
    };
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (currentSession?.user) {
      const userRole = await fetchUserRole(currentSession.user.id);
      const authUser = buildAuthUser(currentSession.user, userRole);
      setUser(authUser);
      setRole(userRole);
      setSession(currentSession);
    } else {
      setUser(null);
      setRole(null);
      setSession(null);
    }
  }, [fetchUserRole, buildAuthUser]);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Defer role fetching to prevent deadlock
          setTimeout(async () => {
            const userRole = await fetchUserRole(currentSession.user.id);
            const authUser = buildAuthUser(currentSession.user, userRole);
            setUser(authUser);
            setRole(userRole);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user) {
        const userRole = await fetchUserRole(existingSession.user.id);
        const authUser = buildAuthUser(existingSession.user, userRole);
        setUser(authUser);
        setRole(userRole);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole, buildAuthUser]);

  // Login with email/password
  const login = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { error: new Error("Invalid email or password. Please try again.") };
        }
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  // Signup with email/password
  const signup = useCallback(async (
    email: string, 
    password: string, 
    fullName: string, 
    userRole: UserRole
  ): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          return { error: new Error("An account with this email already exists. Please sign in instead.") };
        }
        return { error: new Error(error.message) };
      }

      // Set user role
      if (data.user && userRole) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role: userRole });

        if (roleError) {
          console.error("Error setting role:", roleError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  // Login with Google
  const loginWithGoogle = useCallback(async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    role,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
