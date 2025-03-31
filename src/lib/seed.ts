import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Function to seed demo data into Firebase
export const seedDemoData = async () => {
  try {
    console.log("Starting to seed demo data...");

    // Seed users (barbers and customers)
    const users = [
      {
        id: "barber1",
        name: "John Smith",
        email: "john@example.com",
        phone: "+15551234567",
        role: "barber",
        profile_image:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=johnsmith",
      },
      {
        id: "barber2",
        name: "Michael Johnson",
        email: "michael@example.com",
        phone: "+15552345678",
        role: "barber",
        profile_image:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=michaeljohnson",
      },
      {
        id: "barber3",
        name: "David Williams",
        email: "david@example.com",
        phone: "+15553456789",
        role: "barber",
        profile_image:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=davidwilliams",
      },
      {
        id: "customer1",
        name: "Sarah Davis",
        email: "sarah@example.com",
        phone: "+15554567890",
        role: "customer",
        profile_image:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahdavis",
      },
      {
        id: "customer2",
        name: "Emily Wilson",
        email: "emily@example.com",
        phone: "+15555678901",
        role: "customer",
        profile_image:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=emilywilson",
      },
      {
        id: "admin1",
        name: "Admin User",
        email: "admin@example.com",
        phone: "+15556789012",
        role: "admin",
        profile_image:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=adminuser",
      },
    ];

    // Add users to Firestore
    for (const user of users) {
      const { id, ...userData } = user;
      await setDoc(doc(db, "users", id), {
        ...userData,
        created_at: serverTimestamp(),
      });
      console.log(`Added user: ${user.name}`);
    }

    // Seed barber details
    const barberDetails = [
      {
        id: "barber1",
        rating: 4.8,
        specialty: "Classic Cuts",
        availability_status: true,
        location: "Main Street Shop",
      },
      {
        id: "barber2",
        rating: 4.6,
        specialty: "Fades & Modern Styles",
        availability_status: true,
        location: "Downtown Location",
      },
      {
        id: "barber3",
        rating: 4.9,
        specialty: "Beard Grooming",
        availability_status: true,
        location: "Uptown Shop",
      },
    ];

    // Add barber details to Firestore
    for (const details of barberDetails) {
      const { id, ...detailsData } = details;
      await setDoc(doc(db, "barber_details", id), {
        ...detailsData,
        created_at: serverTimestamp(),
      });
      console.log(`Added barber details for ID: ${id}`);
    }

    // Seed barber availability
    const availability = [
      // Barber 1 availability
      {
        barber_id: "barber1",
        day_of_week: 1, // Monday
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        barber_id: "barber1",
        day_of_week: 2, // Tuesday
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        barber_id: "barber1",
        day_of_week: 3, // Wednesday
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        barber_id: "barber1",
        day_of_week: 4, // Thursday
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      {
        barber_id: "barber1",
        day_of_week: 5, // Friday
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
      // Barber 2 availability
      {
        barber_id: "barber2",
        day_of_week: 1, // Monday
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      {
        barber_id: "barber2",
        day_of_week: 2, // Tuesday
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      {
        barber_id: "barber2",
        day_of_week: 3, // Wednesday
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      {
        barber_id: "barber2",
        day_of_week: 4, // Thursday
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      {
        barber_id: "barber2",
        day_of_week: 5, // Friday
        start_time: "10:00:00",
        end_time: "18:00:00",
      },
      // Barber 3 availability
      {
        barber_id: "barber3",
        day_of_week: 2, // Tuesday
        start_time: "11:00:00",
        end_time: "19:00:00",
      },
      {
        barber_id: "barber3",
        day_of_week: 3, // Wednesday
        start_time: "11:00:00",
        end_time: "19:00:00",
      },
      {
        barber_id: "barber3",
        day_of_week: 4, // Thursday
        start_time: "11:00:00",
        end_time: "19:00:00",
      },
      {
        barber_id: "barber3",
        day_of_week: 5, // Friday
        start_time: "11:00:00",
        end_time: "19:00:00",
      },
      {
        barber_id: "barber3",
        day_of_week: 6, // Saturday
        start_time: "10:00:00",
        end_time: "16:00:00",
      },
    ];

    // Add availability to Firestore
    for (const avail of availability) {
      await addDoc(collection(db, "barber_availability"), {
        ...avail,
        created_at: serverTimestamp(),
      });
    }
    console.log(`Added ${availability.length} availability records`);

    // Seed some appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = [
      {
        customer_id: "customer1",
        barber_id: "barber1",
        service_type: "Classic Haircut",
        appointment_time: `${today.toISOString().split("T")[0]}T10:00:00`,
        status: "confirmed",
        total_price: 25,
      },
      {
        customer_id: "customer2",
        barber_id: "barber2",
        service_type: "Fade Haircut",
        appointment_time: `${tomorrow.toISOString().split("T")[0]}T14:00:00`,
        status: "pending",
        total_price: 30,
      },
      {
        customer_id: "customer1",
        barber_id: "barber3",
        service_type: "Beard Trim",
        appointment_time: `${nextWeek.toISOString().split("T")[0]}T11:30:00`,
        status: "pending",
        total_price: 15,
      },
    ];

    // Add appointments to Firestore
    for (const appointment of appointments) {
      await addDoc(collection(db, "appointments"), {
        ...appointment,
        created_at: serverTimestamp(),
      });
    }
    console.log(`Added ${appointments.length} appointments`);

    console.log("Demo data seeding completed successfully!");
    return { success: true, message: "Demo data seeded successfully" };
  } catch (error) {
    console.error("Error seeding demo data:", error);
    return { success: false, message: `Error seeding data: ${error}` };
  }
};
