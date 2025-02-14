"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Search, User, ShoppingCart } from "lucide-react";
import { get } from "@/app/util";
import { useState, useEffect } from "react";
import RootLayout from "@/components/rootlayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ColorPalette {
  id: number;
  name: string;
  color_array: string;
  rgb: string;
}

interface Product {
  id: number;
  description: string;
  brand: { id: number; name: string };
  price: number;
  image: string;
  product_url: string;
  colors: { image_url: string }[];
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

  // Function to get color palette from localStorage
  const getColorPalette = () => {
    // const storedColors = localStorage.getItem("colorPalette");
    // if (storedColors) {
    //   const parsedColors = JSON.parse(storedColors).map(
    //     (color: [number, string, string]) => {
    //       const rgbArray = color.code
    //         .replace(/\[|\]/g, "") // Remove brackets
    //         .split(" ") // Split into individual values
    //         .map(Number);
    //       return {
    //         id: color[0],
    //         name: color[1],
    //         color_array: `[${rgbArray.join(",")}]`,
    //         rgb: `rgb(${rgbArray.join(",")})`,
    //       };
    //     }
    //   );
    //   setUserColorPalette(parsedColors);
    // }
    // const storedColorIds = localStorage.getItem("colorIds");
    // if (storedColorIds) {
    //   setUserColorIds(storedColorIds);
    // }
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

  // Fetch products based on color
  const fetchProductsByColor = async (colorArray: string) => {
    try {
      const route_color = `items/filter_by_color/${colorArray}/`;
      const fetchedProducts = await get(route_color);
      if (Array.isArray(fetchedProducts)) {
        return fetchedProducts;
      }
      console.error("Fetched products is not an array:", fetchedProducts);
      return [];
    } catch (error) {
      console.error("Error fetching products by color:", error);
      return [];
    }
  };

  const fetchAllProducts = async (colorArray: string) => {
    try {
      const route_color = `items/`;
      const fetchedProducts = await get(route_color);
      if (Array.isArray(fetchedProducts)) {
        return fetchedProducts;
      }
      console.error("Fetched products is not an array:", fetchedProducts);
      return [];
    } catch (error) {
      console.error("Error fetching products by color:", error);
      return [];
    }
  };

  const shuffleArray = (array: Product[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Main fetch function
  const fetchAndFilterProducts = async () => {
    console.log("Fetching products...");
    setLoading(true);
    try {
      // const allProducts: Product[] = [];
      const allProductsSet = new Set<string>(); // Use a Set to store unique product IDs
      const uniqueProducts: Product[] = []; // Array to store final unique products

      // If a specific color is selected, fetch only for that color
      if (selectedColor) {
        const colorProducts = await fetchProductsByColor(selectedColor);
        console.log("Selected color");
        console.log(selectedColor);
        for (const colorProduct of colorProducts) {
          if (!allProductsSet.has(colorProduct.id)) {
            allProductsSet.add(colorProduct.id);
            uniqueProducts.push(colorProduct);
          }
        }
      } else {
        // Fetch products for all colors in palette
        console.log(userColorIds);
        if (userColorIds.length === 0) {
          console.log("No colors in palette");
          const allProducts = await fetchAllProducts("");
          for (const colorProduct of allProducts) {
            if (!allProductsSet.has(colorProduct.id)) {
              allProductsSet.add(colorProduct.id);
              uniqueProducts.push(colorProduct);
            }
          }
        } else {
          for (const color of userColorIds) {
            console.log("Color from user's palette:");
            const colorProducts = await fetchProductsByColor(color);
            for (const colorProduct of colorProducts) {
              if (!allProductsSet.has(colorProduct.id)) {
                allProductsSet.add(colorProduct.id);
                uniqueProducts.push(colorProduct);
              }
            }
          }
        }
      }

      console.log(uniqueProducts);
      console.log(activeFilter.toString());
      // Apply brand and search filters
      const shuffledProducts = shuffleArray(uniqueProducts);
      const filtered = shuffledProducts.filter((product) => {
        const matchesBrand =
          activeFilter === "all-items" ||
          product.brand.name.toString() === activeFilter.toString();
        const matchesSearch =
          !searchQuery ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBrand && matchesSearch;
      });
      console.log(filtered);
      setProducts(uniqueProducts);
      setFilteredProducts(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load color palette on mount
  useEffect(() => {
    getColorPalette();
  }, []);

  // Fetch products once the color palette is loaded
  useEffect(() => {
    // if (
    //   userPalette.length > 0 ||
    //   localStorage.getItem("colorPalette") !== null
    // ) {
    //   fetchAndFilterProducts();
    // }
    fetchAndFilterProducts();
  }, [userColorPalette, selectedColor, activeFilter, searchQuery]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) =>
              product.colors.map((color, index) => (
                <Card
                  key={`${product.id}-${index}`}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`${product.product_url}`}>
                    <div className="aspect-[3/4] relative">
                      <img
                        src={color.image_url}
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
              ))
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found matching your criteria
          </div>
        )}
      </div>
    </RootLayout>
  );
};

export default Marketplace;
