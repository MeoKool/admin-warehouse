import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import type { Product } from "@/types/inventory";
import { toast } from "sonner";
import { useDebounce } from "@/components/hooks/use-debounce";
import { fetchProducts } from "@/lib/inventory-api";

interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch all products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (debouncedSearchTerm.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.productName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        product.productCode
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [debouncedSearchTerm, products]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleProductClick = (product: Product) => {
    setSearchTerm(product.productName);
    setShowSuggestions(false);
    onProductSelect(product);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredProducts([]);
  };

  return (
    <div className="relative" ref={suggestionsRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Nhập tên hoặc mã sản phẩm..."
            className="pl-9 pr-10"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchTerm && (
            <button
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          disabled={isLoading || !searchTerm.trim()}
          onClick={() => {
            const product = products.find(
              (p) =>
                p.productName.toLowerCase() === searchTerm.toLowerCase() ||
                p.productCode.toLowerCase() === searchTerm.toLowerCase()
            );
            if (product) {
              handleProductClick(product);
            } else if (filteredProducts.length > 0) {
              handleProductClick(filteredProducts[0]);
            } else {
              toast.error("Không tìm thấy sản phẩm phù hợp");
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </>
          )}
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredProducts.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {filteredProducts.map((product) => (
              <li
                key={product.productId}
                className="px-4 py-2 hover:bg-muted cursor-pointer flex items-start"
                onClick={() => handleProductClick(product)}
              >
                <div>
                  <div className="font-medium">{product.productName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>Mã: {product.productCode}</span>
                    <span>•</span>
                    <span>Đơn vị: {product.unit}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
