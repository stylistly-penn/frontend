"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get } from "@/app/util";
import { notFound } from "next/navigation";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    const checkAuth = async () => {
      console.log("🔍 Checking authentication via /auth/check/...");
      setLoading(true);

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

        // Handle data not found gracefully
        if ((error as any)?.status === 404) {
          notFound();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isPublic, router]);

  // Display loading state
  if (loading || isAuthenticated === null) {
    console.log("⏳ Loading authentication state...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
};

// Export with dynamic import to disable SSR for this component
export default AuthGuard;
