import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Scissors, User, Gift } from "lucide-react";

interface BottomNavigationProps {
  className?: string;
}

function BottomNavigation({ className = "" }: BottomNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/customer/home",
    },
    {
      icon: Calendar,
      label: "Appointments",
      path: "/customer/appointments",
    },
    {
      icon: Scissors,
      label: "Services",
      path: "/customer/services",
    },
    {
      icon: User,
      label: "Profile",
      path: "/customer/profile",
    },
    {
      icon: Gift,
      label: "Rewards",
      path: "/customer/rewards",
    },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg ${className}`}
    >
      <div className="flex justify-between items-center h-[70px] px-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-full ${isActive ? "text-primary" : "text-gray-500"}`}
            >
              <item.icon
                size={24}
                className={isActive ? "text-primary" : "text-gray-500"}
              />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNavigation;
