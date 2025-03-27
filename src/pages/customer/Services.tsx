import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { useData, Service } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Clock, DollarSign } from "lucide-react";

const Services = () => {
  const { services, categories, getServicesByCategory } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredServices(services);
    } else {
      setFilteredServices(getServicesByCategory(activeCategory));
    }
  }, [activeCategory, services, getServicesByCategory]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = services.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query),
      );
      setFilteredServices(filtered);
    } else if (activeCategory === "all") {
      setFilteredServices(services);
    } else {
      setFilteredServices(getServicesByCategory(activeCategory));
    }
  }, [searchQuery, services, activeCategory, getServicesByCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category !== "all") {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        {/* Search Bar */}
        <div className="p-4 bg-white sticky top-[60px] z-10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search services..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pt-4">
          <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start pb-1">
              <TabsTrigger value="all" className="flex-shrink-0">
                All
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex-shrink-0"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Services List */}
        <div className="p-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No services found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {service.image && (
            <div className="w-1/3 h-32 bg-gray-200">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`p-4 ${service.image ? "w-2/3" : "w-full"}`}>
            <h3 className="font-semibold text-lg">{service.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {service.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{service.duration} min</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="text-sm">${service.price}</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/customer/services/${service.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Services;
