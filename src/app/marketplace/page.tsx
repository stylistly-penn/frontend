"use client";
import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Search, User, ShoppingCart } from "lucide-react";
import { get } from "@/app/util";
import { useState, useEffect } from "react";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all-items");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch and filter products based on color, activeFilter, and searchQuery
  const fetchAndFilterProducts = async () => {
    setLoading(true);
    try {
      // Get the color filter from your criteria
      const color = [161, 109, 58];
      const colorQuery = color.join(","); // Join array into a string
      const route = `items/`;
      const fetchedProducts = await get(route);
      setProducts(fetchedProducts); // Store fetched products

      // Apply filtering logic based on activeFilter and searchQuery
      const filtered = fetchedProducts.filter((product: any) => {
        if (activeFilter !== "all-items" && product.category !== activeFilter) {
          return false;
        }
        if (
          searchQuery &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      });

      setFilteredProducts(filtered); // Update filtered products
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and filter products when activeFilter or searchQuery changes
  useEffect(() => {
    fetchAndFilterProducts();
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <Link href={`${product.product_url}`}>
                <div className="aspect-[3/4] relative">
                  <img
                    src={product.colors[0].image_url}
                    alt={product.description}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-slate-900">
                    {product.description}
                  </h3>
                  <p className="text-slate-600">${product.price}</p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </main>

      {/* Product Grid
      <main className="max-w-4xl mx-auto px-4 mt-6">
        {loading ? (
          <div>Loading...</div> // Or use a spinner here
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden border-0 shadow-sm"
              >
                <Link href={`${product.product_url}`}>
                  <div className="aspect-[3/4] relative">
                    <img
                      src={product.colors[0].image_url}
                      alt={product.description}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-slate-900">
                      {product.description}
                    </h3>
                    <p className="text-slate-600">${product.price}</p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main> */}
    </div>
  );
};

export default Marketplace;

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
