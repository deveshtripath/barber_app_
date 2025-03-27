import React from "react";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Award, Scissors, Calendar, Share2 } from "lucide-react";

const Rewards = () => {
  const { user } = useAuth();

  // Mock rewards data
  const rewardsData = {
    points: 350,
    nextRewardAt: 500,
    tier: "Silver",
    history: [
      {
        id: 1,
        date: "June 15, 2023",
        description: "Haircut appointment",
        points: 50,
      },
      {
        id: 2,
        date: "May 28, 2023",
        description: "Referral bonus",
        points: 100,
      },
      {
        id: 3,
        date: "May 10, 2023",
        description: "Beard trim appointment",
        points: 30,
      },
      {
        id: 4,
        date: "April 22, 2023",
        description: "First-time customer bonus",
        points: 150,
      },
      {
        id: 5,
        date: "April 5, 2023",
        description: "App download bonus",
        points: 20,
      },
    ],
    availableRewards: [
      {
        id: 1,
        name: "Free Haircut",
        pointsCost: 500,
        description: "Redeem for a free haircut of your choice",
      },
      {
        id: 2,
        name: "50% Off Coloring",
        pointsCost: 350,
        description: "Get 50% off any coloring service",
      },
      {
        id: 3,
        name: "Free Beard Trim",
        pointsCost: 200,
        description: "Complimentary beard trim with any service",
      },
      {
        id: 4,
        name: "Priority Booking",
        pointsCost: 150,
        description: "Skip the line with priority booking for 1 month",
      },
    ],
  };

  const progressPercentage =
    (rewardsData.points / rewardsData.nextRewardAt) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Loyalty Rewards</h1>

          {/* Points Summary Card */}
          <Card className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Your Points</h2>
                  <p className="text-3xl font-bold">{rewardsData.points}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Gift className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to next reward</span>
                  <span>
                    {rewardsData.points} / {rewardsData.nextRewardAt}
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className="h-2 bg-white/30"
                />
              </div>

              <div className="mt-4 flex justify-between items-center">
                <Badge className="bg-white/20 hover:bg-white/30 text-white">
                  {rewardsData.tier} Member
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <Share2 className="h-4 w-4 mr-1" /> Share & Earn
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Rewards */}
          <h2 className="text-lg font-semibold mb-3">Available Rewards</h2>
          <div className="space-y-3 mb-6">
            {rewardsData.availableRewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{reward.name}</h3>
                      <p className="text-sm text-gray-500">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      rewardsData.points >= reward.pointsCost
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    disabled={rewardsData.points < reward.pointsCost}
                  >
                    {reward.pointsCost} pts
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Points History */}
          <h2 className="text-lg font-semibold mb-3">Points History</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {rewardsData.history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-3">
                        {item.description.includes("appointment") ? (
                          <Scissors className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Calendar className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      +{item.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Rewards;
