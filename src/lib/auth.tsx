import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateEmail,
  updatePassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, googleProvider } from "./firebase";

type UserRole = "customer" | "barber" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile_image?: string;
  phone: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone: string,
  ) => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  loginWithOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  register: async () => {},
  login: async () => ({ success: false, message: "Not implemented" }),
  loginWithGoogle: async () => ({ success: false, message: "Not implemented" }),
  loginWithOtp: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  uploadProfileImage: async () => "",
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Initialize recaptcha verifier
  const initRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
    }
    return window.recaptchaVerifier;
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<UserProfile, "id">;
            setUser({
              id: firebaseUser.uid,
              ...userData,
            });
          } else {
            // If user document doesn't exist in Firestore, create it
            const newUser: Omit<UserProfile, "id"> = {
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              role: "customer", // Default role
              phone: firebaseUser.phoneNumber || "",
              profile_image: firebaseUser.photoURL || "",
            };

            await setDoc(doc(db, "users", firebaseUser.uid), newUser);
            setUser({
              id: firebaseUser.uid,
              ...newUser,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register a new user
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone: string,
  ) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Update profile with name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData: Omit<UserProfile, "id"> = {
        name,
        email,
        role,
        phone,
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase().replace(/\s+/g, "")}`,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      // If user is a barber, create barber profile
      if (role === "barber") {
        await setDoc(doc(db, "barber_details", firebaseUser.uid), {
          specialty: "Haircuts",
          experience: 1,
          rating: 4.5,
          location: "Main Street Shop",
          availability_status: true,
        });
      }

      // Update state
      setUser({
        id: firebaseUser.uid,
        ...userData,
      });
    } catch (error: any) {
      console.error("Error registering user:", error);
      throw new Error(error.message || "Failed to register");
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: "Login successful" };
    } catch (error: any) {
      console.error("Error logging in:", error);
      let message = "Failed to login";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        message = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed login attempts. Please try again later.";
      }
      return { success: false, message };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User data will be automatically created/updated by the auth state change listener
      return { success: true, message: "Google login successful" };
    } catch (error: any) {
      console.error("Google login error:", error);
      return {
        success: false,
        message: error.message || "Failed to login with Google",
      };
    }
  };

  // Login with phone OTP
  const loginWithOtp = async (phoneNumber: string) => {
    try {
      const verifier = initRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier,
      );
      setConfirmationResult(confirmation);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      throw new Error(error.message || "Failed to send OTP");
    }
  };

  // Verify OTP
  const verifyOtp = async (phoneNumber: string, otp: string) => {
    try {
      if (!confirmationResult) {
        throw new Error(
          "No confirmation result found. Please request OTP again.",
        );
      }

      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        const userData: Omit<UserProfile, "id"> = {
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          role: "customer", // Default role
          phone: phoneNumber,
          profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        };

        await setDoc(doc(db, "users", firebaseUser.uid), userData);
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      throw new Error(error.message || "Failed to verify OTP");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error("Error logging out:", error);
      throw new Error(error.message || "Failed to logout");
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in");

    try {
      // Update in Firestore
      await updateDoc(doc(db, "users", user.id), data);

      // Update in Auth if name is changed
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }

      // Update email if changed
      if (
        data.email &&
        auth.currentUser &&
        data.email !== auth.currentUser.email
      ) {
        await updateEmail(auth.currentUser, data.email);
      }

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  };

  // Upload profile image
  const uploadProfileImage = async (file: File): Promise<string> => {
    if (!user) throw new Error("No user logged in");

    try {
      // Create a storage reference
      const storageRef = ref(storage, `profile_images/${user.id}/${file.name}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile with new image URL
      await updateUserProfile({ profile_image: downloadURL });

      return downloadURL;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw new Error(error.message || "Failed to upload image");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        loginWithGoogle,
        loginWithOtp,
        verifyOtp,
        logout,
        updateUserProfile,
        uploadProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Protected route component
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Please log in to access this page.
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        You don't have permission to access this page.
      </div>
    );
  }

  return <>{children}</>;
};
