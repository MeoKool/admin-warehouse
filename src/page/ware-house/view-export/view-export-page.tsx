"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Loader2,
  Package,
  Calendar,
  Filter,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportRequestDetail } from "./components/export-request-detail";

// Interface cho dữ liệu chi tiết sản phẩm
interface ProductDetail {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  createdBy: string;
  createdDate: string;
  availableStock: number;
  price: number;
  images: string[];
}

// Interface cho chi tiết yêu cầu xuất
interface RequestExportDetail {
  requestExportDetailId: number;
  productId: number;
  requestedQuantity: number;
  productDetail?: ProductDetail; // Thêm thông tin chi tiết sản phẩm
}

// Interface cho yêu cầu xuất
interface RequestExport {
  requestExportId: number;
  orderId: string;
  requestedBy: number;
  approvedBy: number;
  status: string;
  approvedDate: string;
  note: string;
  requestExportDetails: RequestExportDetail[];
}

export default function ViewExportPage() {
  const [exportRequests, setExportRequests] = useState<RequestExport[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestExport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestExport | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [productCache, setProductCache] = useState<Map<number, ProductDetail>>(
    new Map()
  );

  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "https://minhlong.mlhr.org";

  // Fetch export requests
  useEffect(() => {
    fetchExportRequests();
  }, []);

  const fetchExportRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}RequestExport/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        // Lưu dữ liệu gốc
        setExportRequests(response.data);
        setFilteredRequests(response.data);

        // Lấy danh sách tất cả productId để fetch thông tin sản phẩm
        const productIds = new Set<number>();
        response.data.forEach((request) => {
          request.requestExportDetails.forEach(
            (detail: RequestExportDetail) => {
              productIds.add(detail.productId);
            }
          );
        });

        // Fetch thông tin sản phẩm cho tất cả productId
        await fetchProductDetails(Array.from(productIds));
      } else {
        toast.error("Dữ liệu không hợp lệ");
        setExportRequests([]);
        setFilteredRequests([]);
      }
    } catch (error) {
      console.error("Error fetching export requests:", error);
      toast.error("Không thể tải danh sách yêu cầu xuất kho");
      setExportRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product details for all product IDs
  const fetchProductDetails = async (productIds: number[]) => {
    const newProductCache = new Map(productCache);

    // Chỉ fetch những sản phẩm chưa có trong cache
    const idsToFetch = productIds.filter((id) => !newProductCache.has(id));

    if (idsToFetch.length === 0) return;

    try {
      // Fetch thông tin sản phẩm song song
      const promises = idsToFetch.map(async (productId) => {
        try {
          const response = await axios.get(`${API_URL}product/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return { id: productId, data: response.data };
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return { id: productId, data: null };
        }
      });

      const results = await Promise.all(promises);

      // Cập nhật cache với kết quả
      results.forEach((result) => {
        if (result.data) {
          newProductCache.set(result.id, result.data);
        }
      });

      setProductCache(newProductCache);

      // Cập nhật thông tin sản phẩm vào danh sách yêu cầu
      setExportRequests((prevRequests) => {
        return prevRequests.map((request) => {
          const updatedDetails = request.requestExportDetails.map((detail) => {
            return {
              ...detail,
              productDetail: newProductCache.get(detail.productId),
            };
          });
          return {
            ...request,
            requestExportDetails: updatedDetails,
          };
        });
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Filter export requests based on search term and status
  useEffect(() => {
    const filtered = exportRequests.filter((req) => {
      const matchesSearch =
        req.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestExportId.toString().includes(searchTerm) ||
        req.requestExportDetails.some(
          (detail) =>
            detail.productDetail?.productName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            detail.productDetail?.productCode
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        req.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesTab =
        activeTab === "all" ||
        req.status.toLowerCase() === activeTab.toLowerCase();

      return matchesSearch && matchesStatus && matchesTab;
    });

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, activeTab, exportRequests, productCache]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error parsing date:", error);
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Hoàn thành
        </Badge>
      );
    } else if (statusLower === "processing") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Chờ xử lý
        </Badge>
      );
    } else if (statusLower === "cancelled") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Đã hủy
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          {status}
        </Badge>
      );
    }
  };

  // Get total quantity for a request
  const getTotalQuantity = (request: RequestExport) => {
    return request.requestExportDetails.reduce(
      (sum, detail) => sum + detail.requestedQuantity,
      0
    );
  };

  // View request details
  const handleViewDetail = (request: RequestExport) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  // Get product names for display in table
  const getProductNames = (request: RequestExport) => {
    return request.requestExportDetails
      .map((detail) => {
        const productName =
          detail.productDetail?.productName || `Sản phẩm ${detail.productId}`;
        return `${productName} (${detail.requestedQuantity})`;
      })
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Yêu cầu xuất kho</h2>
        <p className="text-muted-foreground">
          Xem danh sách các yêu cầu xuất kho từ đại lý
        </p>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="all">Tất cả yêu cầu</TabsTrigger>
          <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách yêu cầu xuất kho</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo mã đơn, sản phẩm..."
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
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Mã YC</TableHead>
                      <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">Ngày duyệt</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3">Đang tải...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          Không tìm thấy yêu cầu xuất kho nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.requestExportId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                              {request.requestExportId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-xs font-mono">
                                {request.orderId.substring(0, 8)}...
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span
                                className="truncate max-w-[250px]"
                                title={getProductNames(request)}
                              >
                                {getProductNames(request)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {formatDate(request.approvedDate)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              {getTotalQuantity(request).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(request)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {filteredRequests.length} / {exportRequests.length} yêu
                cầu
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Các tab khác tương tự như tab "all" nhưng đã được lọc theo trạng thái */}
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đang xử lý</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu xuất kho đang được xử lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Mã YC</TableHead>
                      <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">Ngày duyệt</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3">Đang tải...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests
                        .filter(
                          (req) => req.status.toLowerCase() === "processing"
                        )
                        .map((request) => (
                          <TableRow key={request.requestExportId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.requestExportId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-xs font-mono">
                                  {request.orderId.substring(0, 8)}...
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span
                                  className="truncate max-w-[250px]"
                                  title={getProductNames(request)}
                                >
                                  {getProductNames(request)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(request.approvedDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                {getTotalQuantity(request).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(request)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu hoàn thành</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu xuất kho đã hoàn thành
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Mã YC</TableHead>
                      <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">Ngày duyệt</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3">Đang tải...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests
                        .filter(
                          (req) => req.status.toLowerCase() === "completed"
                        )
                        .map((request) => (
                          <TableRow key={request.requestExportId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.requestExportId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-xs font-mono">
                                  {request.orderId.substring(0, 8)}...
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span
                                  className="truncate max-w-[250px]"
                                  title={getProductNames(request)}
                                >
                                  {getProductNames(request)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(request.approvedDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                {getTotalQuantity(request).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(request)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đã hủy</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu xuất kho đã bị hủy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Mã YC</TableHead>
                      <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-center">Ngày duyệt</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3">Đang tải...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests
                        .filter(
                          (req) => req.status.toLowerCase() === "cancelled"
                        )
                        .map((request) => (
                          <TableRow key={request.requestExportId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.requestExportId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-xs font-mono">
                                  {request.orderId.substring(0, 8)}...
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span
                                  className="truncate max-w-[250px]"
                                  title={getProductNames(request)}
                                >
                                  {getProductNames(request)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(request.approvedDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                {getTotalQuantity(request).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(request)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for viewing export request details */}
      {selectedRequest && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Chi tiết yêu cầu xuất kho</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết yêu cầu xuất kho #
                {selectedRequest.requestExportId}
              </DialogDescription>
            </DialogHeader>
            <ExportRequestDetail
              request={selectedRequest}
              productCache={productCache}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
