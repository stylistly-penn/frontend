"use client";
import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/rootlayout";
import { useRef } from "react";
import { get, patch, post_ml } from "@/app/util";
import { startTaskPolling } from "./taskPoller";

// Add this interface near the top of the file, after the imports
interface AuthResponse {
  authenticated: boolean;
  user: {
    season: {
      name: string;
      colors: Array<{
        code: string;
        color_id: number;
      }>;
    };
  };
}

// Add this interface near the top with other interfaces
interface SeasonUpdateEvent extends CustomEvent {
  detail: { season: string };
}

const ProfilePage = () => {
  const stylists = [
    { name: "Fall", items: 12 },
    { name: "Prom", items: 8 },
    { name: "Work", items: 15 },
    { name: "Date night", items: 6 },
    { name: "Casual", items: 20 },
    { name: "Gym", items: 10 },
  ];

  const [userColorPalette, setUserColorPalette] = useState<
    { id: number; name: string; rgb: string }[]
  >([]);
  const [userColorIds, setUserColorIds] = useState<number[]>([]);
  const [userSeason, setUserSeason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load and process color palette from localStorage
  useEffect(() => {
    const checkAuthAndUpdateSeason = async () => {
      try {
        const authResponse = (await get("auth/check")) as AuthResponse;

        if (authResponse.authenticated) {
          if (authResponse.user.season === null) {
            // Clear any stale data from localStorage
            localStorage.removeItem("season");
            localStorage.removeItem("colorPalette");
            localStorage.removeItem("colorIds");
            setUserSeason(null);
            setUserColorPalette([]);
            setUserColorIds([]);
          } else {
            // Update with fresh data from auth
            localStorage.setItem("season", authResponse.user.season.name);
            localStorage.setItem(
              "colorPalette",
              JSON.stringify(authResponse.user.season.colors.map((c) => c.code))
            );
            localStorage.setItem(
              "colorIds",
              JSON.stringify(
                authResponse.user.season.colors.map((c) => c.color_id)
              )
            );

            setUserSeason(authResponse.user.season.name);
            const parsedColors = authResponse.user.season.colors.map(
              (colorData: { code: string; color_id: number }) => {
                const rgbArray = colorData.code
                  .replace(/\[|\]/g, "")
                  .split(" ")
                  .map(Number);

                return {
                  id: colorData.color_id,
                  name: `Color ${colorData.color_id}`,
                  rgb: `rgb(${rgbArray.join(",")})`,
                };
              }
            );

            setUserColorPalette(parsedColors);
            setUserColorIds(parsedColors.map((color) => color.id));
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuthAndUpdateSeason();
  }, []); // Run once on mount

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoading(true); // Start loading
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);

      try {
        console.log("Uploading file to ML API...");
        const mlResponse = await post_ml("/uploadfile/", {
          body: formData,
        });

        if (mlResponse && mlResponse.task_id) {
          localStorage.setItem("task_id", mlResponse.task_id);
          startTaskPolling();
        }
      } catch (error) {
        console.error("Error processing file upload:", error);
        setIsLoading(false); // Stop loading on error
      }
    }
  };

  useEffect(() => {
    // Check for pending tasks when component mounts
    startTaskPolling();

    const handleSeasonUpdateTyped =
      handleSeasonUpdate as unknown as EventListener;
    window.addEventListener("seasonUpdated", handleSeasonUpdateTyped);

    return () => {
      window.removeEventListener("seasonUpdated", handleSeasonUpdateTyped);
    };
  }, []);

  const handleSeasonUpdate = async (event: SeasonUpdateEvent) => {
    const { season } = event.detail;
    if (!season) return;

    try {
      setIsLoading(true);
      console.log("Updating season to:", season);

      // Send PATCH request with season name
      await patch(`seasons/user_update/`, {
        jsonBody: { season },
      });

      // Get fresh auth data
      const authResponse = (await get("auth/check")) as AuthResponse;
      if (authResponse.authenticated && authResponse.user.season) {
        // Update localStorage
        localStorage.setItem("season", authResponse.user.season.name);
        localStorage.setItem(
          "colorPalette",
          JSON.stringify(authResponse.user.season.colors.map((c) => c.code))
        );
        localStorage.setItem(
          "colorIds",
          JSON.stringify(authResponse.user.season.colors.map((c) => c.color_id))
        );

        // Update UI state
        setUserSeason(authResponse.user.season.name);
        const parsedColors = authResponse.user.season.colors.map(
          (colorData: { code: string; color_id: number }) => {
            const rgbArray = colorData.code
              .replace(/\[|\]/g, "")
              .split(" ")
              .map(Number);

            return {
              id: colorData.color_id,
              name: `Color ${colorData.color_id}`,
              rgb: `rgb(${rgbArray.join(",")})`,
            };
          }
        );

        setUserColorPalette(parsedColors);
        setUserColorIds(parsedColors.map((color) => color.id));
      }
    } catch (error) {
      console.error("Error updating season:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the season information section to show loading state or "No season" when null
  const renderSeasonInfo = () => (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">
        Welcome, {localStorage.getItem("username")}
      </h1>
      <div className="flex flex-col">
        <h2 className="text-xl text-gray-600 mb-3">Your Season:</h2>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <p className="text-lg font-semibold text-indigo-600">
            {userSeason || "No season"}
          </p>
        )}

        <h2 className="text-xl text-gray-600 mb-3">Your Color Palette:</h2>
        <div className="flex gap-4">
          {isLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mt-1"></div>
                </div>
              ))}
            </div>
          ) : userColorPalette.length > 0 ? (
            userColorPalette.map((color) => (
              <div key={color.id} className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full border border-gray-300 shadow-md"
                  style={{ backgroundColor: color.rgb }}
                  title={color.name}
                ></div>
                <span className="text-sm text-gray-700 mt-1">{color.name}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No colors found</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <RootLayout>
      {renderSeasonInfo()}

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
