import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("🔵 AuthProvider rendered", {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
  });

  // Helper function to fetch user profile from database
  const fetchUserProfile = async (authUserId: string): Promise<User | null> => {
    console.log("🔍 Fetching user profile for:", authUserId);
    try {
      console.log("📊 Starting database query...");
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUserId)
        .single();

      console.log("📊 Database query complete:", { hasData: !!data, error });

      if (error) {
        console.error("❌ Error fetching user profile:", error);
        return null;
      }

      if (data) {
        console.log("✅ User profile fetched:", data);
        const userProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatarUrl:
            data.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              data.name
            )}&background=8c52ff&color=fff`,
          phone: data.phone,
          location: data.location,
          timezone: data.timezone,
          language: data.language,
        };
        console.log("✅ Returning user profile:", userProfile);
        return userProfile;
      }

      console.log("⚠️ No user data returned");
      return null;
    } catch (error) {
      console.error("❌ Exception fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log("🚀 AuthProvider useEffect starting...");

    // Check for existing session on mount
    const initializeAuth = async () => {
      console.log("🔐 Initializing auth...");
      try {
        console.log("📞 Calling supabase.auth.getSession()...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("📦 Session response:", {
          session: !!session,
          error,
          userId: session?.user?.id,
        });

        if (error) {
          console.error("❌ Error getting session:", error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log("✅ Session found, fetching user profile...");
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            console.log("✅ Setting user and authenticated state");
            setUser(userProfile);
            setIsAuthenticated(true);
          } else {
            console.log("❌ User profile not found in database");
          }
        } else {
          console.log("ℹ️ No active session found");
        }
      } catch (error) {
        console.error("❌ Exception initializing auth:", error);
      } finally {
        console.log("🏁 Setting isLoading to false");
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    console.log("👂 Setting up auth state listener...");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state changed:", event, {
        userId: session?.user?.id,
      });

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in");

        setIsAuthenticated(true); // <-- REQUIRED
        setUser(session.user); // <-- REQUIRED

        const userProfile = await fetchUserProfile(session.user.id);
        console.log("📦 Profile fetch result:", { hasProfile: !!userProfile });
        if (userProfile) {
          console.log("✅ Setting user state and authenticated");
          setUser(userProfile);
          setIsAuthenticated(true);
        } else {
          console.log("❌ No profile returned, user not authenticated");
        }
        console.log("🏁 Setting isLoading to false after SIGNED_IN");
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        console.log("👋 User signed out");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token refreshed");
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          setUser(userProfile);
          setIsAuthenticated(true);
        }
      } else if (event === "USER_UPDATED" && session?.user) {
        console.log("👤 User updated");
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          setUser(userProfile);
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      console.log("🧹 Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("🔑 Login attempt for:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Login error:", error.message);
        return false;
      }

      if (data.user) {
        console.log("✅ Login successful, fetching profile...");
        const userProfile = await fetchUserProfile(data.user.id);
        if (userProfile) {
          setUser(userProfile);
          setIsAuthenticated(true);
          return true;
        } else {
          console.error("❌ User profile not found after login");
          return false;
        }
      }

      return false;
    } catch (error: any) {
      console.error("❌ Login exception:", error.message);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    console.log("📝 Signup attempt for:", email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error("❌ Signup error:", error.message);
        return false;
      }

      if (data.user) {
        console.log("✅ User created in auth, creating profile...");
        const { error: insertError } = await supabase.from("users").insert({
          auth_id: data.user.id,
          name,
          email,
          role: "USER",
        });

        if (insertError) {
          console.error("❌ Error creating user profile:", insertError);
          return false;
        }

        if (data.session) {
          console.log("✅ User immediately signed in (no confirmation needed)");
          const userProfile = await fetchUserProfile(data.user.id);
          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
            return true;
          }
        } else {
          console.log("📧 Email confirmation required");
          return true;
        }
      }

      return false;
    } catch (error: any) {
      console.error("❌ Signup exception:", error.message);
      return false;
    }
  };

  const logout = async () => {
    console.log("👋 Logout initiated");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    console.log("🔄 Updating user:", userData);
    try {
      const dbUserData: any = {};
      if (userData.name) dbUserData.name = userData.name;
      if (userData.email) dbUserData.email = userData.email;
      if (userData.role) dbUserData.role = userData.role;
      if (userData.avatarUrl) dbUserData.avatar_url = userData.avatarUrl;
      if (userData.phone) dbUserData.phone = userData.phone;
      if (userData.location) dbUserData.location = userData.location;
      if (userData.timezone) dbUserData.timezone = userData.timezone;
      if (userData.language) dbUserData.language = userData.language;

      const { data, error } = await supabase
        .from("users")
        .update(dbUserData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        console.log("✅ User updated successfully");
        const updatedUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatarUrl: data.avatar_url || user.avatarUrl,
          phone: data.phone,
          location: data.location,
          timezone: data.timezone,
          language: data.language,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setIsLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
