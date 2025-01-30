"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/app/util"; // Adjust import path if needed
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthGuard from "@/components/authGuard";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await post("auth/login/", {
        jsonBody: { username: email, password },
      });
      console.log(response);
      router.push("/marketplace");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    }
  };

  return (
    <AuthGuard isPublic>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to access your personalized color palette
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  className="h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" passHref>
                  <Button
                    variant="link"
                    className="px-0 font-normal text-indigo-600"
                  >
                    Forgot password?
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button
                    variant="link"
                    className="px-0 font-normal text-indigo-600"
                  >
                    Create account
                  </Button>
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
              >
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

export default LoginPage;
