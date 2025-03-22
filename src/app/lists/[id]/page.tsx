"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import RootLayout from "@/components/rootlayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  Trash2,
  Maximize2,
  ChevronRight,
} from "lucide-react";
import { get, del, post } from "@/app/util";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Add BASE_URL constant
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Interface for a list
interface List {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Interface for a list item
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

// Interface for the paginated response
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListItem[];
}

const ListDetailPage = () => {
  const params = useParams();
  const listId = params?.id as string;

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState<string>("added_at");
  const [reverse, setReverse] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [openModal, setOpenModal] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Helper function to parse RGB string
  const parseRGB = (rgbStr: string) => {
    const values = rgbStr.match(/\d+/g)?.map(Number) || [0, 0, 0];
    return `rgb(${values.join(",")})`;
  };

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch list details
  useEffect(() => {
    if (!isClient || !listId) return;

    const fetchList = async () => {
      try {
        const listData = await get<List>(`lists/${listId}/`);
        setList(listData);
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    };

    fetchList();
  }, [listId, isClient]);

  // Fetch list items with ordering
  useEffect(() => {
    if (!isClient || !listId) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("order_by", orderBy);
        queryParams.append("reverse", reverse.toString());

        console.log(
          `[Debug] Fetching items for list ${listId} with params:`,
          queryParams.toString()
        );
        const response = await get<PaginatedResponse>(
          `lists/${listId}/items/?${queryParams.toString()}`
        );
        console.log(`[Debug] API Response:`, response);
        console.log(
          `[Debug] Items count from API:`,
          response.results?.length || 0
        );

        setItems(response.results || []);
        console.log(
          `[Debug] Items state after update:`,
          response.results || []
        );
      } catch (error) {
        console.error("Error fetching list items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [listId, orderBy, reverse, isClient]);

  const handleOrderChange = (value: string) => {
    setOrderBy(value);
  };

  const toggleReverseOrder = () => {
    setReverse(!reverse);
  };

  const removeItem = async (itemId: number) => {
    if (!listId) return;

    setIsRemoving(true);
    try {
      // Use the new endpoint to remove the item, with a custom fetch to handle 204 No Content
      const url = `${
        BASE_URL || "http://localhost:8000"
      }/lists/${listId}/remove_item/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ item_id: itemId }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Update the items list by removing the deleted item
      setItems(items.filter((listItem) => listItem.item.id !== itemId));

      toast.success("Item removed from list");
    } catch (error) {
      console.error("Error removing item from list:", error);
      toast.error("Failed to remove item from list");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleExpand = (itemId: number) => {
    setOpenModal(itemId);
    setCurrentSlide(0);
  };

  const handleClose = () => {
    setOpenModal(null);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (!openModal) return;
    const listItem = items.find((item) => item.item.id === openModal);
    if (!listItem || !listItem.item.colors) return;
    setCurrentSlide((prev) => (prev + 1) % listItem.item.colors.length);
  };

  const prevSlide = () => {
    if (!openModal) return;
    const listItem = items.find((item) => item.item.id === openModal);
    if (!listItem || !listItem.item.colors) return;
    setCurrentSlide(
      (prev) =>
        (prev - 1 + listItem.item.colors.length) % listItem.item.colors.length
    );
  };

  return (
    <RootLayout>
      <div className="space-y-6">
        {/* Back button */}
        <div>
          <Link href="/profile">
            <Button variant="ghost" className="pl-0">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>

        {/* Header with list name and item count */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {list ? list.name : "Loading list..."}
          </h1>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {items.length} items
          </Badge>
        </div>

        {/* Sort controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select value={orderBy} onValueChange={handleOrderChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort Options</SelectLabel>
                  <SelectItem value="added_at">Date Added</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="euclidean_distance">
                    Color Match
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleReverseOrder}
            className="gap-2"
          >
            {reverse ? (
              <>
                <ArrowDown className="h-4 w-4" /> Descending
              </>
            ) : (
              <>
                <ArrowUp className="h-4 w-4" /> Ascending
              </>
            )}
          </Button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in this list yet.</p>
            <p className="text-xs text-gray-400 mt-2">
              Debug: items state length is {items.length}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Console log for debugging */}
            {(() => {
              console.log("[Debug] Rendering items:", items);
              return null;
            })()}
            {items.map((listItem) => {
              // Console log for debugging item processing
              (() => {
                console.log("[Debug] Processing item:", listItem);
              })();
              const item = listItem.item;
              // Use the first color or best match based on euclidean distance
              let primaryColor =
                item.colors && item.colors.length > 0 ? item.colors[0] : null;
              if (
                orderBy === "euclidean_distance" &&
                item.colors &&
                item.colors.length > 0
              ) {
                // Sort by euclidean_distance and take the best match
                primaryColor = [...item.colors].sort(
                  (a, b) => a.euclidean_distance - b.euclidean_distance
                )[0];
              }

              return (
                <Card
                  key={listItem.id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  {/* Remove button - visible on hover */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove from list?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove "{item.description}" from your list.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* ID Badge in top-right corner */}
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm"
                  >
                    ID: {item.id}
                  </Badge>

                  <Link href={item.product_url}>
                    <div className="aspect-[3/4] relative bg-gray-100 flex items-center justify-center">
                      {primaryColor?.image_url ? (
                        <img
                          src={primaryColor.image_url}
                          alt={item.description}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-gray-500">{item.description}</p>
                          <p className="text-sm text-gray-400 mt-2">
                            {item.brand.name}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-slate-900">
                        {item.description}
                      </h3>
                      <p className="text-slate-600">${item.price}</p>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          {primaryColor ? (
                            <>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-2">
                                  Real Color
                                </span>
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{
                                    backgroundColor: primaryColor.real_rgb
                                      ? parseRGB(primaryColor.real_rgb)
                                      : "transparent",
                                  }}
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-2">
                                  Season Color
                                </span>
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{
                                    backgroundColor: primaryColor.code
                                      ? parseRGB(primaryColor.code)
                                      : "transparent",
                                  }}
                                />
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Distance:{" "}
                                {primaryColor.euclidean_distance.toFixed(2)}
                              </Badge>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">
                              No color information available
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Show when item was added to the list */}
                      <p className="text-xs text-gray-400 mt-2">
                        Added:{" "}
                        {new Date(listItem.added_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>

                  {/* Expand Button for multiple colors */}
                  {item.colors?.length > 1 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleExpand(item.id);
                      }}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Show {item.colors.length - 1} More Colors
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Color Variants Modal */}
        <Dialog open={openModal !== null} onOpenChange={() => handleClose()}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Color Variants</DialogTitle>
            </DialogHeader>

            {openModal && (
              <div className="relative">
                <div className="flex items-center justify-center">
                  {/* Current Slide */}
                  {items
                    .find((item) => item.item.id === openModal)
                    ?.item.colors.map((color, index) => (
                      <div
                        key={index}
                        className={cn(
                          "transition-all duration-300",
                          currentSlide === index ? "block" : "hidden"
                        )}
                      >
                        <Card className="overflow-hidden border-0 shadow-sm w-full max-w-md mx-auto">
                          <div className="aspect-[3/4] relative">
                            {color.image_url && (
                              <img
                                src={color.image_url}
                                alt={
                                  items.find(
                                    (item) => item.item.id === openModal
                                  )?.item.description
                                }
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-slate-900">
                              {
                                items.find((item) => item.item.id === openModal)
                                  ?.item.description
                              }
                            </h3>
                            <p className="text-slate-600">
                              $
                              {
                                items.find((item) => item.item.id === openModal)
                                  ?.item.price
                              }
                            </p>
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-2">
                                    Real Color
                                  </span>
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-200"
                                    style={{
                                      backgroundColor: parseRGB(color.real_rgb),
                                    }}
                                  />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-2">
                                    Season Color
                                  </span>
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-200"
                                    style={{
                                      backgroundColor: parseRGB(color.code),
                                    }}
                                  />
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  Distance:{" "}
                                  {color.euclidean_distance.toFixed(2)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                </div>

                {/* Navigation and Indicators together at bottom */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button variant="ghost" size="icon" onClick={prevSlide}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Slide Indicators */}
                  <div className="flex justify-center gap-2">
                    {items
                      .find((item) => item.item.id === openModal)
                      ?.item.colors.map((_, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-2 h-2 rounded-full p-0",
                            currentSlide === index
                              ? "bg-primary"
                              : "bg-gray-200"
                          )}
                          onClick={() => setCurrentSlide(index)}
                        />
                      ))}
                  </div>

                  <Button variant="ghost" size="icon" onClick={nextSlide}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RootLayout>
  );
};

export default ListDetailPage;
