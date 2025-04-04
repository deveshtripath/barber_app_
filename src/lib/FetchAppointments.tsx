import { db } from './firebase'; // Ensure you have the correct import for your Firebase setup
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from './auth';

import { getAuth } from "firebase/auth";

// Function to fetch all appointments
export const fetchAppointments = async (user) => {
  // console.log("Before useAuth", user);
  // const { user } = useAuth();
  // console.log("User from useAuth:", user.uid); // Log the user object
  if (!user) {
    console.log("User is not authenticated");
    return;
  }

  // const auth = getAuth();
  // console.log("jdbiwhfioewhjf2j3", auth);
  // if (!auth.currentUser) {
  //   throw new Error("User is not authenticated.");
  // }

  try {
    let appointmentsQuery;
    // Filter based on user role
    if (user.role === "customer") {
      appointmentsQuery = query(
        collection(db, "appointments"),
        where("customer_id", "==", user.uid),
      );
    } else if (user.role === "barber") {
      appointmentsQuery = query(
        collection(db, "appointments"),
        where("barber_id", "==", user.uid),
      );
    } else {
      appointmentsQuery = query(collection(db, "appointments"));
    }
    console.log("Appointments Query:", appointmentsQuery); // Log the query for debugging
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>), // Type assertion to ensure data is treated as an object
    }));
    return appointmentsData;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error(error);
  }
};
