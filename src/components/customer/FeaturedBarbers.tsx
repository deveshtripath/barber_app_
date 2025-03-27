import React from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BarberProps {
  id: string;
  name: string;
  rating: number;
  specialty: string;
  imageUrl: string;
  availability: string;
  onBookNow?: (id: string) => void;
}

interface FeaturedBarbersProps {
  barbers?: BarberProps[];
  onBookNow?: (id: string) => void;
  title?: string;
}

const BarberCard = ({
  barber,
  onBookNow = () => {},
}: {
  barber: BarberProps;
  onBookNow?: (id: string) => void;
}) => {
  return (
    <Card className="min-w-[150px] max-w-[150px] bg-white shadow-sm">
      <CardContent className="p-3 flex flex-col items-center">
        <Avatar className="h-16 w-16 mb-2">
          <AvatarImage src={barber.imageUrl} alt={barber.name} />
          <AvatarFallback>
            {barber.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-medium text-sm text-center">{barber.name}</h3>
        <div className="flex items-center mt-1 mb-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs ml-1">{barber.rating.toFixed(1)}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2 text-center">
          {barber.specialty}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => onBookNow(barber.id)}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};

const FeaturedBarbers = ({
  barbers = [
    {
      id: "1",
      name: "James Wilson",
      rating: 4.8,
      specialty: "Classic Cuts",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      availability: "Today",
    },
    {
      id: "2",
      name: "Maria Garcia",
      rating: 4.9,
      specialty: "Fades & Designs",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
      availability: "Tomorrow",
    },
    {
      id: "3",
      name: "David Chen",
      rating: 4.7,
      specialty: "Beard Styling",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      availability: "Today",
    },
    {
      id: "4",
      name: "Sarah Johnson",
      rating: 4.6,
      specialty: "Color & Highlights",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      availability: "Today",
    },
    {
      id: "5",
      name: "Michael Brown",
      rating: 4.5,
      specialty: "Trendy Styles",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      availability: "Tomorrow",
    },
  ],
  onBookNow = () => {},
  title = "Featured Barbers",
}: FeaturedBarbersProps) => {
  return (
    <div className="w-full bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" className="text-xs text-blue-600">
          View All
        </Button>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-3">
          {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} onBookNow={onBookNow} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBarbers;
