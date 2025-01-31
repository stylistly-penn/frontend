import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User, ShoppingCart } from "lucide-react";
import AuthGuard from "@/components/authGuard";

const ProfilePage = () => {
  // This would come from your user context/auth state
  const userProfile = {
    name: "You",
    colorType: "Autumn",
    colorDescription:
      "That means you have warm undertones, and look best in rich, muted, and warm aesthetics.",
    colorTip: "Avoid cool, bright, or contrasting colors.",
    colorPalette: ["#FF6B6B", "#FFB347", "#FFD93D", "#95D5B2"],
    savedStyles: [
      { id: 1, name: "Fall", items: 12 },
      { id: 2, name: "Prom", items: 8 },
      { id: 3, name: "Work", items: 15 },
      { id: 4, name: "Date night", items: 6 },
      { id: 5, name: "Casual", items: 20 },
      { id: 6, name: "Gym", items: 10 },
    ],
  };

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
      <div className="min-h-screen bg-slate-50 pb-8">
        {/* Header */}
        <div className="bg-white p-6 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome, {userProfile.name}
            </h1>

            {/* Color Palette Display */}
            <div className="flex gap-2 mt-2">
              {userProfile.colorPalette.map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
          {/* Saved Styles Grid */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              My Stylists
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {userProfile.savedStyles.map((style) => (
                <Link
                  href={`/styles/${style.id}`}
                  key={style.id}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <p className="font-medium text-slate-900">{style.name}</p>
                      <p className="text-sm text-slate-500">
                        {style.items} items
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              <Link href="/styles/create" className="block">
                <Card className="hover:shadow-md transition-shadow border-dashed">
                  <CardContent className="p-4 flex items-center justify-center h-full">
                    <Plus className="w-6 h-6 text-slate-400" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* Color Analysis Results */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              My Style
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-2">
                  {userProfile.colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    You're an {userProfile.colorType}
                  </p>
                  <p className="text-slate-600 mt-1">
                    {userProfile.colorDescription}
                  </p>
                  <p className="text-slate-600 mt-2">{userProfile.colorTip}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/marketplace" passHref>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                // onClick={() => (window.location.href = "/marketplace")}
              >
                Marketplace
              </Button>
            </Link>
            <Link href="/profile" passHref>
              <Button
                className="flex-1"
                variant="outline"
                // onClick={() => (window.location.href = "/profile/edit")}
              >
                Profile
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
