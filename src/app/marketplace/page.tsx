"use client";
import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Search, User } from "lucide-react";

const MarketplacePage = () => {
  const [activeFilter, setActiveFilter] = React.useState("all-items");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Sample product data - would come from your API
  const products = [
    {
      id: 1,
      name: "Beige Trousers",
      price: 89.99,
      category: "sara-autumn",
      image: "/api/placeholder/300/400",
    },
    {
      id: 2,
      name: "Olive Jumpsuit",
      price: 129.99,
      category: "sara-autumn",
      image: "/api/placeholder/300/400",
    },
    {
      id: 3,
      name: "Blue Turtleneck",
      price: 59.99,
      category: "winter",
      image: "/api/placeholder/300/400",
    },
    {
      id: 4,
      name: "Navy Sweater",
      price: 79.99,
      category: "winter",
      image: "/api/placeholder/300/400",
    },
    {
      id: 5,
      name: "Black Skirt",
      price: 49.99,
      category: "basic",
      image: "/api/placeholder/300/400",
    },
    {
      id: 6,
      name: "White Tank Top",
      price: 29.99,
      category: "basic",
      image: "/api/placeholder/300/400",
    },
  ];

  const filteredProducts = products.filter((product) => {
    if (activeFilter !== "all-items" && product.category !== activeFilter)
      return false;
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="py-4">
            <h1 className="text-xl font-semibold mb-4">Marketplace</h1>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <Tabs
              defaultValue="all-items"
              className="mt-4"
              onValueChange={setActiveFilter}
            >
              <TabsList className="w-full justify-start gap-2 h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="all-items"
                  className="px-4 py-2 rounded-full data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  All Items
                </TabsTrigger>
                <TabsTrigger
                  value="sara-autumn"
                  className="px-4 py-2 rounded-full data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Sara Autumn
                </TabsTrigger>
                <TabsTrigger
                  value="winter"
                  className="px-4 py-2 rounded-full data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Winter
                </TabsTrigger>
                <TabsTrigger
                  value="basic"
                  className="px-4 py-2 rounded-full data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Basic
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border-0 shadow-sm"
            >
              <Link href={`/product/${product.id}`}>
                <div className="aspect-[3/4] relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-slate-900">{product.name}</h3>
                  <p className="text-slate-600">${product.price}</p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-3">
            <Link href="/marketplace">
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1"
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </Button>
            </Link>
            <Link href="/saved">
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1"
              >
                <Search className="h-5 w-5" />
                <span className="text-xs">Saved</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MarketplacePage;
// // pages/marketplace.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";

// export default function Marketplace({ items }: { items: any[] }) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeTab, setActiveTab] = useState("Tops");

//   const filteredItems = (items || []).filter((item) =>
//     item.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const categories = ["Tops", "Bottoms", "Dresses"];

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col">
//       {/* Header */}
//       <div className="px-4 py-2 bg-white shadow">
//         <h1 className="text-2xl font-bold">Marketplace</h1>
//         <input
//           type="text"
//           placeholder="Search"
//           className="w-full mt-2 p-2 border rounded-lg"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       {/* Tabs */}
//       <div className="flex justify-around bg-white py-2 shadow mt-2">
//         {categories.map((category) => (
//           <button
//             key={category}
//             className={`px-4 py-2 ${
//               activeTab === category
//                 ? "border-b-2 border-black font-semibold"
//                 : "text-gray-500"
//             }`}
//             onClick={() => setActiveTab(category)}
//           >
//             {category}
//           </button>
//         ))}
//       </div>

//       {/* Tag Filters */}
//       <div className="flex overflow-x-auto space-x-2 px-4 py-2 bg-gray-100">
//         {["All Styles", "Euro Summer", "Farmer", "Preppy"].map((tag, index) => (
//           <button
//             key={index}
//             className="bg-gray-300 px-3 py-1 rounded-lg shadow hover:bg-gray-400"
//           >
//             {tag}
//           </button>
//         ))}
//       </div>

//       {/* Items Grid */}
//       <div className="grid grid-cols-2 gap-4 p-4 flex-grow">
//         {filteredItems.map((item) => (
//           <div
//             key={item.id}
//             className="bg-white p-4 rounded-lg shadow flex flex-col items-center"
//           >
//             <img
//               src={item.image}
//               alt={item.title}
//               className="w-24 h-24 object-cover rounded-lg mb-2"
//             />
//             <p className="text-center text-sm">{item.title}</p>
//           </div>
//         ))}
//       </div>

//       {/* Footer Navigation */}
//       <div className="flex justify-around bg-white py-4 shadow">
//         <Link href="/" passHref>
//           <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
//             Home
//           </button>
//         </Link>
//         <Link href="/profile" passHref>
//           <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
//             Profile
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }

// // Fetch data from an API
// // export async function getServerSideProps() {
// //   // Replace with your API endpoint
// //   const res = await fetch("https://fakestoreapi.com/products"); // Example API
// //   const data = await res.json();

// //   return {
// //     props: {
// //       items: data.map((item: any) => ({
// //         id: item.id,
// //         title: item.title,
// //         image: item.image,
// //       })),
// //     },
// //   };
// // }
