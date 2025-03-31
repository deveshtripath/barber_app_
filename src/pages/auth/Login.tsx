import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Phone, KeyRound, Mail, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const { login, loginWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/customer/home");
    } catch (err: any) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number");
      setIsLoading(false);
      return;
    }

    try {
      await loginWithOtp(phoneNumber);
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown for resend
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await verifyOtp(phoneNumber, otp);
      navigate("/customer/home");
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
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
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="phone">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="phone">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="tel"
                        placeholder="PHONE NUMBER (e.g. +1234567890)"
                        className="pl-10 bg-gray-100"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Include country code (e.g. +1 for US)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gray-500 hover:bg-gray-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="ENTER OTP"
                        className="pl-10 bg-gray-100"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        OTP sent to {phoneNumber}
                      </p>
                      {countdown > 0 ? (
                        <p className="text-xs text-gray-500">
                          Resend in {countdown}s
                        </p>
                      ) : (
                        <Button
                          type="button"
                          variant="link"
                          className="text-xs p-0 h-auto"
                          onClick={handleSendOtp}
                          disabled={isLoading}
                        >
                          Resend OTP
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gray-500 hover:bg-gray-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setOtpSent(false)}
                    disabled={isLoading}
                  >
                    Change Phone Number
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
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
                      placeholder="PASSWORD"
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
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Forgot Password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gray-500 hover:bg-gray-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-gray-900 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

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

          {/* Hidden recaptcha container for Firebase Phone Auth */}
          <div id="recaptcha-container"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
