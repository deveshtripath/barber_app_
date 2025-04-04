import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { DataProvider } from "./lib/data";
import AddBarber from "./pages/admin/AddBarber";

// Customer Pages
const CustomerHome = lazy(() => import("./pages/customer/Home"));
const CustomerAppointments = lazy(() => import("./pages/customer/Appointments"));
const CustomerAppointmentDetail = lazy(() => import("./pages/customer/AppointmentDetail"));
const CustomerAppointmentBooking = lazy(() => import("./pages/customer/AppointmentBooking"));
const CustomerAppointmentReschedule = lazy(() => import("./pages/customer/AppointmentReschedule"));
const CustomerServices = lazy(() => import("./pages/customer/Services"));
const CustomerServiceDetail = lazy(() => import("./pages/customer/ServiceDetail"));
const CustomerProfile = lazy(() => import("./pages/customer/Profile"));
const CustomerRewards = lazy(() => import("./pages/customer/Rewards"));
const CustomerNotifications = lazy(() => import("./pages/customer/Notifications"));
const CustomerHairstyles = lazy(() => import("./pages/customer/Hairstyles"));

// Barber Pages
const BarberDashboard = lazy(() => import("./pages/barber/Dashboard"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

function App() {
  return (
    <DataProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Default Route to Login */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Customer Routes */}
            <Route path="/customer" element={<Navigate to="/customer/home" />} />
            <Route path="/admin/add-barber" element={<AddBarber />} />
            <Route path="/customer/home" element={<CustomerHome />} />
            <Route path="/customer/appointments" element={<CustomerAppointments />} />
            <Route path="/customer/appointments/:appointmentId" element={<CustomerAppointmentDetail />} />
            <Route path="/customer/appointments/new" element={<CustomerAppointmentBooking />} />
            <Route path="/customer/appointments/reschedule/:appointmentId" element={<CustomerAppointmentReschedule />} />
            <Route path="/customer/services" element={<CustomerServices />} />
            <Route path="/customer/services/:serviceId" element={<CustomerServiceDetail />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/rewards" element={<CustomerRewards />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
            <Route path="/customer/hairstyles" element={<CustomerHairstyles />} />

            {/* Barber Routes */}
            <Route path="/barber" element={<Navigate to="/barber/dashboard" />} />
            <Route path="/barber/dashboard" element={<BarberDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/customer/home" />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </DataProvider>
  );
}

export default App;
