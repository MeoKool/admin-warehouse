import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface InventoryItem {
  warehouseProductId: number;
  productId: number;
  productName: string;
  warehouseId: number;
  batchId: number;
  batchCode: string;
  expirationDate: string;
  quantity: number;
  status: string;
}

interface ProductSummary {
  productId: number;
  productName: string;
  totalQuantity: number;
  batches: number;
  nearExpiry: number;
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [productSummaries, setProductSummaries] = useState<ProductSummary[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const token = sessionStorage.getItem("token");
  const warehouseId = sessionStorage.getItem("warehouseId") || "8";
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}${warehouseId}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setInventoryItems(response.data);
          setFilteredItems(response.data);
          generateProductSummaries(response.data);
        } else {
          setInventoryItems([]);
          setFilteredItems([]);
          setProductSummaries([]);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast.error("Không thể tải dữ liệu kho hàng");
        setInventoryItems([]);
        setFilteredItems([]);
        setProductSummaries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [API_URL, token, warehouseId]);

  // Generate product summaries
  const generateProductSummaries = (items: InventoryItem[]) => {
    const productMap = new Map<number, ProductSummary>();

    // Group by product
    items.forEach((item) => {
      const existingProduct = productMap.get(item.productId);

      // Check if product is near expiry (within 3 months)
      const expiryDate = new Date(item.expirationDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      const isNearExpiry = expiryDate <= threeMonthsFromNow;

      if (existingProduct) {
        existingProduct.totalQuantity += item.quantity;
        existingProduct.batches += 1;
        if (isNearExpiry) {
          existingProduct.nearExpiry += 1;
        }
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: item.quantity,
          batches: 1,
          nearExpiry: isNearExpiry ? 1 : 0,
        });
      }
    });

    setProductSummaries(Array.from(productMap.values()));
  };

  // Filter inventory items based on search term and status
  useEffect(() => {
    const filtered = inventoryItems.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && item.status === "PENDING") ||
        (statusFilter === "calculating" &&
          item.status === "CALCULATING_PRICE") ||
        (statusFilter === "active" && item.status === "ACTIVE") ||
        (statusFilter === "empty" && item.status === "");

      return matchesSearch && matchesStatus;
    });

    setFilteredItems(filtered);
  }, [searchTerm, statusFilter, inventoryItems]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error formatting date:", error);

      return "N/A";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Chờ xử lý
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-400"
          >
            Đã tính giá
          </Badge>
        );
      case "CALCULATING_PRICE":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Đang tính giá
          </Badge>
        );

      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Mới
          </Badge>
        );
    }
  };

  // Check if a product is near expiry (within 3 months)
  const isNearExpiry = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kho hàng</h2>
        <p className="text-muted-foreground">
          Quản lý tồn kho và theo dõi sản phẩm
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              {productSummaries
                .reduce((sum, product) => sum + product.totalQuantity, 0)
                .toLocaleString()}{" "}
              đơn vị
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lô hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                inventoryItems.filter((item) => item.status === "PENDING")
                  .length
              }
              lô đang chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                inventoryItems.filter((item) =>
                  isNearExpiry(item.expirationDate)
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Lô hàng sắp hết hạn trong 3 tháng tới
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách sản phẩm trong kho</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên sản phẩm, mã lô..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="calculating">Đang tính giá</SelectItem>
                  <SelectItem value="active">Đã tính giá</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            Hiển thị {filteredItems.length} / {inventoryItems.length} sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã sản phẩm</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Mã lô</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Không tìm thấy sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.warehouseProductId}>
                    <TableCell className="font-medium">
                      {item.productId}
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.batchCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {formatDate(item.expirationDate)}
                        {isNearExpiry(item.expirationDate) && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-red-50 text-red-700 border-red-200"
                          >
                            Sắp hết hạn
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
