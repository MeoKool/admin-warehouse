import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/inventory";
import { Package, Tag, Info, Clipboard, Archive } from "lucide-react";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product image */}
          <div className="flex justify-center md:justify-start">
            {product.images && product.images.length > 0 ? (
              <div className="relative h-48 w-48 rounded-md overflow-hidden border">
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.productName}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-48 w-48 rounded-md border flex items-center justify-center bg-muted">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{product.productName}</h2>
                <Badge variant="outline" className="ml-2">
                  {product.unit}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Tag className="h-4 w-4 mr-1" />
                <span>Mã sản phẩm: {product.productCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium flex items-center">
                  <Archive className="h-4 w-4 mr-1" />
                  Tổng tồn kho
                </div>
                <div className="text-2xl font-bold">
                  {product.availableStock.toLocaleString()} {product.unit}
                </div>
              </div>

              {product.price > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Giá</div>
                  <div className="text-xl font-semibold">
                    {product.price.toLocaleString()} VNĐ
                  </div>
                </div>
              )}
            </div>

            {product.description && (
              <div className="space-y-1">
                <div className="text-sm font-medium flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Mô tả
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-sm font-medium flex items-center">
                <Clipboard className="h-4 w-4 mr-1" />
                Thông tin khác
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Hạn sử dụng mặc định:
                  </span>
                  <span>{product.defaultExpiration} ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
