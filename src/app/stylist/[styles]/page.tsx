"use client";

import { useParams } from "next/navigation";

export default function StylistSeasonPage() {
  const { season } = useParams(); // Get the dynamic route parameter

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Stylist Collection</h1>
      <p className="text-lg mt-4">Season: {season}</p>
    </div>
  );
}
