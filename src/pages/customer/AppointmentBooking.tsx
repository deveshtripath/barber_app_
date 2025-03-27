import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { useData } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AppointmentBooking = () => {
  const { user } = useAuth();
  const { barbers, services, createAppointment } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const barberId = searchParams.get("barber") || "";
  const serviceId = searchParams.get("service") || "";

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>(barberId);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    serviceId ? [serviceId] : [],
  );
  const [isLoading, setIsLoading] = useState(false);

  // Available time slots
  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
  ];

  // Calculate total price
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Calculate total duration
  const totalDuration = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
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
      return;
    }

    setIsLoading(true);
    try {
      // Format date for display
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Create appointment
      await createAppointment({
        customerId: user.id,
        barberId: selectedBarber,
        serviceIds: selectedServices,
        date: formattedDate,
        time: selectedTime,
        status: "pending",
        totalPrice: totalPrice,
      });

      // Navigate to appointments page
      navigate("/customer/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
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

          <Tabs defaultValue="services" className="mb-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="barber">Barber</TabsTrigger>
              <TabsTrigger value="datetime">Date & Time</TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedServices.includes(service.id) ? "border-primary bg-primary/5" : "border-gray-200"}`}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-gray-500">
                              {service.description}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-3 w-3 mr-1" />
                                <span className="text-xs">
                                  {service.duration} min
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <DollarSign className="h-3 w-3 mr-1" />
                                <span className="text-xs">
                                  ${service.price}
                                </span>
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

            {/* Barber Tab */}
            <TabsContent value="barber">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Barber</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {barbers.map((barber) => (
                      <div
                        key={barber.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBarber === barber.id ? "border-primary bg-primary/5" : "border-gray-200"}`}
                        onClick={() => setSelectedBarber(barber.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={barber.imageUrl}
                              alt={barber.name}
                            />
                            <AvatarFallback>
                              {barber.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{barber.name}</h3>
                            <p className="text-sm text-gray-500">
                              {barber.specialty}
                            </p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs">
                                {barber.availability}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
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
                          .map((id) => services.find((s) => s.id === id)?.name)
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

export default AppointmentBooking;
