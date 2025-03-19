"use client";
import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/rootlayout";
import { useRef } from "react";
import { get, patch, post_ml, post, del } from "@/app/util";
import { startTaskPolling } from "./taskPoller";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Helper function to calculate days ago
const getDaysAgo = (dateString: string): string => {
  const updateDate = new Date(dateString);
  const currentDate = new Date();

  // Calculate difference in milliseconds
  const diffTime = Math.abs(currentDate.getTime() - updateDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Updated today";
  } else if (diffDays === 1) {
    return "Updated yesterday";
  } else {
    return `Updated ${diffDays} days ago`;
  }
};

// Add this interface near the top of the file, after the imports
interface AuthResponse {
  authenticated: boolean;
  user: {
    username: string;
    email: string;
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

// Define the ML response type
interface MLResponse {
  task_id: string;
  status?: string;
}

// Define List interface
interface List {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  item_count?: number; // Added to store the number of items
}

// Define ListItem interface
interface ListItem {
  id: number;
  item: {
    id: number;
    description: string;
    price: number;
    brand: {
      id: number;
      name: string;
    };
    product_url: string;
    colors: Array<{
      code: string;
      real_rgb: string;
      image_url: string;
      color_id: number;
      euclidean_distance: number;
    }>;
    product_id: string;
  };
  added_at: string;
}

const ProfilePage = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  // State for client-side only data
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState("");

  const [userColorPalette, setUserColorPalette] = useState<
    { id: number; name: string; rgb: string }[]
  >([]);
  const [userColorIds, setUserColorIds] = useState<number[]>([]);
  const [userSeason, setUserSeason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
    // Get username from localStorage only after client-side hydration
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Load and process color palette from localStorage
  useEffect(() => {
    // Only run when we've confirmed we're on the client
    if (!isClient) return;

    const checkAuthAndUpdateSeason = async () => {
      try {
        const authResponse = (await get("auth/check")) as AuthResponse;

        if (authResponse.authenticated) {
          localStorage.setItem("username", authResponse.user.username);
          setUsername(authResponse.user.username);

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
  }, [isClient]); // Only run when isClient changes to true

  // Fetch user's lists
  useEffect(() => {
    // Only run when we've confirmed we're on the client
    if (!isClient) return;

    const fetchLists = async () => {
      try {
        setIsLoadingLists(true);
        const listsResponse = await get<{
          count: number;
          next: string | null;
          previous: string | null;
          results: List[];
        }>("lists/");

        // Use the results array from the paginated response
        const listsData = listsResponse.results || [];

        // For each list, get the items count
        const listsWithItemCount = await Promise.all(
          listsData.map(async (list) => {
            try {
              const itemsResponse = await get<{
                count: number;
                next: string | null;
                previous: string | null;
                results: ListItem[];
              }>(`lists/${list.id}/items/`);

              const items = itemsResponse.results || [];
              return {
                ...list,
                item_count: items.length,
              };
            } catch (error) {
              console.error(`Error fetching items for list ${list.id}:`, error);
              return {
                ...list,
                item_count: 0,
              };
            }
          })
        );

        setLists(listsWithItemCount);
      } catch (error) {
        console.error("Error fetching lists:", error);
      } finally {
        setIsLoadingLists(false);
      }
    };

    fetchLists();
  }, [isClient]); // Only run when isClient changes to true

  const handleCreateList = async () => {
    try {
      const newListName = prompt("Enter a name for your new list:");
      if (!newListName) return;

      const newList = await post<List>("lists/", {
        jsonBody: { name: newListName },
      });

      setLists([...lists, { ...newList, item_count: 0 }]);
    } catch (error) {
      console.error("Error creating new list:", error);
    }
  };

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
        const mlResponse = await post_ml<MLResponse>("/uploadfile/", {
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
    // Only run when we've confirmed we're on the client
    if (!isClient) return;

    // Check for pending tasks when component mounts
    startTaskPolling();

    const handleSeasonUpdateTyped =
      handleSeasonUpdate as unknown as EventListener;
    window.addEventListener("seasonUpdated", handleSeasonUpdateTyped);

    return () => {
      window.removeEventListener("seasonUpdated", handleSeasonUpdateTyped);
    };
  }, [isClient]);

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

  const handleDeleteList = async (listId: number, event: React.MouseEvent) => {
    // Stop the event from propagating to parent elements
    event.stopPropagation();

    setIsDeletingList(true);
    try {
      // Call the DELETE endpoint directly with fetch to handle 204 No Content response
      const url = `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      }/lists/${listId}/`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Update the lists state by removing the deleted list
      setLists(lists.filter((list) => list.id !== listId));
      toast.success("List deleted successfully");
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    } finally {
      setIsDeletingList(false);
    }
  };

  // Update the season information section to show loading state or "No season" when null
  const renderSeasonInfo = () => {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {username ? `Welcome, ${username}` : "Welcome"}
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
    );
  };

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
            your natural features. It takes into account your undertone, eye
            color, and natural hair color to assign you one of four color
            palettes: Spring, Summer, Autumn, or Winter. Your respective color
            palette will enhance your natural beauty!
          </p>
        </CardContent>
      </Card>

      {/* Ideal Color Combinations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            Ideal Color Combinations {userSeason ? `for ${userSeason}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          ) : (
            <div className="text-gray-600 space-y-3">
              {userSeason === "Spring" && (
                <>
                  <p>
                    Go for warm, bright, and light combinations! Think coral and
                    ivory, peach and mint, or dusty orange and camel.
                  </p>
                  <ul className="list-disc list-inside">
                    <li>Coral + Ivory</li>
                    <li>Peach + Mint</li>
                    <li>Dusty Orange + Camel</li>
                  </ul>
                </>
              )}
              {userSeason === "Summer" && (
                <>
                  <p>
                    Soft, cool, and muted combinations work best. Try a sky blue
                    and lavender, or soft navy with blush pink.
                  </p>
                  <ul className="list-disc list-inside">
                    <li>Sky Blue + Lavender</li>
                    <li>Soft Navy + Blush Pink</li>
                    <li>Mauve + Cool Grey</li>
                  </ul>
                </>
              )}
              {userSeason === "Autumn" && (
                <>
                  <p>
                    Embrace rich, earthy tones! Olive and rust, burgundy and
                    dusty pink are classic combos.
                  </p>
                  <ul className="list-disc list-inside">
                    <li>Olive + Rust</li>
                    <li>Burgundy + Dusty Pink</li>
                    <li>Terracotta + Forest Green</li>
                  </ul>
                </>
              )}
              {userSeason === "Winter" && (
                <>
                  <p>
                    High contrast and cool tones shine. Think black and white,
                    royal blue with silver, or deep red and charcoal.
                  </p>
                  <ul className="list-disc list-inside">
                    <li>Black + White</li>
                    <li>Royal Blue + Silver</li>
                    <li>Deep Red + Charcoal</li>
                  </ul>
                </>
              )}
              {/* New Section for No Season */}
              {!userSeason && (
                <>
                  <p>
                    Uh oh! Looks like you don't have a season yet. Upload a
                    photo to get started!
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Lists Section */}
      <h2 className="text-2xl font-bold mb-4">My Lists</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {isLoadingLists ? (
          // Loading state for lists
          Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={`loading-${index}`} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </CardContent>
              </Card>
            ))
        ) : lists.length > 0 ? (
          // Display user's lists
          lists.map((list) => (
            <Card
              key={list.id}
              className="hover:shadow-lg transition-shadow cursor-pointer relative group"
              onClick={() => (window.location.href = `/lists/${list.id}`)}
            >
              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-0"
                    onClick={(e) => e.stopPropagation()}
                    disabled={isDeletingList}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete list?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the list "{list.name}" and
                      all its items. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={(e) => handleDeleteList(list.id, e)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <CardHeader>
                <CardTitle>{list.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500">{list.item_count} items</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getDaysAgo(list.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Empty state
          <Card className="col-span-3 p-8 text-center">
            <p className="text-gray-500 mb-4">You don't have any lists yet</p>
          </Card>
        )}

        {/* Add new list card */}
        <Card className="flex items-center justify-center h-full cursor-pointer hover:shadow-lg transition-shadow">
          <Button variant="ghost" size="lg" onClick={handleCreateList}>
            + Create New List
          </Button>
        </Card>
      </div>
    </RootLayout>
  );
};

export default ProfilePage;
