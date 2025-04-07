import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Warehouse, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { Product, WarehouseInventory } from "@/types/inventory";
import { fetchProductWarehouseInventory } from "@/lib/inventory-api";
import { ProductSearch } from "../product-search";
import { ProductDetails } from "../product-details";
import { ProductInventory } from "../product-inventory";

export default function InventoryLookupPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventoryData, setInventoryData] = useState<WarehouseInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleProductSelect = async (product: Product) => {
    setSelectedProduct(product);
    setIsLoading(true);

    try {
      const data = await fetchProductWarehouseInventory(product.productId);
      setInventoryData(data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Không thể tải dữ liệu tồn kho. Vui lòng thử lại sau.");
      setInventoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center">
          <Warehouse className="mr-2 h-6 w-6" />
          Tra cứu tồn kho sản phẩm
        </h1>
        <p className="text-muted-foreground">
          Tìm kiếm sản phẩm và xem số lượng tồn kho tại các kho hàng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Tìm kiếm sản phẩm
          </CardTitle>
          <CardDescription>
            Nhập tên sản phẩm để tìm kiếm và xem thông tin tồn kho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductSearch onProductSelect={handleProductSelect} />
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          <ProductDetails product={selectedProduct} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Thông tin tồn kho
              </CardTitle>
              <CardDescription>
                Số lượng sản phẩm {selectedProduct.productName} tại các kho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductInventory
                inventoryData={inventoryData}
                isLoading={isLoading}
                productUnit={selectedProduct.unit}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
