import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { useData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Star, Users, Calendar } from "lucide-react";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { services, barbers, categories } = useData();
  const navigate = useNavigate();

  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 pt-[60px] pb-[70px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
            <p className="text-gray-500 mb-4">
              The service you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/customer/services")}>
              Back to Services
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Filter barbers who offer this service (in a real app, this would be based on actual data)
  const serviceBarbers = barbers.slice(0, 3); // Just showing first 3 barbers for demo

  const handleBookService = () => {
    navigate(`/customer/appointments/new?service=${service.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        {/* Service Image */}
        {service.image && (
          <div className="w-full h-48 bg-gray-200">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          {/* Service Details */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{service.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{service.duration} min</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>${service.price}</span>
              </div>
              <Badge variant="outline">
                {categories.find((c) => c.id === service.categoryId)?.name ||
                  "Service"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{service.description}</p>
            </CardContent>
          </Card>

          {/* Available Barbers */}
          <h2 className="font-semibold mb-3">Available Barbers</h2>
          <div className="space-y-3 mb-6">
            {serviceBarbers.map((barber) => (
              <Card key={barber.id}>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={barber.imageUrl} alt={barber.name} />
                      <AvatarFallback>
                        {barber.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{barber.name}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-xs">{barber.rating}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(
                          `/customer/appointments/new?service=${service.id}&barber=${barber.id}`,
                        )
                      }
                    >
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* What to Expect */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">What to Expect</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Duration</h3>
                    <p className="text-sm text-gray-500">
                      This service typically takes {service.duration} minutes to
                      complete.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Expert Barbers</h3>
                    <p className="text-sm text-gray-500">
                      Our skilled barbers are trained to provide the best
                      experience.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Scheduling</h3>
                    <p className="text-sm text-gray-500">
                      Book in advance to secure your preferred time slot.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Book Now Button */}
          <Button className="w-full" size="lg" onClick={handleBookService}>
            Book This Service
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ServiceDetail;
