import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  DollarSign,
  LogOut,
  Settings,
  Menu,
  User,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const BarberDashboard = () => {
  const { user, logout } = useAuth();
  const { appointments, getAppointmentsByBarber, updateBarberAvailability } =
    useData();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Availability settings
  const [availabilitySettings, setAvailabilitySettings] = useState<{
    [key: number]: { enabled: boolean; startTime: string; endTime: string };
  }>({
    0: { enabled: false, startTime: "09:00", endTime: "17:00" }, // Sunday
    1: { enabled: true, startTime: "09:00", endTime: "17:00" }, // Monday
    2: { enabled: true, startTime: "09:00", endTime: "17:00" }, // Tuesday
    3: { enabled: true, startTime: "09:00", endTime: "17:00" }, // Wednesday
    4: { enabled: true, startTime: "09:00", endTime: "17:00" }, // Thursday
    5: { enabled: true, startTime: "09:00", endTime: "17:00" }, // Friday
    6: { enabled: false, startTime: "09:00", endTime: "17:00" }, // Saturday
  });

  // Get barber's appointments
  const barberAppointments = user ? getAppointmentsByBarber(user.id) : [];

  // Filter appointments by status
  const upcomingAppointments = barberAppointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed",
  );
  const todayAppointments = barberAppointments.filter(
    (a) =>
      a.date === "Today" &&
      (a.status === "pending" || a.status === "confirmed"),
  );
  const completedAppointments = barberAppointments.filter(
    (a) => a.status === "completed",
  );

  // Calculate earnings
  const totalEarnings = completedAppointments.reduce(
    (sum, appointment) => sum + appointment.totalPrice,
    0,
  );

  // Handle availability toggle
  const handleAvailabilityToggle = (day: number) => {
    setAvailabilitySettings((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  // Handle time change
  const handleTimeChange = (
    day: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setAvailabilitySettings((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Save availability settings
  const saveAvailabilitySettings = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Format availability for database
      const availabilities = Object.entries(availabilitySettings)
        .filter(([_, settings]) => settings.enabled)
        .map(([day, settings]) => ({
          day_of_week: parseInt(day),
          start_time: settings.startTime,
          end_time: settings.endTime,
        }));

      await updateBarberAvailability(user.id, availabilities);
      setSuccess("Availability settings saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save availability settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Barber Dashboard
          </h1>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <Avatar>
              <AvatarImage src={user?.profile_image} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">Barber</p>
            </div>
          </div>
          <nav className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Appointments
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <Clock className="h-5 w-5 mr-2" />
              Availability
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Earnings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <User className="h-5 w-5 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 md:hidden">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Barber Dashboard</h1>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profile_image} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Today's Appointments
                    </p>
                    <p className="text-2xl font-bold">
                      {todayAppointments.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  Next: {todayAppointments[0]?.time || "No appointments today"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Upcoming Appointments
                    </p>
                    <p className="text-2xl font-bold">
                      {upcomingAppointments.length}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-purple-600">
                  {upcomingAppointments.length > 0
                    ? `Next: ${upcomingAppointments[0]?.date}, ${upcomingAppointments[0]?.time}`
                    : "No upcoming appointments"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold">${totalEarnings}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  From {completedAppointments.length} completed appointments
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="appointments" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="py-3 flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage
                                  src={appointment.customerAvatar}
                                  alt={appointment.customerName}
                                />
                                <AvatarFallback>
                                  {appointment.customerName
                                    ?.substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {appointment.customerName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {appointment.service}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right mr-4">
                              <p className="text-sm font-medium">
                                {appointment.date}
                              </p>
                              <p className="text-xs text-gray-500">
                                {appointment.time}
                              </p>
                            </div>
                            <Badge
                              variant={
                                appointment.status === "pending"
                                  ? "outline"
                                  : "default"
                              }
                            >
                              {appointment.status === "pending"
                                ? "Pending"
                                : "Confirmed"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No upcoming appointments</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Set Your Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                      <Check className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day.value}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={availabilitySettings[day.value].enabled}
                            onCheckedChange={() =>
                              handleAvailabilityToggle(day.value)
                            }
                          />
                          <Label>{day.label}</Label>
                        </div>

                        {availabilitySettings[day.value].enabled && (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              className="w-24"
                              value={availabilitySettings[day.value].startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  day.value,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              className="w-24"
                              value={availabilitySettings[day.value].endTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  day.value,
                                  "endTime",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      className="w-full mt-4"
                      onClick={saveAvailabilitySettings}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Availability"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default BarberDashboard;
