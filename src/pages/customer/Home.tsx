import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import FeaturedBarbers from "@/components/customer/FeaturedBarbers";
import ServiceCategories from "@/components/customer/ServiceCategories";
import UpcomingAppointment from "@/components/customer/UpcomingAppointment";
import PromotionsBanner from "@/components/customer/PromotionsBanner";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  // Handlers for various actions
  const handleBookNow = (barberId: string) => {
    // Navigate to booking page with barber ID
    navigate(`/customer/booking?barber=${barberId}`);
  };

  const handleCategorySelect = (categoryId: string) => {
    // Navigate to services page with category filter
    navigate(`/customer/services?category=${categoryId}`);
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    // Navigate to reschedule page
    navigate(`/customer/appointments/reschedule/${appointmentId}`);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    // Show confirmation dialog and handle cancellation
    console.log(`Cancelling appointment ${appointmentId}`);
  };

  const handleCallBarber = (phone: string) => {
    // Handle calling barber
    console.log(`Calling ${phone}`);
  };

  const handleNotificationClick = () => {
    navigate("/customer/notifications");
  };

  const handleProfileClick = () => {
    navigate("/customer/profile");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onNotificationClick={handleNotificationClick}
        onProfileClick={handleProfileClick}
      />

      {/* Main Content */}
      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        {/* Search Bar */}
        <div className="p-4 bg-white sticky top-[60px] z-10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search barbers, services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Upcoming Appointment (if exists) */}
        <div className="p-4">
          <UpcomingAppointment
            onReschedule={handleRescheduleAppointment}
            onCancel={handleCancelAppointment}
            onCall={handleCallBarber}
          />
        </div>

        {/* Promotions Banner */}
        <PromotionsBanner />

        {/* Featured Barbers */}
        <FeaturedBarbers onBookNow={handleBookNow} />

        {/* Service Categories */}
        <div className="p-4">
          <ServiceCategories onCategorySelect={handleCategorySelect} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 justify-start px-4 border-gray-200 hover:bg-gray-50"
              onClick={() => navigate("/customer/appointments/new")}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Book Appointment</span>
                <span className="text-xs text-gray-500">
                  Find available slots
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-14 justify-start px-4 border-gray-200 hover:bg-gray-50"
              onClick={() => navigate("/customer/appointments")}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">My Appointments</span>
                <span className="text-xs text-gray-500">
                  View history & upcoming
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-14 justify-start px-4 border-gray-200 hover:bg-gray-50"
              onClick={() => navigate("/customer/rewards")}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Loyalty Rewards</span>
                <span className="text-xs text-gray-500">Check your points</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-14 justify-start px-4 border-gray-200 hover:bg-gray-50"
              onClick={() => navigate("/customer/hairstyles")}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Try Hairstyles</span>
                <span className="text-xs text-gray-500">Virtual try-on</span>
              </div>
            </Button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Home;
