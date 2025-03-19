"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, ShoppingBag, Wand2 } from "lucide-react";
import dynamic from "next/dynamic";

// Make the homepage client-side only
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="py-4 px-6 flex justify-end bg-white/80 backdrop-blur-sm fixed w-full top-0 z-10">
        <div className="space-x-4">
          <Link href="/login" passHref>
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup" passHref>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Discover Your Perfect Color Palette
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Find your most flattering colors and shop a personalized wardrobe
            that brings out your natural beauty
          </p>
          <Link href="/login" passHref>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12 text-slate-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Palette className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Color Analysis
                </h3>
                <p className="text-slate-600 text-center">
                  Our advanced tool analyzes your unique features to determine
                  your perfect color palette
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Wand2 className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Personalized Recommendations
                </h3>
                <p className="text-slate-600 text-center">
                  Get customized style suggestions that complement your natural
                  coloring
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Curated Shopping
                </h3>
                <p className="text-slate-600 text-center">
                  Shop from a carefully selected collection of clothing that
                  matches your palette
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6 text-slate-900">
            Ready to Transform Your Wardrobe?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of others who have discovered their perfect colors
            and revolutionized their shopping experience
          </p>
          <Link href="/login" passHref>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Start Your Color Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

// Export as a dynamic component with SSR disabled
export default dynamic(() => Promise.resolve(HomePage), { ssr: false });

// import Link from "next/link";

// export default function Home() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <header className="w-full bg-blue-600 text-white py-4 shadow-md">
//         <h1 className="text-2xl text-center font-bold">Welcome to My App</h1>
//       </header>

//       <main className="flex flex-col items-center mt-10">
//         <p className="text-lg mb-6">This is the homepage.</p>
//         <nav className="space-y-4">
//           <Link
//             href="/index"
//             className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
//           >
//             Go to About Page
//           </Link>
//           <Link
//             href="/marketplace"
//             className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
//           >
//             Go to Marketplace
//           </Link>
//           <Link
//             href="/profile"
//             className="bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-4 rounded"
//           >
//             Go to Profile
//           </Link>
//         </nav>
//       </main>

//       <footer className="w-full mt-auto py-4 bg-gray-200 text-center">
//         <p className="text-sm">&copy; {new Date().getFullYear()} My App</p>
//       </footer>
//     </div>
//   );
// }
