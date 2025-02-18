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
} from "lucide-react";
import { get } from "@/app/util";
import { useState, useEffect } from "react";
import RootLayout from "@/components/rootlayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const fetchAndFilterProducts = async () => {
    setLoading(true);
    try {
      let response: PaginatedResponse;
      let route: string;

      // When no color is selected or "All Colors" is clicked, use the base items endpoint
      if (!selectedColor) {
        route = `items/?page=${currentPage}`;
      } else {
        route = `items/filter_by_color/${selectedColor}/?page=${currentPage}`;
      }

      response = await get(route);
      console.log(
        `Page ${currentPage} results length:`,
        response.results.length
      );

      const filtered = response.results.filter((product) => {
        const matchesBrand =
          activeFilter === "all-items" ||
          product.brand.name.toString() === activeFilter.toString();
        const matchesSearch =
          !searchQuery ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBrand && matchesSearch;
      });

      // Calculate total pages based on total count from response
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
  }, [selectedColor, activeFilter, searchQuery]);

  // Load color palette on mount
  useEffect(() => {
    getColorPalette();
  }, []);

  // Fetch products when needed
  useEffect(() => {
    fetchAndFilterProducts();
  }, [userColorPalette, selectedColor, activeFilter, searchQuery, currentPage]);

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
          <div className="flex gap-2">
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

        {/* Brand Filters */}
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className={cn(
              "rounded-full",
              activeFilter === "all-items" && "bg-gray-100"
            )}
            onClick={() => setActiveFilter("all-items")}
          >
            All Items
          </Button>
          {["J. Crew", "Uniqlo", "Basic"].map((brand) => (
            <Button
              key={brand}
              variant="ghost"
              className={cn(
                "rounded-full",
                activeFilter === brand && "bg-gray-100"
              )}
              onClick={() => setActiveFilter(brand)}
            >
              {brand}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Product Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
            {filteredProducts.map((product, productIndex) => {
              const isExpanded = expandedProducts.has(product.id);
              const extraColsNeeded = isExpanded
                ? product.colors.length - 1
                : 0;

              return (
                <div
                  key={product.id}
                  className={cn(
                    // Always take full row when expanded, regardless of number of colors
                    isExpanded ? "col-span-4" : "col-span-1",
                    "flex flex-row gap-6"
                  )}
                >
                  {/* Main Product Card */}
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow w-full">
                    <Link href={`${product.product_url}`}>
                      <div className="aspect-[3/4] relative">
                        {product.colors[0]?.image_url && (
                          <img
                            src={product.colors[0].image_url}
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
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">
                                Real Color
                              </span>
                              <div
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{
                                  backgroundColor: parseRGB(
                                    product.colors[0].real_rgb
                                  ),
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
                                  backgroundColor: parseRGB(
                                    product.colors[0].code
                                  ),
                                }}
                              />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Distance:{" "}
                              {product.colors[0].euclidean_distance.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Expand Button */}
                    {product.colors.length > 1 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={() => toggleProductExpansion(product.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show {product.colors.length - 1} More Colors
                          </>
                        )}
                      </Button>
                    )}
                  </Card>

                  {/* Expanded Color Variants */}
                  {isExpanded && (
                    <>
                      {product.colors.slice(1).map((color, index) => (
                        <Card
                          key={`${product.id}-${index + 1}`}
                          className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow w-full"
                        >
                          <Link href={`${product.product_url}`}>
                            <div className="aspect-[3/4] relative">
                              {color.image_url && (
                                <img
                                  src={color.image_url}
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
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">
                                      Real Color
                                    </span>
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-200"
                                      style={{
                                        backgroundColor: parseRGB(
                                          color.real_rgb
                                        ),
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
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Distance:{" "}
                                    {color.euclidean_distance.toFixed(2)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
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
      </div>
    </RootLayout>
  );
};

export default Marketplace;
