"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/app/util";
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
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

interface AuthLoginResponse {
  user?: {
    season?: {
      name: string;
      colors: {
        code: string;
        color_id: number;
      }[];
    } | null;
  };
}

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState<"username" | "email">(
    "username"
  );
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await post<AuthLoginResponse>("auth/login/", {
        jsonBody: {
          [loginMethod]: identifier,
          password,
        },
      });

      if (!response) {
        throw new Error("Invalid response from server");
      }

      setUserDetails(response);

      if (typeof window !== "undefined") {
        localStorage.setItem("username", identifier);
        if (
          response.user?.season !== null &&
          response.user?.season !== undefined
        ) {
          const user_season = response.user.season.name;
          const colorCodes = response.user.season.colors.map(
            (color) => color.code
          );
          const colorIds = response.user.season.colors.map(
            (color) => color.color_id
          );
          localStorage.setItem("season", user_season);
          localStorage.setItem("colorPalette", JSON.stringify(colorCodes));
          localStorage.setItem("colorIds", JSON.stringify(colorIds));
        }
      }

      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");

      // Handle 404 error
      if (err.status === 404) {
        notFound();
      }
    } finally {
      setIsLoading(false);
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
              <div className="flex space-x-4 mb-4">
                <Button
                  type="button"
                  variant={loginMethod === "username" ? "default" : "outline"}
                  onClick={() => setLoginMethod("username")}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Username
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === "email" ? "default" : "outline"}
                  onClick={() => setLoginMethod("email")}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Email
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {loginMethod === "username" ? "Username" : "Email"}
                </Label>
                <Input
                  id="identifier"
                  type={loginMethod === "email" ? "email" : "text"}
                  placeholder={`Enter your ${loginMethod}`}
                  className="h-12"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" passHref>
                  <Button
                    variant="link"
                    className="px-0 font-normal text-indigo-600"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button
                    variant="link"
                    className="px-0 font-normal text-indigo-600"
                    disabled={isLoading}
                  >
                    Create account
                  </Button>
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

// Export with dynamic import and SSR disabled
export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });
