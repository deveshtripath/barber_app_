import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

// Types
export interface Barber {
  id: string;
  name: string;
  rating: number;
  specialty: string;
  imageUrl: string;
  availability: string;
  phone: string;
  location: string;
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

  // Fetch barbers from database
  const fetchBarbers = async () => {
    try {
      // Get barber profiles
      const { data: barberUsers, error: barberError } = await supabase
        .from("users")
        .select("id, name, email, phone, profile_image, role")
        .eq("role", "barber");

      if (barberError) throw barberError;

      if (barberUsers) {
        // Get barber details
        const { data: barberDetails, error: detailsError } = await supabase
          .from("barbers")
          .select(
            "id, shop_name, rating, services_offered, availability_status",
          );

        if (detailsError) throw detailsError;

        // Combine user profiles with barber details
        const combinedBarbers = barberUsers.map((barberUser) => {
          const details = barberDetails?.find(
            (detail) => detail.id === barberUser.id,
          );
          return {
            id: barberUser.id,
            name: barberUser.name,
            rating: details?.rating || 4.5,
            specialty: details?.services_offered?.specialty || "Haircuts",
            imageUrl:
              barberUser.profile_image ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${barberUser.name.toLowerCase().replace(/\s+/g, "")}`,
            availability: details?.availability_status ? "Today" : "Tomorrow",
            phone: barberUser.phone || "+1 (555) 123-4567",
            location: details?.shop_name || "Main Street Shop",
          };
        });

        setBarbers(combinedBarbers);
      }
    } catch (error) {
      console.error("Error fetching barbers:", error);
    }
  };

  // Fetch services from database
  const fetchServices = async () => {
    try {
      // For now, we'll use mock data until we implement services in the database
      // In a real implementation, you would fetch from the database
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
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // Fetch appointments from database
  const fetchAppointments = async () => {
    if (!user) return;

    try {
      let query = supabase.from("appointments").select(`
          id, 
          appointment_time, 
          service_type, 
          status, 
          barber_id, 
          customer_id
        `);

      // Filter based on user role
      if (user.role === "customer") {
        query = query.eq("customer_id", user.id);
      } else if (user.role === "barber") {
        query = query.eq("barber_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Get customer and barber details for each appointment
        const appointmentsWithDetails = await Promise.all(
          data.map(async (appointment) => {
            // Get customer details
            const { data: customerData } = await supabase
              .from("users")
              .select("name, profile_image")
              .eq("id", appointment.customer_id)
              .single();

            // Get barber details
            const { data: barberData } = await supabase
              .from("users")
              .select("name")
              .eq("id", appointment.barber_id)
              .single();

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

            // Calculate price based on service type (simplified)
            const price = 30; // Default price

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
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
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
      // Call the book-appointment edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-book-appointment",
        {
          body: {
            barber_id: appointment.barberId,
            service_type: appointment.serviceIds[0], // Using first service for now
            appointment_time: `${appointment.date}T${appointment.time}`,
          },
        },
      );

      if (error) throw error;

      // Refresh appointments after creating a new one
      await fetchAppointments();

      // Return the created appointment
      return {
        ...appointment,
        id: data.appointment.id,
      };
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
      // Format date and time for database
      let appointmentTime;
      if (updates.date && updates.time) {
        appointmentTime = `${updates.date}T${updates.time}`;
      }

      // Update appointment in database
      const { data, error } = await supabase
        .from("appointments")
        .update({
          appointment_time: appointmentTime,
          status: updates.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

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
      // Update appointment status to cancelled
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Hook for using data context
export const useData = () => {
  const context = useContext(DataContext);
  return context;
};
