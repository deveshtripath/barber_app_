import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Mail, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-gray-100 p-3">
              <Scissors className="h-6 w-6 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">CutQueue</CardTitle>
          <div className="flex w-full mt-4">
            <div className="w-1/2 border-b-2 border-black py-2 text-center font-medium">
              Login
            </div>
            <Link
              to="/register"
              className="w-1/2 border-b-2 border-transparent py-2 text-center text-gray-500 hover:text-gray-700"
            >
              Register
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="EMAIL"
                  className="pl-10 bg-gray-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="password"
                  placeholder="••••••"
                  className="pl-10 bg-gray-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>

              <div className="text-sm">
                <Link
                  to="#"
                  className="font-medium text-gray-700 hover:text-gray-900"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-500 hover:bg-gray-600"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              By continuing, you agree to our{" "}
              <Link
                to="#"
                className="font-medium text-gray-900 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="#"
                className="font-medium text-gray-900 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
