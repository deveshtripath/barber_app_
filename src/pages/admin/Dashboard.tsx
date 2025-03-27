import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Users,
  DollarSign,
  Calendar,
  Scissors,
  LogOut,
  Settings,
  Menu,
  MessageSquare,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { appointments, barbers } = useData();
  const navigate = useNavigate();

  // Calculate statistics
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed",
  ).length;
  const pendingAppointments = appointments.filter(
    (a) => a.status === "pending",
  ).length;
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  // Calculate total revenue
  const totalRevenue = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, appointment) => sum + appointment.totalPrice, 0);

  // Calculate today's revenue
  const todaysRevenue = appointments
    .filter((a) => a.date === "Today" && a.status === "completed")
    .reduce((sum, appointment) => sum + appointment.totalPrice, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center">
            <Scissors className="h-5 w-5 mr-2" />
            CutQueue Admin
          </h1>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <Avatar>
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
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <nav className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <BarChart className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
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
              <Users className="h-5 w-5 mr-2" />
              Barbers
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <Scissors className="h-5 w-5 mr-2" />
              Services
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Support
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
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold">${totalRevenue}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  +12% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Today's Revenue
                    </p>
                    <p className="text-2xl font-bold">${todaysRevenue}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  {todaysRevenue > 0
                    ? "+5% from yesterday"
                    : "No revenue yet today"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Barbers</p>
                    <p className="text-2xl font-bold">{barbers.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-purple-600">
                  {barbers.length > 0
                    ? `${barbers.filter((b) => b.availability === "Today").length} available today`
                    : "No barbers available"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Total Appointments
                    </p>
                    <p className="text-2xl font-bold">{totalAppointments}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-orange-600">
                  {pendingAppointments} pending, {completedAppointments}{" "}
                  completed
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Overview */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Appointments Overview</h2>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {appointments.filter((a) => a.status === "pending")
                        .length > 0 ? (
                        appointments
                          .filter((a) => a.status === "pending")
                          .map((appointment, index) => (
                            <div
                              key={index}
                              className="p-4 flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage
                                    src={appointment.customerAvatar}
                                    alt={appointment.customerName}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {appointment.customerName
                                      .split(" ")
                                      .map((name) => name[0])
                                      .join("")
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
                                  <div className="flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                                    <p className="text-xs text-gray-500">
                                      {appointment.date}, {appointment.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  ${appointment.totalPrice}
                                </Badge>
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  {appointment.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No upcoming appointments
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="completed">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {appointments.filter((a) => a.status === "completed")
                        .length > 0 ? (
                        appointments
                          .filter((a) => a.status === "completed")
                          .map((appointment, index) => (
                            <div
                              key={index}
                              className="p-4 flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage
                                    src={appointment.customerAvatar}
                                    alt={appointment.customerName}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {appointment.customerName
                                      .split(" ")
                                      .map((name) => name[0])
                                      .join("")
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
                                  <div className="flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                                    <p className="text-xs text-gray-500">
                                      {appointment.date}, {appointment.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  ${appointment.totalPrice}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {appointment.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No completed appointments
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="cancelled">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {appointments.filter((a) => a.status === "cancelled")
                        .length > 0 ? (
                        appointments
                          .filter((a) => a.status === "cancelled")
                          .map((appointment, index) => (
                            <div
                              key={index}
                              className="p-4 flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage
                                    src={appointment.customerAvatar}
                                    alt={appointment.customerName}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {appointment.customerName
                                      .split(" ")
                                      .map((name) => name[0])
                                      .join("")
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
                                  <div className="flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                                    <p className="text-xs text-gray-500">
                                      {appointment.date}, {appointment.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  ${appointment.totalPrice}
                                </Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                  {appointment.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No cancelled appointments
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
