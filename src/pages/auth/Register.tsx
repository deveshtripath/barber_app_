import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Scissors, User, Mail, Phone, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "barber">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, role, phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-gray-100 p-3">
              <Scissors className="h-6 w-6 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">CutQueue</CardTitle>
          <div className="flex w-full mt-4">
            <Link
              to="/login"
              className="w-1/2 border-b-2 border-transparent py-2 text-center text-gray-500 hover:text-gray-700"
            >
              Login
            </Link>
            <div className="w-1/2 border-b-2 border-black py-2 text-center font-medium">
              Register
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  placeholder="FULL NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-gray-100"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-100"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="PHONE NUMBER"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 bg-gray-100"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-100"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-gray-100"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>I am a:</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) =>
                  setRole(value as "customer" | "barber")
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer">Customer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="barber" id="barber" />
                  <Label htmlFor="barber">Barber</Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              type="submit"
              className="w-full bg-gray-500 hover:bg-gray-600"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600">
            By continuing, you agree to our{" "}
            <Link to="#" className="font-medium text-gray-900 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="font-medium text-gray-900 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
