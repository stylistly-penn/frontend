"use client";
import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/rootlayout";
import { useRef } from "react";

const ProfilePage = () => {
  const stylists = [
    { name: "Fall", items: 12 },
    { name: "Prom", items: 8 },
    { name: "Work", items: 15 },
    { name: "Date night", items: 6 },
    { name: "Casual", items: 20 },
    { name: "Gym", items: 10 },
  ];

  const [userColors, setUserColors] = useState<
    { id: number; name: string; rgb: string }[]
  >([]);

  // Load and process color palette from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedColors = localStorage.getItem("colorPalette");
      if (storedColors) {
        try {
          console.log(storedColors);
          const parsedColors = JSON.parse(storedColors).map(
            (color: [number, string, string]) => {
              const rgbArray = color[2]
                .replace(/\[|\]/g, "")
                .split(" ")
                .map(Number);
              return {
                id: color[0],
                name: color[1],
                rgb: `rgb(${rgbArray.join(",")})`, // Convert to CSS format
              };
            }
          );
          setUserColors(parsedColors);
        } catch (error) {
          console.error("Error parsing colorPalette:", error);
        }
      }
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      console.log("Selected file:", file);
    }
  };

  return (
    <RootLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {localStorage.getItem("username")}
        </h1>
        <div className="flex flex-col">
          <h2 className="text-xl text-gray-600 mb-3">Your Color Palette:</h2>
          <div className="flex gap-4">
            {userColors.length > 0 ? (
              userColors.map((color) => (
                <div key={color.id} className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full border border-gray-300 shadow-md"
                    style={{ backgroundColor: color.rgb }}
                    title={color.name}
                  ></div>
                  <span className="text-sm text-gray-700 mt-1">
                    {color.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No colors found</p>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Update Your Color Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Upload Button */}
            <Button onClick={handleUploadClick}>Upload New Photo</Button>

            <p className="text-sm text-gray-500 mt-2">
              Upload a well-lit photo of yourself to redo your color analysis.
            </p>

            {/* Display Uploaded Image Preview */}
            {imagePreview && (
              <div className="mt-6 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Uploaded Preview"
                  className="w-72 h-72 md:w-96 md:h-96 rounded-lg object-cover border border-gray-300 shadow-lg"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Color Analysis Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What is Color Analysis?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Color analysis is a method to determine which colors best complement
            your natural features. It takes into account your skin undertone,
            eye color, and natural hair color to create a personalized color
            palette that enhances your natural beauty.
          </p>
        </CardContent>
      </Card>

      {/* My Stylists Section */}
      <h2 className="text-2xl font-bold mb-4">My Stylists</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stylists.map((stylist) => (
          <Card
            key={stylist.name}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle>{stylist.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{stylist.items} items</p>
            </CardContent>
          </Card>
        ))}
        <Card className="flex items-center justify-center h-full cursor-pointer hover:shadow-lg transition-shadow">
          <Button variant="ghost" size="lg">
            + Add New Category
          </Button>
        </Card>
      </div>
    </RootLayout>
  );
};

export default ProfilePage;
