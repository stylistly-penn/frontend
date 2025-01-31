"use client";
import AuthGuard from "@/components/authGuard";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function StylistSeasonPage() {
  const { season } = useParams(); // Get the dynamic route parameter

  return (
    <AuthGuard>
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="font-semibold text-xl text-indigo-600">
              Stylistly
            </Link>

            {/* Right Side Items */}
            <div className="flex items-center space-x-4">
              <Link href="/marketplace">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Stylist Collection</h1>
        <p className="text-lg mt-4">Season: {season}</p>
      </div>
    </AuthGuard>
  );
}
