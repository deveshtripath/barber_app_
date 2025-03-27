import React from "react";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Bell,
  Gift,
  Scissors,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();

  // Mock notifications data
  const notifications = [
    {
      id: "1",
      type: "appointment",
      title: "Appointment Confirmed",
      message:
        "Your haircut appointment with James Wilson has been confirmed for today at 2:30 PM.",
      date: "Today",
      time: "10:23 AM",
      read: false,
      appointmentId: "appt-123",
    },
    {
      id: "2",
      type: "promotion",
      title: "Summer Special Offer",
      message:
        "Get 20% off on all haircuts this week. Use code SUMMER20 at checkout.",
      date: "Yesterday",
      time: "3:45 PM",
      read: true,
    },
    {
      id: "3",
      type: "reminder",
      title: "Appointment Reminder",
      message:
        "Don't forget your appointment tomorrow at 10:00 AM with Maria Garcia.",
      date: "Yesterday",
      time: "9:00 AM",
      read: true,
      appointmentId: "appt-124",
    },
    {
      id: "4",
      type: "reward",
      title: "Loyalty Points Added",
      message:
        "You've earned 50 loyalty points from your last visit. You now have 350 points.",
      date: "2 days ago",
      time: "5:30 PM",
      read: true,
    },
    {
      id: "5",
      type: "system",
      title: "App Update Available",
      message:
        "A new version of CutQueue is available with exciting new features.",
      date: "3 days ago",
      time: "11:15 AM",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification) => {
    // Mark as read logic would go here

    // Navigate based on notification type
    if (notification.type === "appointment" && notification.appointmentId) {
      navigate(`/customer/appointments/${notification.appointmentId}`);
    } else if (notification.type === "promotion") {
      navigate("/customer/services");
    } else if (notification.type === "reward") {
      navigate("/customer/rewards");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary">{unreadCount} new</Badge>
            )}
          </div>

          <Tabs defaultValue="all">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread">
              {unreadCount === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No unread notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="appointments">
              {notifications.filter(
                (n) => n.type === "appointment" || n.type === "reminder",
              ).length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointment notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications
                    .filter(
                      (n) => n.type === "appointment" || n.type === "reminder",
                    )
                    .map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button variant="outline" className="w-full">
              Mark All as Read
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

const NotificationCard = ({ notification, onClick }) => {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? "border-l-4 border-l-primary" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex">
          <div className="mr-3">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{notification.title}</h3>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500">
                  {notification.date}
                </span>
                <span className="text-xs text-gray-500">
                  {notification.time}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function getNotificationIcon(type) {
  switch (type) {
    case "appointment":
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case "promotion":
      return <Gift className="h-5 w-5 text-purple-500" />;
    case "reminder":
      return <Clock className="h-5 w-5 text-amber-500" />;
    case "reward":
      return <Gift className="h-5 w-5 text-green-500" />;
    case "system":
      return <Bell className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
}

export default Notifications;
