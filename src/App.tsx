import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { AuthProvider, ProtectedRoute } from "./lib/auth";
import { DataProvider } from "./lib/data";

// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

// Customer Pages
const CustomerHome = lazy(() => import("./pages/customer/Home"));
const CustomerAppointments = lazy(
  () => import("./pages/customer/Appointments"),
);
const CustomerAppointmentDetail = lazy(
  () => import("./pages/customer/AppointmentDetail"),
);
const CustomerAppointmentBooking = lazy(
  () => import("./pages/customer/AppointmentBooking"),
);
const CustomerAppointmentReschedule = lazy(
  () => import("./pages/customer/AppointmentReschedule"),
);
const CustomerServices = lazy(() => import("./pages/customer/Services"));
const CustomerServiceDetail = lazy(
  () => import("./pages/customer/ServiceDetail"),
);
const CustomerProfile = lazy(() => import("./pages/customer/Profile"));
const CustomerRewards = lazy(() => import("./pages/customer/Rewards"));
const CustomerNotifications = lazy(
  () => import("./pages/customer/Notifications"),
);
const CustomerHairstyles = lazy(() => import("./pages/customer/Hairstyles"));

// Barber Pages
const BarberDashboard = lazy(() => import("./pages/barber/Dashboard"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

function App() {
  return (
    <AuthProvider>
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
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <Navigate to="/customer/home" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/home"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/appointments"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/appointments/:appointmentId"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerAppointmentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/appointments/new"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerAppointmentBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/appointments/reschedule/:appointmentId"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerAppointmentReschedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/services"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/services/:serviceId"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerServiceDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/rewards"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerRewards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/notifications"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/hairstyles"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerHairstyles />
                  </ProtectedRoute>
                }
              />

              {/* Barber Routes */}
              <Route
                path="/barber"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <Navigate to="/barber/dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barber/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <BarberDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Navigate to="/admin/dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          </>
        </Suspense>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
