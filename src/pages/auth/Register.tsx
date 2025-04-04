import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { sendVerificationCode, verifyCode } from "../../lib/twilioService";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setError(null);
    try {
      await sendVerificationCode(phoneNumber);
      setIsCodeSent(true);
    } catch (err) {
      setError("Failed to send verification code. Try again.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const isVerified = await verifyCode(phoneNumber, verificationCode);
      if (!isVerified) {
        setError("Invalid verification code.");
        setLoading(false);
        return;
      }

      const userData = {
        fullName,
        phoneNumber,
        password,
        location,
        image,
        isBarber: false,
      };

      await register(userData);
      navigate("/customer/home");
    } catch (err) {
      setError("Failed to register. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              {!isCodeSent ? (
                <Button type="button" onClick={handleSendCode} disabled={loading}>Send Code</Button>
              ) : (
                <>
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input id="verificationCode" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
                </>
              )}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading || !isCodeSent}>{loading ? "Verifying..." : "Register"}</Button>
          </form>
          <div className="mt-4 text-center">
            <p>
              Already have an account? {" "}
              <Link to="/login" className="font-medium text-gray-900 hover:underline">Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;