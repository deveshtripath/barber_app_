import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header"; 
import BottomNavigation from "../../components/customer/BottomNavigation"; 
import { useAuth } from "../../lib/auth"; 
import { Button } from "../../components/ui/button"; 
import { Input } from "../../components/ui/input"; 
import { Label } from "../../components/ui/label"; 
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"; 
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"; 
import { Separator } from "../../components/ui/separator"; 
import { Switch } from "../../components/ui/switch"; 
import {
  LogOut,
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  Camera,
  Mail,
  Phone,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"; 

const Profile: React.FC = () => {
  const { user, logout, updateUserProfile, uploadProfileImage } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state with user data
  const [name, setName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [location, setLocation] = useState(user?.location || "");


  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile({
        fullName,
        phoneNumber,
        location,
      });
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      await uploadProfileImage(file);
      setSuccess("Profile image updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Failed to logout");
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 pt-[60px] pb-[70px] flex items-center justify-center">
          <div className="text-center p-4">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
            <p className="text-gray-500 mb-4">
              Please log in to view your profile.
            </p>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pt-[60px] pb-[70px] overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">My Profile</h1>

          {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <AvatarImage src={user?.image} alt={fullName} />
                <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="mt-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-5 w-5 text-gray-500" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={phoneNumber} disabled />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <Button onClick={handleSaveProfile} disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold">{fullName}</h2>
                <p className="text-gray-500"><Phone className="inline h-4 w-4" /> {phoneNumber}</p>
                <p className="text-gray-500"><MapPin className="inline h-4 w-4" /> {location}</p>
                <Button variant="outline" className="mt-2" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/admin/add-barber")}
          >
            Add Barber
          </Button>

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <span>Push Notifications</span>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <span>Email Notifications</span>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <span>SMS Notifications</span>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <Shield className="h-5 w-5 mr-2" />
              Privacy & Security
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <HelpCircle className="h-5 w-5 mr-2" />
              Help & Support
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout from your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default Profile;