import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import BottomNavigation from "../../components/customer/BottomNavigation";
import { useData } from "../../lib/data";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Calendar, Clock, MapPin, User, AlertCircle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import AppointmentsFetchTemp from "./AppointmentsFetch";
import AppointmentsFetch from "./AppointmentsFetch";

const Appointments = () => {
  const { user } = useAuth();
  const { appointments, barbers, services, cancelAppointment } = useData();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure user is authenticated
  if (!user) {
    return <div>Please log in to view your appointments.</div>;
  }

  // Filter appointments by current user
  const userAppointments = appointments.filter((a) => a.customerId === user.id);

  const upcomingAppointments = userAppointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  );

  const pastAppointments = userAppointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  const handleReschedule = (appointmentId: string) => {
    navigate(`/customer/appointments/reschedule/${appointmentId}`);
  };

  const handleViewAppointment = (appointmentId: string) => {
    navigate(`/customer/appointments/${appointmentId}`);
  };

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointmentId) return;

    setIsLoading(true);
    try {
      await cancelAppointment(selectedAppointmentId);
      setCancelDialogOpen(false);
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

  const getBarberName = (barberId: string) => {
    return barbers.find((b) => b.id === barberId)?.name || "Unknown Barber";
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <Button onClick={() => navigate("/customer/appointments/new")}>
              New Appointment
            </Button>
          </div>

          <Tabs defaultValue="upcoming">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <AppointmentsFetch/>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/customer/appointments/new")}
                  >
                    Book an Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4 cursor-pointer" onClick={() => handleViewAppointment(appointment.id)}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            {getServiceNames(appointment.serviceIds)}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{getBarberName(appointment.barberId)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>
                              {barbers.find(
                                (b) => b.id === appointment.barberId,
                              )?.location || "Unknown Location"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReschedule(appointment.id)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelClick(appointment.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No past appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4 cursor-pointer" onClick={() => handleViewAppointment(appointment.id)}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            {getServiceNames(appointment.serviceIds)}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{getBarberName(appointment.barberId)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>
                              {barbers.find(
                                (b) => b.id === appointment.barberId,
                              )?.location || "Unknown Location"}
                            </span>
                          </div>
                        </div>

                        {appointment.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle review logic
                            }}
                          >
                            Leave Review
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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

export default Appointments;
