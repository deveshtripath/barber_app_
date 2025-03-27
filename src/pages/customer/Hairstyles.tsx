import React, { useState } from "react";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Camera, Upload, Scissors, Brush, Sparkles } from "lucide-react";

const Hairstyles = () => {
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedHairstyle, setSelectedHairstyle] = useState(null);
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);

  // Mock hairstyle data
  const trendingHairstyles = [
    {
      id: "1",
      name: "Modern Fade",
      image:
        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80",
      description: "Clean fade with textured top",
      popularity: 95,
    },
    {
      id: "2",
      name: "Classic Pompadour",
      image:
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
      description: "Timeless style with volume",
      popularity: 88,
    },
    {
      id: "3",
      name: "Textured Crop",
      image:
        "https://images.unsplash.com/photo-1580518324671-c2f0833a3af3?w=800&q=80",
      description: "Short and textured with fringe",
      popularity: 92,
    },
    {
      id: "4",
      name: "Slick Back",
      image:
        "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&q=80",
      description: "Sleek and professional look",
      popularity: 85,
    },
  ];

  const classicHairstyles = [
    {
      id: "5",
      name: "Side Part",
      image:
        "https://images.unsplash.com/photo-1517163168566-6b7f45890768?w=800&q=80",
      description: "Traditional and versatile",
      popularity: 80,
    },
    {
      id: "6",
      name: "Buzz Cut",
      image:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
      description: "Low maintenance and clean",
      popularity: 75,
    },
    {
      id: "7",
      name: "Crew Cut",
      image:
        "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&q=80",
      description: "Short on sides with length on top",
      popularity: 82,
    },
  ];

  const modernHairstyles = [
    {
      id: "8",
      name: "Messy Quiff",
      image:
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
      description: "Casual and stylish",
      popularity: 90,
    },
    {
      id: "9",
      name: "Undercut",
      image:
        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80",
      description: "Bold contrast between top and sides",
      popularity: 93,
    },
    {
      id: "10",
      name: "Man Bun",
      image:
        "https://images.unsplash.com/photo-1517163168566-6b7f45890768?w=800&q=80",
      description: "Long hair tied back",
      popularity: 78,
    },
  ];

  const handleHairstyleSelect = (hairstyle) => {
    setSelectedHairstyle(hairstyle);
    setShowVirtualTryOn(true);
  };

  const handleBackToGallery = () => {
    setShowVirtualTryOn(false);
    setSelectedHairstyle(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        {!showVirtualTryOn ? (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Try Hairstyles</h1>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 rounded-full p-4 mb-3">
                    <Camera className="h-8 w-8 text-gray-500" />
                  </div>
                  <h2 className="font-semibold mb-2">Upload Your Photo</h2>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Upload a front-facing photo to try different hairstyles
                  </p>
                  <Button className="w-full">
                    <Upload className="h-4 w-4 mr-2" /> Upload Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search hairstyles..."
                  className="pl-10"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="classic">Classic</TabsTrigger>
                <TabsTrigger value="modern">Modern</TabsTrigger>
              </TabsList>

              <TabsContent value="trending">
                <div className="grid grid-cols-2 gap-3">
                  {trendingHairstyles.map((hairstyle) => (
                    <HairstyleCard
                      key={hairstyle.id}
                      hairstyle={hairstyle}
                      onClick={() => handleHairstyleSelect(hairstyle)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="classic">
                <div className="grid grid-cols-2 gap-3">
                  {classicHairstyles.map((hairstyle) => (
                    <HairstyleCard
                      key={hairstyle.id}
                      hairstyle={hairstyle}
                      onClick={() => handleHairstyleSelect(hairstyle)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="modern">
                <div className="grid grid-cols-2 gap-3">
                  {modernHairstyles.map((hairstyle) => (
                    <HairstyleCard
                      key={hairstyle.id}
                      hairstyle={hairstyle}
                      onClick={() => handleHairstyleSelect(hairstyle)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <VirtualTryOn
            hairstyle={selectedHairstyle}
            onBack={handleBackToGallery}
          />
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

const HairstyleCard = ({ hairstyle, onClick }) => {
  return (
    <Card className="overflow-hidden cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={hairstyle.image}
            alt={hairstyle.name}
            className="w-full h-36 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <h3 className="font-medium text-white">{hairstyle.name}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VirtualTryOn = ({ hairstyle, onBack }) => {
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [enableFaceTracking, setEnableFaceTracking] = useState(true);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to Gallery
        </Button>
        <h2 className="font-semibold">{hairstyle.name}</h2>
      </div>

      <div className="bg-black rounded-lg overflow-hidden mb-6">
        <div className="relative aspect-[3/4] flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <Sparkles className="h-12 w-12 mx-auto mb-2 text-yellow-400" />
            <p className="text-sm">Virtual try-on would appear here</p>
            <p className="text-xs text-gray-400 mt-1">
              Using your uploaded photo and AI technology
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="brightness">Brightness</Label>
              <span className="text-xs text-gray-500">{brightness}%</span>
            </div>
            <Slider
              id="brightness"
              min={0}
              max={100}
              step={1}
              value={[brightness]}
              onValueChange={(value) => setBrightness(value[0])}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="contrast">Contrast</Label>
              <span className="text-xs text-gray-500">{contrast}%</span>
            </div>
            <Slider
              id="contrast"
              min={0}
              max={100}
              step={1}
              value={[contrast]}
              onValueChange={(value) => setContrast(value[0])}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scissors className="h-4 w-4 text-gray-500" />
              <Label htmlFor="face-tracking">Face Tracking</Label>
            </div>
            <Switch
              id="face-tracking"
              checked={enableFaceTracking}
              onCheckedChange={setEnableFaceTracking}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button className="w-full">
          <Scissors className="h-4 w-4 mr-2" /> Book This Style
        </Button>
        <Button variant="outline" className="w-full">
          <Brush className="h-4 w-4 mr-2" /> Try Another
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Note: This is a virtual preview. Results may vary with your actual
          hair texture and face shape.
        </p>
      </div>
    </div>
  );
};

export default Hairstyles;
