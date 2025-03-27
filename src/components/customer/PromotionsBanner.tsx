import React from "react";
import { motion } from "framer-motion";
import { Scissors, Gift, Calendar, Percent } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  backgroundColor: string;
  icon: React.ReactNode;
}

interface PromotionsBannerProps {
  promotions?: Promotion[];
  className?: string;
}

const PromotionsBanner = ({
  promotions = [
    {
      id: "1",
      title: "Summer Special",
      description: "Get 20% off on all haircuts",
      discount: "20% OFF",
      expiryDate: "July 31, 2023",
      backgroundColor: "bg-gradient-to-r from-blue-500 to-purple-500",
      icon: <Scissors className="h-6 w-6 text-white" />,
    },
    {
      id: "2",
      title: "Refer a Friend",
      description: "Get $10 off your next appointment",
      discount: "$10 OFF",
      expiryDate: "No expiry",
      backgroundColor: "bg-gradient-to-r from-green-500 to-teal-500",
      icon: <Gift className="h-6 w-6 text-white" />,
    },
    {
      id: "3",
      title: "First-Time Offer",
      description: "30% discount on your first visit",
      discount: "30% OFF",
      expiryDate: "For new customers",
      backgroundColor: "bg-gradient-to-r from-orange-500 to-red-500",
      icon: <Percent className="h-6 w-6 text-white" />,
    },
    {
      id: "4",
      title: "Weekend Special",
      description: "Book on weekends for extra rewards",
      discount: "2X POINTS",
      expiryDate: "Every weekend",
      backgroundColor: "bg-gradient-to-r from-indigo-500 to-purple-600",
      icon: <Calendar className="h-6 w-6 text-white" />,
    },
  ],
  className,
}: PromotionsBannerProps) => {
  return (
    <div className={cn("w-full bg-background p-2", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {promotions.map((promotion) => (
            <CarouselItem
              key={promotion.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                className={cn(
                  "rounded-lg p-4 h-full",
                  promotion.backgroundColor,
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">
                      {promotion.title}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      {promotion.description}
                    </p>
                    <div className="mt-3 flex items-center">
                      <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded">
                        {promotion.discount}
                      </span>
                      <span className="text-white/80 text-xs ml-2">
                        Expires: {promotion.expiryDate}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-white/10 p-2">
                    {promotion.icon}
                  </div>
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-white/50 hover:bg-white/80" />
        <CarouselNext className="right-0 bg-white/50 hover:bg-white/80" />
      </Carousel>
    </div>
  );
};

export default PromotionsBanner;
