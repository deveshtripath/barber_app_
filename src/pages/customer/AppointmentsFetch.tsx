import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAppointments } from "../../lib/FetchAppointments"; // Ensure this is the correct import
import { useAuth } from "../../lib/auth";
import { Alert } from "../../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

const AppointmentsFetch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user) return;

      try {
        const fetchedAppointments = await fetchAppointments(user); // Fetch appointments
        const userAppointments = fetchedAppointments.filter((a) => a.customer_id === user.phoneNumber);
        console.log(userAppointments);
        setAppointments(userAppointments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent>
              <h3>{appointment.service_type || "No services selected"}</h3>
              <p>Date Time: {appointment.appointment_time}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AppointmentsFetch;
