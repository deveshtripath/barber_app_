import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

type UserRole = "customer" | "barber" | "admin";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile_image?: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with default values to prevent null/undefined errors
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Get user profile from database
          const { data: profile, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;

          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              profile_image: profile.profile_image || undefined,
              phone: profile.phone || undefined,
            });
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Get user profile from database
        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            profile_image: profile.profile_image || undefined,
            phone: profile.phone || undefined,
          });
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // First try to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            profile_image: profile.profile_image || undefined,
            phone: profile.phone || undefined,
          });

          // Redirect based on role
          if (profile.role === "customer") {
            navigate("/customer/home");
          } else if (profile.role === "barber") {
            navigate("/barber/dashboard");
          } else if (profile.role === "admin") {
            navigate("/admin/dashboard");
          }
        }
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone: string = "",
  ) => {
    // Allow customer and barber registration from the UI
    if (role !== "customer" && role !== "barber") {
      throw new Error("Only customer and barber registration is allowed");
    }

    setLoading(true);
    try {
      console.log("Starting registration process for:", { name, email, role });

      // Prepare the request body
      const requestBody = {
        name,
        email,
        password,
        phone,
        role,
      };

      // Prepare authorization header with environment variables
      const authHeader = `SUPABASE_URL=${import.meta.env.VITE_SUPABASE_URL} SUPABASE_SERVICE_KEY=${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

      console.log("Invoking create-user function with body:", requestBody);
      console.log("Auth header exists:", authHeader);

      // Use the create-user edge function to create the user with hashed password
      const response = await supabase.functions.invoke("create-user", {
        body: requestBody,
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      console.log("Create-user response received:", response);

      if (!response.data || response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error?.message || "Failed to create user");
      }

      const { user: newUserData } = response.data;
      console.log("User created successfully:", newUserData);

      // Sign in the user
      console.log("Signing in user:", email);
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error("Auth error during sign in:", authError);
        throw authError;
      }

      console.log("User signed in successfully:", authData?.user?.id);

      // Get user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select()
        .eq("id", authData.user?.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      console.log("User profile fetched successfully:", profileData);

      setUser({
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        profile_image: profileData.profile_image || undefined,
        phone: profileData.phone || undefined,
      });

      console.log("User state updated, redirecting to appropriate page");
      // Redirect based on role
      if (role === "customer") {
        navigate("/customer/home");
      } else if (role === "barber") {
        navigate("/barber/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error.message);
      console.error("Registration error details:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    } else if (
      !loading &&
      isAuthenticated &&
      allowedRoles &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      // Redirect to appropriate home based on role if trying to access unauthorized route
      if (user.role === "customer") {
        navigate("/customer/home");
      } else if (user.role === "barber") {
        navigate("/barber/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [loading, isAuthenticated, navigate, user, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
