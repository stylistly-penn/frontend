"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get } from "@/app/util"; // ✅ Import `get` from util.ts

interface AuthCheckResponse {
  authenticated: boolean;
  username?: string;
}

const AuthGuard = ({
  children,
  isPublic,
}: {
  children: React.ReactNode;
  isPublic?: boolean;
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Checking authentication via /auth/check/...");

      try {
        const data = await get<AuthCheckResponse>("/auth/check/");
        console.log("✅ Auth Check Response:", data);

        if (data.authenticated) {
          setIsAuthenticated(true);
          if (isPublic) {
            console.log("🚀 Redirecting authenticated user to /marketplace...");
            router.push("/marketplace");
          }
        } else {
          setIsAuthenticated(false);
          if (!isPublic) {
            console.log("🚨 Redirecting unauthenticated user to /login...");
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("❌ Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [isPublic, router]);

  if (isAuthenticated === null) {
    console.log("⏳ Loading authentication state...");
    return <div>Loading...</div>; // Prevents flickering
  }

  return <>{children}</>;
};

export default AuthGuard;
