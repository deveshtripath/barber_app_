import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, MapPin, Phone, MoreHorizontal } from "lucide-react";

interface BarberInfo {
  name: string;
  image: string;
  phone: string;
  location: string;
}

interface AppointmentInfo {
  id: string;
  service: string;
  date: string;
  time: string;
  barber: BarberInfo;
  estimatedWaitTime: number; // in minutes
}

interface UpcomingAppointmentProps {
  appointment?: AppointmentInfo;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onCall?: (phone: string) => void;
}

const UpcomingAppointment = ({
  appointment = {
    id: "appt-123",
    service: "Haircut & Beard Trim",
    date: "Today",
    time: "2:30 PM",
    barber: {
      name: "James Wilson",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      phone: "+1 (555) 123-4567",
      location: "Main Street Shop",
    },
    estimatedWaitTime: 15,
  },
  onReschedule = () => {},
  onCancel = () => {},
  onCall = () => {},
}: UpcomingAppointmentProps) => {
  return (
    <Card className="w-full bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex justify-between items-center">
          <span>Upcoming Appointment</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
            <img
              src={appointment.barber.image}
              alt={appointment.barber.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-medium">{appointment.barber.name}</h3>
            <p className="text-sm text-gray-500">{appointment.service}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{appointment.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{appointment.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{appointment.barber.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <button
              className="text-sm text-blue-600 underline"
              onClick={() => onCall(appointment.barber.phone)}
            >
              Call
            </button>
          </div>
        </div>

        <div className="mt-3 bg-amber-50 p-2 rounded-md flex items-center">
          <Clock className="h-4 w-4 text-amber-500 mr-2" />
          <p className="text-xs text-amber-700">
            Estimated wait time:{" "}
            <span className="font-medium">
              {appointment.estimatedWaitTime} minutes
            </span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onReschedule(appointment.id)}
        >
          Reschedule
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onCancel(appointment.id)}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingAppointment;
