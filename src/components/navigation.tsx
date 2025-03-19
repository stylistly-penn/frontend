"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { post } from "@/app/util";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Make sure localStorage is only accessed client-side
  useEffect(() => {
    // Client-side initialization logic if needed
  }, []);

  const navItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  ];

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Only access localStorage on the client
      if (typeof window !== "undefined") {
        localStorage.clear(); // Clear user data
      }

      const response = await post("auth/logout/");
      console.log(response);

      router.push("/"); // Redirect to home
    } catch (error: any) {
      console.error("Logout error:", error);

      // Handle 404 error
      if (error.status === 404) {
        notFound();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-indigo-600 text-xl font-bold">Stylistly</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative",
                    pathname === href && "bg-gray-100 text-gray-900"
                  )}
                  disabled={isLoading}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                  {pathname === href && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-600" />
                  )}
                </Button>
              </Link>
            ))}

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {isLoading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Export with dynamic import and SSR disabled
export default dynamic(() => Promise.resolve(Navigation), { ssr: false });
