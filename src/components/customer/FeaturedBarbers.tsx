import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getBarbers } from "../../lib/firebase";
import { Loader2 } from "lucide-react"; // Adding a loader spinner for better UX

interface BarberAvailability {
  date: string; // The date of availability
  times: string[]; // List of available times
}

export interface Barber {
  id: string;
  name: string;
  rating: number;
  specialty: {
    id: string;
    name: string;
    description: string;
    time: number;  // in minutes
    money: number; // price for the service
  }[];
  imageUrl: string;
  availability: string;
  phone: string;
  location: string;
  availableTimes?: BarberAvailability[]; // Optional availability times
}

const BarberCard = ({
  barber,
  onBookNow = () => {},
}: {
  barber: Barber;
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
        
        {/* Display the first specialty if available */}
        {barber.specialty.length > 0 && (
          <p className="text-xs text-gray-500 mb-2 text-center">
            {barber.specialty[0].name} - ${barber.specialty[0].money}
          </p>
        )}

        <div className="text-xs text-center text-gray-600 mb-2">
          <p>{barber.location}</p>
          <p>{barber.phone}</p>
        </div>

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
  onBookNow = () => {},
  onViewAll = () => {},
  title = "Featured Barbers",
}: {
  onBookNow?: (id: string) => void;
  onViewAll?: () => void;
  title?: string;
}) => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const barberList = await getBarbers();
        setBarbers(barberList);
      } catch (err: any) {
        setError(err.message || "Failed to load barbers");
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-500">Loading barbers...</span>
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 p-4">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="w-full bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-blue-600"
          onClick={onViewAll} // Call onViewAll function on button click
        >
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
