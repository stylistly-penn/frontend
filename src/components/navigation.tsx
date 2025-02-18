"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { post } from "@/app/util";

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  ];

  const handleLogout = async () => {
    localStorage.clear(); // Clear user data
    const response = await post("auth/logout/");
    console.log(response);
    router.push("/"); // Redirect to home
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
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
