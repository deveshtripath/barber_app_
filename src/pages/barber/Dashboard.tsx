import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";

const BarberDashboard = () => {
  const { user, logout } = useAuth();
  const { appointments, getAppointmentsByBarber } = useData();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);

  // Get today's date in a readable format
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Filter appointments for the current barber
  const barberAppointments = user ? getAppointmentsByBarber(user.id) : [];

  // Filter today's appointments
  const todaysAppointments = barberAppointments.filter(
    (a) => a.date === "Today" && a.status !== "cancelled",
  );

  // Calculate earnings
  const totalEarnings = barberAppointments
    .filter((a) => a.status === "completed")
    .reduce((sum, appointment) => sum + appointment.totalPrice, 0);

  // Calculate today's earnings
  const todaysEarnings = barberAppointments
    .filter((a) => a.date === "Today" && a.status === "completed")
    .reduce((sum, appointment) => sum + appointment.totalPrice, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Barber Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/barber/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {/* Barber Profile Card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">{user?.name}</h2>
                  <p className="text-sm text-gray-500">Master Barber</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-bold">
                  {todaysAppointments.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-gray-500">Today's Earnings</p>
                <p className="text-2xl font-bold">${todaysEarnings}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
            <p className="text-sm text-gray-500">{today}</p>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">
                  No appointments scheduled for today
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.time}</p>
                        <p className="text-sm text-gray-500">
                          Service: {appointment.serviceIds.length} services
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={
                          appointment.status === "confirmed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {appointment.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Tabs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="earnings">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
              </TabsList>
              <TabsContent value="earnings">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">Total Earnings</p>
                    <p className="font-bold">${totalEarnings}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">This Week</p>
                    <p className="font-bold">$320</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">This Month</p>
                    <p className="font-bold">$1,250</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Detailed Report
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="clients">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">Total Clients</p>
                    <p className="font-bold">48</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">New This Week</p>
                    <p className="font-bold">5</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">Returning Clients</p>
                    <p className="font-bold">85%</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Client List
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="flex justify-around items-center h-16">
          <Button
            variant="ghost"
            className="flex flex-col items-center h-full w-full"
            onClick={() => {}}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Schedule</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center h-full w-full text-primary"
            onClick={() => {}}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center h-full w-full"
            onClick={() => {}}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs mt-1">Earnings</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
