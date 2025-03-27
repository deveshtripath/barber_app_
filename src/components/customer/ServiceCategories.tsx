import React from "react";
import { cn } from "@/lib/utils";
import {
  Scissors,
  Briefcase,
  Paintbrush,
  Brush,
  Droplet,
  Gift,
} from "lucide-react";

interface ServiceCategoryProps {
  categories?: {
    id: string;
    name: string;
    icon: React.ReactNode;
  }[];
  onCategorySelect?: (categoryId: string) => void;
}

const ServiceCategories = ({
  categories = [
    { id: "haircut", name: "Haircuts", icon: <Scissors className="h-6 w-6" /> },
    { id: "beard", name: "Beard", icon: <Briefcase className="h-6 w-6" /> },
    {
      id: "coloring",
      name: "Coloring",
      icon: <Paintbrush className="h-6 w-6" />,
    },
    { id: "styling", name: "Styling", icon: <Brush className="h-6 w-6" /> },
    { id: "shave", name: "Shave", icon: <Droplet className="h-6 w-6" /> },
    { id: "packages", name: "Packages", icon: <Gift className="h-6 w-6" /> },
  ],
  onCategorySelect = () => {},
}: ServiceCategoryProps) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Services</h2>
      <div className="grid grid-cols-3 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg",
              "bg-gray-50 hover:bg-gray-100 transition-colors",
              "border border-gray-200",
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
              {category.icon}
            </div>
            <span className="text-xs font-medium text-gray-700">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategories;
