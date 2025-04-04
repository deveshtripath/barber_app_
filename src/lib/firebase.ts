import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, setDoc, collection, addDoc, getDocs, query, where, getDoc } from "firebase/firestore";
import { getStorage, connectStorageEmulator, ref, uploadBytes } from "firebase/storage";
import bcrypt from "bcryptjs"; // Import bcrypt for hashing

// Define User interface
export interface User {
  fullName: string;
  phoneNumber: string;
  password?: string; // Optional (not stored in Firestore)
  location: string;
  image: string;
  isBarber: boolean;
  isLoggedIn: boolean;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANBfJ8XLuwi7jSA49MZ4gHlUpc_TrGktQ",
  authDomain: "barber-queue-79852.firebaseapp.com",
  projectId: "barber-queue-79852",
  storageBucket: "barber-queue-79852.firebasestorage.app",
  messagingSenderId: "595099205989",
  appId: "1:595099205989:web:0eaa74042b564b7d5e218c",
  measurementId: "G-LZFL0MFD74",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Function to register a new user
export const register = async (userData: User) => {
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create Firestore document with phone number as the unique key
    const userRef = doc(db, "users", userData.phoneNumber);
    const user = await setDoc(userRef, {
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      passwordHash: hashedPassword, // Store hashed password
      location: userData.location,
      image: userData.image,
      isBarber: userData.isBarber,
      isLoggedIn: true,
    });

    console.log("User registered successfully:", userData.phoneNumber);
    return { success: true, message: "User registered successfully." };
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("Failed to register user");
  }
};

// Function to store user profile data in Firestore
export const storeUserProfile = async (userId, profileData) => {
  const userDocRef = doc(db, "users", userId);
  try {
    await setDoc(userDocRef, profileData);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to add a new barber
export const addBarber = async (barberData: any) => {
  try {
    const barberRef = collection(db, "barbers");
    await addDoc(barberRef, {
      name: barberData.name,
      contact: barberData.contact,
      profileImage: barberData.profileImage,
      specialties: barberData.specialties, // Save specialties array
      imageUrl: barberData.imageUrl,
      availability: barberData.availability,
      phone: barberData.phone,
      location: barberData.location,
      availableTimes: barberData.availableTimes,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding barber:", error);
    throw new Error(error.message);
  }
};


// Function to get all barbers
export const getBarbers = async () => {
  try {
    const barberCollectionRef = collection(db, "barbers");
    const barberSnapshot = await getDocs(barberCollectionRef);
    const barberList = barberSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Unknown",
        rating: data.rating || 0,
        specialty: data.specialty || "Not specified",
        imageUrl: data.imageUrl || "",
        availability: data.availability || "Unknown",
      };
    });
    return barberList;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getServicesByBarberId = async (barberId: string) => {
  try {
    // Check if barberId is valid
    if (!barberId) {
      throw new Error('Invalid barber ID');
    }

    // Define the reference to the barber document
    const barberRef = doc(db, 'barbers', barberId);
    
    // Fetch the barber document
    const barberDoc = await getDoc(barberRef);
    
    // Check if the document exists
    if (!barberDoc.exists()) {
      throw new Error('Barber not found');
    }

    // Extract specialties data from the barber document
    const barberData = barberDoc.data();
    const specialties = barberData?.specialties || []; // Default to an empty array if no specialties

    console.log('Fetched Specialties:', specialties); // Log the specialties data

    return specialties;
  } catch (error) {
    console.error('Error fetching barber specialties:', error.message);
    throw new Error('Failed to fetch specialties');
  }
};



// Function to create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const appointmentCollectionRef = collection(db, "appointments");
    const docRef = await addDoc(appointmentCollectionRef, appointmentData);
    return docRef.id; // Return the ID of the newly created appointment
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to log in an existing user
export const login = async (phoneNumber: string, password: string) => {
  try {
    // Query Firestore for user by phone number
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phoneNumber", "==", phoneNumber));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error("User not found.");
    }

    // Extract user data
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    console.log("User Data:", userData);

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid password.");
    }

    console.log("User logged in successfully:", userData);
    return { success: true, user: userData };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.message || "Login failed");
  }
};

// Helper function to get user document reference by phone number
export const getUserRef = (phoneNumber: string) => {
  return doc(db, "users", phoneNumber);
};


// Function to update user profile
export const updateUserProfile = async (profileData) => {
  const userDocRef = doc(db, "users", auth.currentUser.uid);
  try {
    await setDoc(userDocRef, profileData, { merge: true });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to upload profile image
export const uploadProfileImage = async (file) => {
  const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
  try {
    await uploadBytes(storageRef, file);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Connect to emulators in development environment
if (import.meta.env.DEV) {
  // Uncomment these lines if you're running Firebase emulators locally
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

// Initialize Firebase auth persistence
import { browserLocalPersistence } from "firebase/auth";
auth.setPersistence(browserLocalPersistence);

export default app;
