import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// User model interface
export interface User {
  fullName: string;
  phoneNumber: string;
  password: string; // Note: Password should be handled securely
  location: string;
  image: string;
  isBarber: boolean;
}

// Function to create a new user
export const createUser = async (userData: User) => {
  try {
    const userRef = collection(db, 'users'); // Assuming 'users' is your collection name
    const docRef = await addDoc(userRef, userData);
    console.log("User created with ID: ", docRef.id);
    return docRef.id; // Return the ID of the created user
  } catch (error) {
    console.error("Error creating user: ", error);
    throw new Error("Failed to create user");
  }
};


// Types
export interface Barber {
  id: string;
  name: string;
  rating: number;
  specialty: {
    id: string;
    name: string;
    description: string;
    time: number;  // in minutes
    money: number; // price for the service
  }[];
  imageUrl: string;
  availability: string;
  phone: string;
  location: string;
  availableTimes?: BarberAvailability[];
}

export interface BarberAvailability {
  id: string;
  barber_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  categoryId: string;
  image?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceIds: string[];
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalPrice: number;
  estimatedWaitTime?: number;
  customerName?: string;
  customerAvatar?: string;
  service?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  backgroundColor: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

interface DataContextType {
  barbers: Barber[];
  services: Service[];
  appointments: Appointment[];
  promotions: Promotion[];
  categories: Category[];
  getBarberById: (id: string) => Barber | undefined;
  getServiceById: (id: string) => Service | undefined;
  getAppointmentById: (id: string) => Appointment | undefined;
  getServicesByCategory: (categoryId: string) => Service[];
  getAppointmentsByCustomer: (customerId: string) => Appointment[];
  getAppointmentsByBarber: (barberId: string) => Appointment[];
  createAppointment: (
    appointment: Omit<Appointment, "id">,
  ) => Promise<Appointment>;
  updateAppointment: (
    id: string,
    updates: Partial<Appointment>,
  ) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  fetchBarbers: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  updateBarberAvailability: (
    barberId: string,
    availabilities: Omit<BarberAvailability, "id" | "barber_id">[],
  ) => Promise<void>;
  getAvailableTimeSlots: (barberId: string, date: Date) => string[];
}

// Create context with default values to prevent null/undefined errors
const DataContext = createContext<DataContextType>({
  barbers: [],
  services: [],
  appointments: [],
  promotions: [],
  categories: [],
  getBarberById: () => undefined,
  getServiceById: () => undefined,
  getAppointmentById: () => undefined,
  getServicesByCategory: () => [],
  getAppointmentsByCustomer: () => [],
  getAppointmentsByBarber: () => [],
  createAppointment: async () => ({
    id: "",
    customerId: "",
    barberId: "",
    serviceIds: [],
    date: "",
    time: "",
    status: "pending",
    totalPrice: 0,
  }),
  updateAppointment: async () => ({
    id: "",
    customerId: "",
    barberId: "",
    serviceIds: [],
    date: "",
    time: "",
    status: "pending",
    totalPrice: 0,
  }),
  cancelAppointment: async () => {},
  fetchBarbers: async () => {},
  fetchServices: async () => {},
  fetchAppointments: async () => {},
  updateBarberAvailability: async () => {},
  getAvailableTimeSlots: () => [],
});

// Mock data for promotions and categories until we implement them in the database
const MOCK_CATEGORIES: Category[] = [
  { id: "haircut", name: "Haircuts", icon: "Scissors" },
  { id: "beard", name: "Beard", icon: "Briefcase" },
  { id: "coloring", name: "Coloring", icon: "Paintbrush" },
  { id: "styling", name: "Styling", icon: "Brush" },
  { id: "shave", name: "Shave", icon: "Droplet" },
  { id: "packages", name: "Packages", icon: "Gift" },
];

const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "1",
    title: "Summer Special",
    description: "Get 20% off on all haircuts",
    discount: "20% OFF",
    expiryDate: "July 31, 2023",
    backgroundColor: "bg-gradient-to-r from-blue-500 to-purple-500",
    icon: "Scissors",
  },
  {
    id: "2",
    title: "Refer a Friend",
    description: "Get $10 off your next appointment",
    discount: "$10 OFF",
    expiryDate: "No expiry",
    backgroundColor: "bg-gradient-to-r from-green-500 to-teal-500",
    icon: "Gift",
  },
  {
    id: "3",
    title: "First-Time Offer",
    description: "30% discount on your first visit",
    discount: "30% OFF",
    expiryDate: "For new customers",
    backgroundColor: "bg-gradient-to-r from-orange-500 to-red-500",
    icon: "Percent",
  },
  {
    id: "4",
    title: "Weekend Special",
    description: "Book on weekends for extra rewards",
    discount: "2X POINTS",
    expiryDate: "Every weekend",
    backgroundColor: "bg-gradient-to-r from-indigo-500 to-purple-600",
    icon: "Calendar",
  },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  // Fetch barbers from Firestore
  const fetchBarbers = async () => {
    try {
      // Query to get barbers
      const usersQuery = query(
        collection(db, "barbers"),
        where("role", "==", "barber")
      );
      const userSnapshot = await getDocs(usersQuery);
      const barberUsers = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      if (barberUsers.length > 0) {
        // Fetch details for each barber (including specialties)
        const barberDetailsPromises = barberUsers.map(async (barberUser: any) => {
          const detailsDoc = await getDoc(doc(db, "barber_details", barberUser.id));
          return detailsDoc.exists()
            ? { id: detailsDoc.id, ...detailsDoc.data() }
            : null;
        });
        const barberDetails = await Promise.all(barberDetailsPromises);
  
        // Fetch availability data for barbers
        const availabilityQuery = query(collection(db, "barber_availability"));
        const availabilitySnapshot = await getDocs(availabilityQuery);
        const barberAvailability = availabilitySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Combine barber data with details and availability
        const combinedBarbers = barberUsers.map((barberUser: any) => {
          const details = barberDetails.find(
            (detail: any) => detail && detail.id === barberUser.id
          );
  
          const availability =
            barberAvailability.filter(
              (avail: any) => avail.barber_id === barberUser.id
            ) || [];
  
          // If details are available, map specialty to array of specialties
          const specialties = details?.specialties || [
            {
              id: "default",
              name: "Haircuts",
              description: "Basic haircuts",
              time: 60, // default 60 minutes
              money: 20, // default $20
            },
          ];
  
          return {
            id: barberUser.id,
            name: barberUser.name,
            rating: details?.rating || 4.5, // default rating
            specialties: specialties.map((specialty: any) => ({
              id: specialty.id,
              name: specialty.name || "Haircuts",
              description: specialty.description || "No description",
              time: specialty.time || 60,
              money: specialty.money || 20,
            })),
            imageUrl:
              barberUser.profile_image ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${barberUser.name
                .toLowerCase()
                .replace(/\s+/g, "")}`,
            availability: details?.availability_status ? "Available" : "Unavailable",
            phone: barberUser.phone || "+1 (555) 123-4567",
            location: details?.location || "Main Street Shop",
            availableTimes: availability,
          };
        });
  
        // Filter out only the barbers that are available
        const availableBarbers = combinedBarbers.filter(
          (barber: Barber) =>
            barber.availability === "Available" &&
            barber.availableTimes &&
            barber.availableTimes.length > 0
        );
  
        // Set available barbers in state
        setBarbers(availableBarbers);
      }
    } catch (error) {
      console.error("Error fetching barbers:", error);
    }
  };
  
  

  // Fetch services from Firestore
  const fetchServices = async () => {
    try {
      // For now, we'll use mock data until we implement services in the database
      // In a real implementation, you would fetch from Firestore
      setServices([
        {
          id: "s1",
          name: "Classic Haircut",
          description: "Traditional haircut with scissors and clippers",
          price: 25,
          duration: 30,
          categoryId: "haircut",
          image:
            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        },
        {
          id: "s2",
          name: "Fade Haircut",
          description: "Modern fade with precision tapering",
          price: 30,
          duration: 45,
          categoryId: "haircut",
          image:
            "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
        },
        {
          id: "s3",
          name: "Beard Trim",
          description: "Shape and trim your beard to perfection",
          price: 15,
          duration: 20,
          categoryId: "beard",
          image:
            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
        },
        {
          id: "s4",
          name: "Beard Styling",
          description: "Full beard styling with hot towel treatment",
          price: 25,
          duration: 30,
          categoryId: "beard",
          image:
            "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=800&q=80",
        },
        {
          id: "s5",
          name: "Hair Coloring",
          description: "Full hair coloring service",
          price: 60,
          duration: 90,
          categoryId: "coloring",
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
        },
        {
          id: "s6",
          name: "Highlights",
          description: "Partial or full highlights",
          price: 80,
          duration: 120,
          categoryId: "coloring",
          image:
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
        },
        {
          id: "s7",
          name: "Hair Styling",
          description: "Professional styling for any occasion",
          price: 35,
          duration: 45,
          categoryId: "styling",
          image:
            "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80",
        },
        {
          id: "s8",
          name: "Hot Towel Shave",
          description: "Traditional hot towel straight razor shave",
          price: 30,
          duration: 30,
          categoryId: "shave",
          image:
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
        },
        {
          id: "s9",
          name: "Complete Package",
          description: "Haircut, beard trim, and hot towel shave",
          price: 65,
          duration: 75,
          categoryId: "packages",
          image:
            "https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=800&q=80",
        },
        {
          id: "s10",
          name: "VIP Experience",
          description: "Haircut, coloring, styling, and complimentary drinks",
          price: 100,
          duration: 120,
          categoryId: "packages",
          image:
            "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&q=80",
        },
      ]);

      // In a real implementation, you would fetch from Firestore like this:
      /*
      const servicesQuery = query(collection(db, "services"));
      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
      */
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // Fetch appointments from Firestore
  const fetchAppointments = async () => {
    if (!user) return;

    try {
      let appointmentsQuery;

      // Filter based on user role
      if (user.role === "customer") {
        appointmentsQuery = query(
          collection(db, "appointments"),
          where("customer_id", "==", user.id),
        );
      } else if (user.role === "barber") {
        appointmentsQuery = query(
          collection(db, "appointments"),
          where("barber_id", "==", user.id),
        );
      } else {
        appointmentsQuery = query(collection(db, "appointments"));
      }

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get customer and barber details for each appointment
      const appointmentsWithDetails = await Promise.all(
        appointmentsData.map(async (appointment: any) => {
          // Get customer details
          const customerDoc = await getDoc(
            doc(db, "users", appointment.customer_id),
          );
          const customerData = customerDoc.exists() ? customerDoc.data() : null;

          // Get barber details
          const barberDoc = await getDoc(
            doc(db, "users", appointment.barber_id),
          );
          const barberData = barberDoc.exists() ? barberDoc.data() : null;

          // Format date and time
          const appointmentDate = new Date(appointment.appointment_time);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          let dateString;
          if (appointmentDate.toDateString() === today.toDateString()) {
            dateString = "Today";
          } else if (
            appointmentDate.toDateString() === tomorrow.toDateString()
          ) {
            dateString = "Tomorrow";
          } else {
            dateString = appointmentDate.toISOString().split("T")[0]; // YYYY-MM-DD
          }

          const timeString = appointmentDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          // Get service details to calculate price
          const service = services.find(
            (s) => s.name === appointment.service_type,
          );
          const price = service?.price || 30; // Default price if service not found

          return {
            id: appointment.id,
            customerId: appointment.customer_id,
            barberId: appointment.barber_id,
            serviceIds: [appointment.service_type],
            date: dateString,
            time: timeString,
            status: appointment.status,
            totalPrice: price,
            customerName: customerData?.name || "Customer",
            customerAvatar:
              customerData?.profile_image ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${customerData?.name || "customer"}`,
            service: appointment.service_type,
          };
        }),
      );

      setAppointments(appointmentsWithDetails);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Update barber availability
  const updateBarberAvailability = async (
    barberId: string,
    availabilities: Omit<BarberAvailability, "id" | "barber_id">[],
  ) => {
    try {
      // First delete existing availability
      const availabilityQuery = query(
        collection(db, "barber_availability"),
        where("barber_id", "==", barberId),
      );
      const availabilitySnapshot = await getDocs(availabilityQuery);

      // Delete existing availability documents
      const deletePromises = availabilitySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(deletePromises);

      // Then insert new availability
      if (availabilities.length > 0) {
        const addPromises = availabilities.map((avail) =>
          addDoc(collection(db, "barber_availability"), {
            barber_id: barberId,
            day_of_week: avail.day_of_week,
            start_time: avail.start_time,
            end_time: avail.end_time,
            created_at: serverTimestamp(),
          }),
        );
        await Promise.all(addPromises);
      }

      // Update barber details to show as available
      await updateDoc(doc(db, "barber_details", barberId), {
        availability_status: availabilities.length > 0,
        updated_at: serverTimestamp(),
      });

      // Refresh barbers
      await fetchBarbers();
    } catch (error) {
      console.error("Error updating barber availability:", error);
      throw error;
    }
  };

  // Get available time slots for a barber on a specific date
  const getAvailableTimeSlots = (barberId: string, date: Date): string[] => {
    const barber = barbers.find((b) => b.id === barberId);
    if (
      !barber ||
      !barber.availableTimes ||
      barber.availableTimes.length === 0
    ) {
      return [];
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();

    // Find availability for this day
    const availability = barber.availableTimes.find(
      (a) => a.day_of_week === dayOfWeek,
    );
    if (!availability) {
      return [];
    }

    // Generate time slots in 30-minute increments
    const slots: string[] = [];
    const startTime = new Date(`1970-01-01T${availability.start_time}`);
    const endTime = new Date(`1970-01-01T${availability.end_time}`);

    // Get existing appointments for this barber on this date
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const existingAppointments = appointments.filter(
      (a) =>
        a.barberId === barberId &&
        (a.date === dateString ||
          a.date === "Today" ||
          a.date === "Tomorrow") &&
        a.status !== "cancelled",
    );

    // Generate slots in 30-minute increments
    const currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Check if this slot is already booked
      const isBooked = existingAppointments.some((a) => a.time === timeString);

      if (!isBooked) {
        slots.push(timeString);
      }

      // Add 30 minutes
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchBarbers();
      fetchServices();
      fetchAppointments();
    }
  }, [user]);

  // Helper functions
  const getBarberById = (id: string) => barbers.find((b) => b.id === id);
  const getServiceById = (id: string) => services.find((s) => s.id === id);
  const getAppointmentById = (id: string) =>
    appointments.find((a) => a.id === id);
  const getServicesByCategory = (categoryId: string) =>
    services.filter((s) => s.categoryId === categoryId);
  const getAppointmentsByCustomer = (customerId: string) =>
    appointments.filter((a) => a.customerId === customerId);
  const getAppointmentsByBarber = (barberId: string) =>
    appointments.filter((a) => a.barberId === barberId);

  // CRUD operations
  const createAppointment = async (appointment: Omit<Appointment, "id">) => {
    try {
      if (!appointment.customerId || !appointment.barberId) {
        throw new Error(`Customer ID and Barber ID are required. Received: ${appointment.customerId}, ${appointment.barberId}`);
      }
  
      const appointmentTime = `${appointment.date}T${appointment.time}`;
  
      const appointmentData = {
        customer_id: appointment.customerId,
        barber_id: appointment.barberId,
        service_type: appointment.serviceIds  || "Unknown Service", // Ensure it exists
        appointment_time: appointmentTime,
        status: "pending",
        total_price: appointment.totalPrice ?? 0,
        created_at: serverTimestamp(),
      };

      console.log(appointmentData);
  
      const appointmentRef = await addDoc(collection(db, "appointments"), appointmentData);
      console.log("jdbiwhfioewhjf2j3");
      if (typeof fetchAppointments === "function") await fetchAppointments();
  
      return { ...appointment, id: appointmentRef.id };
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  };

  const updateAppointment = async (
    id: string,
    updates: Partial<Appointment>,
  ) => {
    try {
      // Format date and time for Firestore
      let appointmentTime;
      if (updates.date && updates.time) {
        appointmentTime = `${updates.date}T${updates.time}`;
      }

      // Update appointment in Firestore
      const updateData: any = {};

      if (appointmentTime) {
        updateData.appointment_time = appointmentTime;
      }

      if (updates.status) {
        updateData.status = updates.status;
      }

      updateData.updated_at = serverTimestamp();

      await updateDoc(doc(db, "appointments", id), updateData);

      // Refresh appointments
      await fetchAppointments();

      // Find the updated appointment in the state
      const updatedAppointment = appointments.find((a) => a.id === id);
      if (!updatedAppointment) throw new Error("Appointment not found");

      // Return the updated appointment
      return {
        ...updatedAppointment,
        ...updates,
      };
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      // Update appointment status to cancelled in Firestore
      await updateDoc(doc(db, "appointments", id), {
        status: "cancelled",
        updated_at: serverTimestamp(),
      });

      // Refresh appointments
      await fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        barbers,
        services,
        appointments,
        promotions,
        categories,
        getBarberById,
        getServiceById,
        getAppointmentById,
        getServicesByCategory,
        getAppointmentsByCustomer,
        getAppointmentsByBarber,
        createAppointment,
        updateAppointment,
        cancelAppointment,
        fetchBarbers,
        fetchServices,
        fetchAppointments,
        updateBarberAvailability,
        getAvailableTimeSlots,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Hook for using data context
export function useData() {
  return useContext(DataContext);
}
