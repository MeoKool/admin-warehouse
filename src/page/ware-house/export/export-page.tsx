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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  FileText,
  Printer,
  Download,
  Filter,
  Loader2,
  Package,
  Calendar,
  Building,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ExportDetail } from "./component/export-detail";
import { ExportForm } from "./component/export-form";

// Cập nhật interface ExportReceipt để khớp chính xác với API
interface ExportReceipt {
  exportWarehouseReceiptId: number;
  documentNumber: string;
  documentDate: string;
  exportDate: string;
  exportType: string;
  totalQuantity: number;
  totalAmount: number;
  requestExportId: number;
  agencyName: string;
  orderCode: number;
  status: string;
  warehouseId: number;
  exportWarehouseReceiptDetails: ExportReceiptDetail[];
}

// Interface cho chi tiết phiếu xuất
interface ExportReceiptDetail {
  exportWarehouseReceiptDetailId: number;
  exportWarehouseReceiptId: number;
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
}

export default function ExportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExport, setSelectedExport] = useState<ExportReceipt | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [exports, setExports] = useState<ExportReceipt[]>([]);
  const [isExportFormOpen, setIsExportFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const token = sessionStorage.getItem("token");
  const warehouseId = sessionStorage.getItem("warehouseId") || "8";
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch export data
  useEffect(() => {
    fetchExports();
  }, [refreshTrigger]);

  const fetchExports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}export-receipts/get-all/${warehouseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setExports(response.data);
      } else {
        // Nếu API không trả về mảng, sử dụng dữ liệu mẫu
        toast.warning("Không thể lấy dữ liệu từ API, đang sử dụng dữ liệu mẫu");
      }
    } catch (error) {
      console.error("Error fetching exports:", error);
      toast.error("Không thể tải danh sách phiếu xuất");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (statusLower === "completed" || statusLower === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Hoàn thành
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "cancelled" || statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Đã hủy
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          {status}
        </Badge>
      );
    }
  };

  // Filter exports based on search term and status
  const filteredExports = exports.filter((exp) => {
    const matchesSearch =
      exp.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.orderCode.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" &&
        (exp.status.toLowerCase() === "completed" ||
          exp.status.toLowerCase() === "approved")) ||
      (statusFilter === "pending" && exp.status.toLowerCase() === "pending");

    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (exportItem: ExportReceipt) => {
    setSelectedExport(exportItem);
    setIsDetailOpen(true);
  };

  const handleCreateExport = () => {
    // Đóng form
    setIsExportFormOpen(false);
    // Làm mới dữ liệu
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleExportApproved = () => {
    // Làm mới dữ liệu sau khi duyệt
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Xuất sản phẩm ra kho
          </h2>
          <p className="text-muted-foreground">Quản lý phiếu xuất sản phẩm</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Dialog open={isExportFormOpen} onOpenChange={setIsExportFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo phiếu xuất
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Tạo phiếu xuất sản phẩm</DialogTitle>
                <DialogDescription>
                  Điền thông tin để tạo phiếu xuất sản phẩm mới
                </DialogDescription>
              </DialogHeader>
              <ExportForm onClose={handleCreateExport} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="all">Tất cả phiếu xuất</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="pending">Đang xử lý</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách phiếu xuất</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo mã phiếu, đại lý..."
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
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                      <SelectItem value="pending">Đang xử lý</SelectItem>
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
                      <TableHead className="w-[120px]">Mã phiếu</TableHead>
                      <TableHead className="w-[120px]">Ngày xuất</TableHead>
                      <TableHead>Đại lý</TableHead>
                      <TableHead className="text-center">Mã đơn hàng</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-center">Giá trị</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3">Đang tải...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredExports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          Không tìm thấy phiếu xuất nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExports.map((exp) => (
                        <TableRow key={exp.exportWarehouseReceiptId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              {exp.documentNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {formatDate(exp.exportDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                              {exp.agencyName}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {exp.orderCode}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              {exp.totalQuantity.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {exp.totalAmount.toLocaleString()} đ
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(exp.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(exp)}
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
                Hiển thị {filteredExports.length} / {exports.length} phiếu xuất
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  In danh sách
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Xuất Excel
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu xuất đã hoàn thành</CardTitle>
              <CardDescription>
                Danh sách các phiếu xuất đã hoàn thành
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Mã phiếu</TableHead>
                      <TableHead className="w-[120px]">Ngày xuất</TableHead>
                      <TableHead>Đại lý</TableHead>
                      <TableHead className="text-center">Mã đơn hàng</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-center">Giá trị</TableHead>
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
                    ) : (
                      filteredExports
                        .filter(
                          (exp) =>
                            exp.status.toLowerCase() === "completed" ||
                            exp.status.toLowerCase() === "approved"
                        )
                        .map((exp) => (
                          <TableRow key={exp.exportWarehouseReceiptId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                {exp.documentNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(exp.exportDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                {exp.agencyName}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {exp.orderCode}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                {exp.totalQuantity.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {exp.totalAmount.toLocaleString()} đ
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(exp)}
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

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu xuất đang xử lý</CardTitle>
              <CardDescription>
                Danh sách các phiếu xuất đang trong quá trình xử lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Mã phiếu</TableHead>
                      <TableHead className="w-[120px]">Ngày xuất</TableHead>
                      <TableHead>Đại lý</TableHead>
                      <TableHead className="text-center">Mã đơn hàng</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-center">Giá trị</TableHead>
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
                    ) : (
                      filteredExports
                        .filter((exp) => exp.status.toLowerCase() === "pending")
                        .map((exp) => (
                          <TableRow key={exp.exportWarehouseReceiptId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                {exp.documentNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(exp.exportDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                {exp.agencyName}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {exp.orderCode}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                {exp.totalQuantity.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {exp.totalAmount.toLocaleString()} đ
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(exp)}
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu xuất</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết phiếu xuất {selectedExport?.documentNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedExport && (
            <ExportDetail
              exportData={selectedExport}
              onApproved={handleExportApproved}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
            <Button>
              <Printer className="mr-2 h-4 w-4" />
              In phiếu xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
