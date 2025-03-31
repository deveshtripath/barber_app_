import React from "react";
import { Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

function Header({
  userName = "John Doe",
  userAvatar = "",
  notificationCount = 3,
  onNotificationClick = () => {},
  onProfileClick = () => {},
}: HeaderProps) {
  return (
    <header className="w-full h-[60px] px-4 py-2 flex items-center justify-between bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">CutQueue</h1>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotificationClick}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {notificationCount > 0 && (
              <Badge
                className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full",
                  "bg-red-500 text-white text-xs",
                )}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onProfileClick}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {userName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}

export default Header;
