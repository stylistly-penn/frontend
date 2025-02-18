"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import { get } from "@/app/util";
import { useState, useEffect } from "react";
import RootLayout from "@/components/rootlayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColorPalette {
  id: number;
  name: string;
  color_array: string;
  rgb: string;
}

interface ColorVariant {
  code: string;
  real_rgb: string;
  image_url: string;
  color_id: number;
  euclidean_distance: number;
}

interface Product {
  id: number;
  description: string;
  brand: { id: number; name: string };
  price: number;
  image: string;
  product_url: string;
  colors: ColorVariant[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

interface Season {
  id: number;
  name: string;
  colors: Array<{
    code: string;
    color_id: number;
  }>;
}

interface User {
  username: string;
  email: string;
  season: Season;
}

interface AuthResponse {
  authenticated: boolean;
  user: User;
}

// Add new interface for Brand
interface Brand {
  id: number;
  name: string;
  styles: null;
}

interface BrandResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Brand[];
}

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all-items");
  const [userColorPalette, setUserColorPalette] = useState<ColorPalette[]>([]);
  const [userColorIds, setUserColorIds] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(
    new Set()
  );
  const [stackOrder, setStackOrder] = useState<{ [key: number]: number[] }>({});
  const [openModal, setOpenModal] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userSeasonId, setUserSeasonId] = useState<number | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<number | null>(null);
  const [orderBy, setOrderBy] = useState<
    "default" | "euclidean_distance" | "price"
  >("default");

  // Function to get color palette from localStorage
  const getColorPalette = () => {
    console.log(localStorage);
    const storedColors = localStorage.getItem("colorPalette");
    const storedColorIds = localStorage.getItem("colorIds");

    if (storedColors && storedColorIds) {
      const colorIds = JSON.parse(storedColorIds); // Parse stored color IDs
      const parsedColors = JSON.parse(storedColors).map((color, index) => {
        const rgbArray = color
          .replace(/\[|\]/g, "") // Remove brackets
          .split(" ") // Split into individual values
          .map(Number);

        return {
          id: colorIds[index], // Take ID from colorIds array
          name: color.name || `Color ${index + 1}`,
          color_array: `[${rgbArray.join(",")}]`,
          rgb: `rgb(${rgbArray.join(",")})`,
        };
      });
      console.log("Parsed colors:", parsedColors);
      console.log("Color IDs:", colorIds);
      setUserColorPalette(parsedColors);
      setUserColorIds(colorIds);
    }
  };

  // Function to generate page numbers array with ellipsis
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 20) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, current - 4);
    let end = Math.min(total - 1, current + 4);

    // Add ellipsis after first page if needed
    if (start > 2) pages.push("...");

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < total - 1) pages.push("...");

    // Always show last page
    pages.push(total);

    return pages;
  };

  // Function to get user's season ID
  const getUserSeason = async () => {
    try {
      const response = await get("auth/check");
      const data: AuthResponse = response;
      if (data.authenticated && data.user.season) {
        setUserSeasonId(data.user.season.id);
      }
    } catch (error) {
      console.error("Error fetching user season:", error);
    }
  };

  // Function to fetch brands
  const fetchBrands = async () => {
    try {
      const response: BrandResponse = await get("brands");
      setBrands(response.results);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchAndFilterProducts = async () => {
    setLoading(true);
    try {
      let response: PaginatedResponse;

      // Always use filter_items when using non-default ordering or when brand is selected
      if (orderBy !== "default" || activeBrandId) {
        const queryParams = new URLSearchParams();

        // Add brand_id if selected
        if (activeBrandId) {
          queryParams.append("brand_id", activeBrandId.toString());
        }

        // Add color_id or season_id
        if (selectedColor) {
          queryParams.append("color_id", selectedColor.toString());
        } else if (userSeasonId) {
          queryParams.append("season_id", userSeasonId.toString());
        }

        // Add order_by if not default
        if (orderBy !== "default") {
          queryParams.append("order_by", orderBy);
        }

        response = await get(`items/filter_items/?${queryParams.toString()}`);
      } else if (selectedColor) {
        // Use color filter route when only color is selected
        response = await get(
          `items/filter_by_color/${selectedColor}/?page=${currentPage}`
        );
      } else if (userSeasonId) {
        // Use season filter route when no filters are selected and user has a season
        response = await get(
          `items/filter_by_season/${userSeasonId}/?page=${currentPage}`
        );
      } else {
        // Use basic items route when no filters are selected and user has no season
        response = await get(`items/?page=${currentPage}`);
      }

      const filtered = response.results.filter((product) => {
        return (
          !searchQuery ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      setTotalPages(Math.ceil(response.count / 20));
      setProducts(response.results);
      setFilteredProducts(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedColor, activeBrandId, searchQuery]);

  // Reset pagination when order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedColor, activeBrandId, searchQuery, orderBy]);

  // Load color palette on mount
  useEffect(() => {
    getColorPalette();
  }, []);

  // Get user's season ID on mount
  useEffect(() => {
    getUserSeason();
  }, []);

  // Load brands on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch products when needed
  useEffect(() => {
    fetchAndFilterProducts();
  }, [
    userSeasonId,
    selectedColor,
    activeBrandId,
    searchQuery,
    currentPage,
    orderBy,
  ]);

  const toggleProductExpansion = (productId: number) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Helper function to parse RGB string
  const parseRGB = (rgbStr: string) => {
    const values = rgbStr.match(/\d+/g)?.map(Number) || [0, 0, 0];
    return `rgb(${values.join(",")})`;
  };

  const handleExpand = (productId: number) => {
    setOpenModal(productId);
    setCurrentSlide(0);
  };

  const handleClose = () => {
    setOpenModal(null);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (!openModal) return;
    const product = filteredProducts.find((p) => p.id === openModal);
    if (!product) return;
    setCurrentSlide((prev) => (prev + 1) % product.colors.length);
  };

  const prevSlide = () => {
    if (!openModal) return;
    const product = filteredProducts.find((p) => p.id === openModal);
    if (!product) return;
    setCurrentSlide(
      (prev) => (prev - 1 + product.colors.length) % product.colors.length
    );
  };

  return (
    <RootLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Marketplace</h1>

          {/* Search bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Color Palette Filters */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Your Color Palette</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className={cn(
                "border-2",
                selectedColor === null && "border-indigo-600"
              )}
              onClick={() => setSelectedColor(null)}
            >
              All Colors
            </Button>
            {userColorPalette.map((color) => (
              <Button
                key={color.id}
                variant="outline"
                className={cn(
                  "border-2",
                  selectedColor === color.id && "border-indigo-600"
                )}
                onClick={() => setSelectedColor(color.id)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: color.rgb }}
                />
                {color.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Brand Filters and Order By */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button
              variant="outline"
              className={cn(
                "rounded-full border-2",
                activeBrandId === null && "bg-gray-100 border-primary"
              )}
              onClick={() => setActiveBrandId(null)}
            >
              All Items
            </Button>
            {brands.map((brand) => (
              <Button
                key={brand.id}
                variant="outline"
                className={cn(
                  "rounded-full border-2",
                  activeBrandId === brand.id && "bg-gray-100 border-primary"
                )}
                onClick={() => setActiveBrandId(brand.id)}
              >
                {brand.name}
              </Button>
            ))}
          </div>

          <Select
            value={orderBy}
            onValueChange={(
              value: "default" | "euclidean_distance" | "price"
            ) => setOrderBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Order by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="euclidean_distance">Color Match</SelectItem>
              <SelectItem value="price">Price (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Product Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              // Determine which color variant to show first
              let primaryColor = product.colors[0];
              if (
                orderBy === "euclidean_distance" &&
                product.colors.length > 0
              ) {
                // Sort by euclidean_distance and take the best match
                primaryColor = [...product.colors].sort(
                  (a, b) => a.euclidean_distance - b.euclidean_distance
                )[0];
              }
              // Note: For price and default, we keep the original order

              return (
                <Card
                  key={`${product.id}-${
                    primaryColor?.color_id || "default"
                  }-${index}`}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`${product.product_url}`}>
                    <div className="aspect-[3/4] relative">
                      {primaryColor?.image_url && (
                        <img
                          src={primaryColor.image_url}
                          alt={product.description}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-slate-900">
                        {product.description}
                      </h3>
                      <p className="text-slate-600">${product.price}</p>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          {primaryColor && (
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
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Expand Button */}
                  {product.colors?.length > 1 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleExpand(product.id);
                      }}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Show {product.colors.length - 1} More Colors
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {getPageNumbers(currentPage, totalPages).map((page, index) =>
                typeof page === "number" ? (
                  <Button
                    key={index}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={index} className="px-2 self-center">
                    ...
                  </span>
                )
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
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
                  {filteredProducts
                    .find((p) => p.id === openModal)
                    ?.colors.map((color, index) => (
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
                                  filteredProducts.find(
                                    (p) => p.id === openModal
                                  )?.description
                                }
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-slate-900">
                              {
                                filteredProducts.find((p) => p.id === openModal)
                                  ?.description
                              }
                            </h3>
                            <p className="text-slate-600">
                              $
                              {
                                filteredProducts.find((p) => p.id === openModal)
                                  ?.price
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
                    {filteredProducts
                      .find((p) => p.id === openModal)
                      ?.colors.map((_, index) => (
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

export default Marketplace;
