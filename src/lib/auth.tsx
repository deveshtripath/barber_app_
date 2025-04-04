import { useEffect, useState } from "react";
import {
  register as firebaseRegister,
  login as firebaseLogin,
  signOut as firebaseLogout,
  updateUserProfile as firebaseUpdateUserProfile,
  uploadProfileImage as firebaseUploadProfileImage,
  db, 
} from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export interface User {
  fullName: string;
  phoneNumber: string;
  password?: string;
  location: string;
  image: string;
  isBarber: boolean;
  isLoggedIn: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let isMounted = true;
    
    const fetchCurrentUser = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("isLoggedIn", "==", true));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          if (isMounted) {
            setUser(userDoc.data() as User);
          }
        } else {
          console.warn("No logged-in user found in Firestore.");
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error("Firestore fetch error:", error);
        if (isMounted) setUser(null);
      }
      if (isMounted) setLoading(false);
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    try {
      const userRef = doc(db, "users", phoneNumber);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        throw new Error("User does not exist. Please register first.");
      }
  
      const userData = userSnap.data();
      const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
  
      if (!isPasswordValid) {
        throw new Error("Invalid password.");
      }
  
      try {
        await updateDoc(userRef, { isLoggedIn: true });
        
        setUser({
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          location: userData.location,
          image: userData.image || '',
          isBarber: userData.isBarber,
          isLoggedIn: true
        });
      } catch (updateError) {
        console.error("Firestore update error:", updateError);
        throw new Error("Failed to update login status");
      }
      console.log("User logged in successfully:", userData);
    } catch (error) {
      console.error("Login error:", error.message);
      throw new Error(error.message || "Login failed");
    }
  };

  const register = async (userData: User) => {
    try {
      const regInUser = await firebaseRegister(userData);

      if (regInUser) {
        const userRef = doc(db, "users", userData.phoneNumber);

        await setDoc(userRef, {
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          location: userData.location,
          image: userData.image || "",
          isBarber: userData.isBarber,
          isLoggedIn: true,
        });

        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data() as User);
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const logout = async () => {
    if (user) {
      const userRef = doc(db, "users", user.phoneNumber);
      await updateDoc(userRef, { isLoggedIn: false });
    }
    setUser(null);
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    if (user) {
      const userRef = doc(db, "users", user.phoneNumber);
      await updateDoc(userRef, profileData);
      setUser((prev) => (prev ? { ...prev, ...profileData } : null));
    }
  };

  const uploadProfileImage = async (file: File) => {
    return await firebaseUploadProfileImage(file);
  };

  return {
    user,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
    uploadProfileImage,
  };
};
