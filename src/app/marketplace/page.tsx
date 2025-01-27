// pages/marketplace.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Marketplace({ items }: { items: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Tops");

  const filteredItems = (items || []).filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ["Tops", "Bottoms", "Dresses"];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 bg-white shadow">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <input
          type="text"
          placeholder="Search"
          className="w-full mt-2 p-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-around bg-white py-2 shadow mt-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 ${
              activeTab === category
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tag Filters */}
      <div className="flex overflow-x-auto space-x-2 px-4 py-2 bg-gray-100">
        {["All Styles", "Euro Summer", "Farmer", "Preppy"].map((tag, index) => (
          <button
            key={index}
            className="bg-gray-300 px-3 py-1 rounded-lg shadow hover:bg-gray-400"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-4 p-4 flex-grow">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-lg shadow flex flex-col items-center"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-24 h-24 object-cover rounded-lg mb-2"
            />
            <p className="text-center text-sm">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-around bg-white py-4 shadow">
        <Link href="/" passHref>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Home
          </button>
        </Link>
        <Link href="/profile" passHref>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Profile
          </button>
        </Link>
      </div>
    </div>
  );
}

// Fetch data from an API
// export async function getServerSideProps() {
//   // Replace with your API endpoint
//   const res = await fetch("https://fakestoreapi.com/products"); // Example API
//   const data = await res.json();

//   return {
//     props: {
//       items: data.map((item: any) => ({
//         id: item.id,
//         title: item.title,
//         image: item.image,
//       })),
//     },
//   };
// }
