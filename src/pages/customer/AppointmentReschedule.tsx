import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { useData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";

const AppointmentReschedule = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { appointments, updateAppointment } = useData();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const appointment = appointments.find((a) => a.id === appointmentId);

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

  useEffect(() => {
    if (appointment) {
      // Try to parse the date from the appointment
      try {
        if (appointment.date === "Today" || appointment.date === "Tomorrow") {
          setSelectedDate(new Date());
        } else {
          const dateParts = appointment.date.split("-");
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
            const day = parseInt(dateParts[2]);
            setSelectedDate(new Date(year, month, day));
          }
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        setSelectedDate(new Date());
      }

      setSelectedTime(appointment.time);
    }
  }, [appointment]);

  if (!appointment) {
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
              The appointment you're trying to reschedule doesn't exist.
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

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsLoading(true);
    try {
      // Format date for display
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Update appointment
      await updateAppointment(appointmentId, {
        date: formattedDate,
        time: selectedTime,
      });

      // Navigate back to appointment details
      navigate(`/customer/appointments/${appointmentId}`);
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Reschedule Appointment</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Select New Date</CardTitle>
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
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Select New Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">Time</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Date:</span>
                  <span className="font-medium">{appointment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Time:</span>
                  <span className="font-medium">{appointment.time}</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">New Date:</span>
                  <span className="font-medium">
                    {selectedDate
                      ? format(selectedDate, "MMMM d, yyyy")
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">New Time:</span>
                  <span className="font-medium">
                    {selectedTime || "Not selected"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                navigate(`/customer/appointments/${appointmentId}`)
              }
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={isLoading || !selectedDate || !selectedTime}
              onClick={handleReschedule}
            >
              {isLoading ? "Rescheduling..." : "Confirm Changes"}
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AppointmentReschedule;
