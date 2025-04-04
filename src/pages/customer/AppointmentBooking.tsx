import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/customer/Header"; // Corrected import path
import BottomNavigation from "../../components/customer/BottomNavigation";
import { useData } from "../../lib/data";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Calendar } from "../../components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Check,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { getBarbers, getServicesByBarberId } from "../../lib/firebase"; // Import the updated getBarbers function
import { BarberProps } from "../../types/barber_updated.types"; // Import BarberProps from the updated file

const AppointmentBookingTemp = () => {
  const [showServices, setShowServices] = useState(false); // State to control service visibility
  const { user } = useAuth();
  const { services, createAppointment } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const barberId = searchParams.get("barber") || "";
  const serviceId = searchParams.get("service") || "";

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>(barberId);
  const [selectedServices, setSelectedServices] = useState<string[]>(serviceId ? [serviceId] : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
  ]); // Added dummy time slots
  const [barbers, setBarbers] = useState<BarberProps[]>([]); // State to hold barbers
  const [filteredServices, setFilteredServices] = useState([]); // State to hold filtered services
  const [barberServices, setBarberServices] = useState<any[]>([]); // Holds the services for the selected barber
  const [showServicesTab, setShowServicesTab] = useState<boolean>(false); // Control visibility of services tab

  // Fetch barbers
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const barberList = await getBarbers(); // Ensure this returns the correct structure
        const formattedBarbers = barberList.map(barber => ({
          ...barber,
          availability_status: barber.availability, // Ensure all required properties are present
          experience: barber.experience || 0, // Default value if not present
          shop_name: barber.shop_name || "Unknown", // Default value if not present
          services_offered: barber.services_offered || [], // Default value if not present
        }));
        setBarbers(formattedBarbers || []); // Default to an empty array if undefined
        console.log("Fetched barber list:", barberList); // Debugging
      } catch (err: any) {
        setError(err.message || "Failed to load barbers");
      }
    };
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (selectedBarber) {
      const fetchBarberServices = async () => {
        try {
          const services = await getServicesByBarberId(selectedBarber); // Fetch services by barber ID
          setBarberServices(services); // Update the state with the fetched services
        } catch (err) {
          console.error("Error fetching barber services:", err);
        }
      };
      fetchBarberServices();
    }
  }, [selectedBarber]);

  // Fetch services based on selected barber
  useEffect(() => {
    if (selectedBarber) {
      const barber = barbers.find(b => b.id === selectedBarber);
      if (barber) {
        const servicesForBarber = barber.services_offered || []; // Fetch services from barber's data
        setFilteredServices(servicesForBarber);
        setShowServices(true); // Show services if a barber is selected
      }
    } else {
      setFilteredServices([]); // Reset to no services if no barber is selected
      setShowServices(false); // Hide services if no barber is selected
    }
  }, [selectedBarber, barbers]);

  // Calculate total price
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = filteredServices.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Calculate total duration
  const totalDuration = selectedServices.reduce((total, serviceId) => {
    const service = filteredServices.find((s) => s.id === serviceId);
    return total + (service?.duration || 0);
  }, 0);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };
  
  const handleBookAppointment = async () => {
    if (
      !user ||
      !selectedDate ||
      !selectedTime ||
      !selectedBarber ||
      selectedServices.length === 0
    ) {
      setError("Please select all required fields");
      return;
    }

    console.log("Selected Services:", selectedServices[0]); // Debugging line

    setError(null);
    setIsLoading(true);
    try {
      // Format date for display
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // console.log(user);

      // Create appointment
      const appointmentId = await createAppointment({
        customerId: user.phoneNumber,
        barberId: selectedBarber,
        serviceIds: selectedServices[0],
        date: formattedDate,
        time: selectedTime,
        status: "pending",
        totalPrice: totalPrice,
      });

      // Navigate to appointments page with the appointment ID
      navigate("/customer/appointments");
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      setError(
        error.message || "Failed to book appointment. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="services" className="mb-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="barber">Barber</TabsTrigger>
              <TabsTrigger value="services" disabled={!showServices}>Services</TabsTrigger>
              <TabsTrigger value="datetime">Date & Time</TabsTrigger>
            </TabsList>

            {/* Barber Tab */}
            <TabsContent value="barber">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Barber</CardTitle>
                </CardHeader>
                <CardContent>
                  {barbers.length > 0 ? (
                    <div className="space-y-3">
                      {barbers.map((barber) => (
                        <div
                          key={barber.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedBarber === barber.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200"
                          }`}
                          onClick={() => setSelectedBarber(barber.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={barber.imageUrl} alt={barber.name} />
                              <AvatarFallback>
                                {barber.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{barber.name}</h3>
                              {barber.specialties && Array.isArray(barber.specialties) ? (
                                barber.specialties.map((spec) => (
                                  <p key={spec.id}>{spec.name}</p>
                                ))
                              ) : (
                                <p>No specialties available for this barber.</p>
                              )}
                              <div className="flex items-center mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    barber.availability_status ? "text-green-500" : "text-red-500"
                                  }`}
                                >
                                  {barber.availability_status ? "Available" : "Unavailable"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No barbers available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            {selectedBarber && barberServices.length > 0 && (
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {barberServices.map((service) => (
                        <div
                          key={service.name || `${service.name}-${service.duration}`}  // Ensure unique key by combining properties if id is missing or duplicate
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedServices.includes(service.id)
                              ? "border-primary bg-primary/5"
                              : "border-gray-200"
                          }`}
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{service.name}</h3>
                              <p className="text-sm text-gray-500">{service.description}</p>
                              <div className="flex items-center space-x-3 mt-1">
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span className="text-xs">{service.duration} min</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  <span className="text-xs">${service.money}</span>
                                </div>
                              </div>
                            </div>
                            {selectedServices.includes(service.id) && (
                              <div className="bg-primary text-white p-1 rounded-full">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            {/* Date & Time Tab */}
            <TabsContent value="datetime">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Date & Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Date</span>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="border rounded-md p-3"
                      disabled={{
                        before: new Date(),
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Time</span>
                    </div>
                    {availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            className="text-sm"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-md">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No available time slots for this date.</p>
                        <p className="text-sm mt-1">
                          Please select another date or barber.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Services:</span>
                  <span className="font-medium">
                    {selectedServices.length > 0
                      ? selectedServices
                          .map((id) => filteredServices.find((s) => s.id === id)?.name)
                          .join(", ")
                      : "None selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Barber:</span>
                  <span className="font-medium">
                    {selectedBarber
                      ? barbers.find((b) => b.id === selectedBarber)?.name
                      : "None selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">
                    {selectedDate
                      ? format(selectedDate, "MMMM d, yyyy")
                      : "None selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="font-medium">
                    {selectedTime || "None selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{totalDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Price:</span>
                  <span className="font-bold">${totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            disabled={
              isLoading ||
              !selectedDate ||
              !selectedTime ||
              !selectedBarber ||
              selectedServices.length === 0
            }
            onClick={handleBookAppointment}
          >
            {isLoading ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AppointmentBookingTemp;
