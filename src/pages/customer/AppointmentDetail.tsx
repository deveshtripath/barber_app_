import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { useData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AppointmentDetail = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { appointments, barbers, services, cancelAppointment } = useData();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const appointment = appointments.find((a) => a.id === appointmentId);
  const barber = appointment
    ? barbers.find((b) => b.id === appointment.barberId)
    : null;

  if (!appointment || !barber) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 pt-[60px] pb-[70px] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Appointment Not Found
            </h2>
            <p className="text-gray-500 mb-4">
              The appointment you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/customer/appointments")}>
              Back to Appointments
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const handleReschedule = () => {
    navigate(`/customer/appointments/reschedule/${appointmentId}`);
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    setIsLoading(true);
    try {
      await cancelAppointment(appointmentId);
      setCancelDialogOpen(false);
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate total price and duration
  const totalPrice = appointment.serviceIds.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  const totalDuration = appointment.serviceIds.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.duration || 0);
  }, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Appointment Details</h1>
            {getStatusBadge(appointment.status)}
          </div>

          {/* Appointment Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={barber.imageUrl} alt={barber.name} />
                    <AvatarFallback>
                      {barber.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{barber.name}</h3>
                    {/* Render specialty if it exists */}
                    {barber.specialty ? (
                      <p className="text-sm text-gray-500">{barber.name}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Specialty not available</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{barber.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <a href={`tel:${barber.phone}`} className="text-blue-600">
                      {barber.phone}
                    </a>
                  </div>
                </div>

                {appointment.estimatedWaitTime && (
                  <div className="bg-amber-50 p-3 rounded-md flex items-center">
                    <Clock className="h-4 w-4 text-amber-500 mr-2" />
                    <p className="text-sm text-amber-700">
                      Estimated wait time:{" "}
                      <span className="font-medium">
                        {appointment.estimatedWaitTime} minutes
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Services */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointment.serviceIds.map((serviceId) => {
                  const service = services.find((s) => s.id === serviceId);
                  if (!service) return null;

                  return (
                    <div
                      key={serviceId}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {service.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="font-medium">${service.price}</span>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mt-4">
                  <div>
                    <span className="font-medium">Total</span>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {totalDuration} min
                      </span>
                    </div>
                  </div>
                  <span className="font-bold">${totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {(appointment.status === "pending" ||
            appointment.status === "confirmed") && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReschedule}
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            </div>
          )}

          {appointment.status === "completed" && (
            <Button className="w-full" variant="outline">
              Leave a Review
            </Button>
          )}
        </div>
      </main>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isLoading}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default AppointmentDetail;
