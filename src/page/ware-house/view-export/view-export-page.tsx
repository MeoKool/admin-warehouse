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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Loader2,
  Package,
  Calendar,
  Filter,
  ClipboardList,
  Building,
  RefreshCcw,
  FileOutput,
  ArchiveRestore,
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
import { useMediaQuery } from "@/components/hooks/use-media-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Import SignalR connection để lắng nghe sự kiện realtime
import { connection } from "@/lib/signalr-client";
import { useNavigate } from "react-router-dom";

// ------------------
// Interfaces
// ------------------
interface ProductDetail {
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
}

interface ExportWarehouseReceipt {
  exportWarehouseReceiptId: number;
  documentNumber: string;
  documentDate: string;
  exportDate: string;
  exportType: "PendingTransfer" | "AvailableExport" | "ExportSale";
  totalQuantity: number;
  totalAmount: number;
  status: string;
  warehouseId: number;
  requestExportId: number;
  orderCode: string;
  agencyName: string;
  details: ProductDetail[];
}

export default function ViewExportPage() {
  const [exportReceipts, setExportReceipts] = useState<
    ExportWarehouseReceipt[]
  >([]);
  const [filteredReceipts, setFilteredReceipts] = useState<
    ExportWarehouseReceipt[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] =
    useState<ExportWarehouseReceipt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isCreatingExport, setIsCreatingExport] = useState(false);

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "https://minhlong.mlhr.org";

  // ------------------
  // Fetch export receipts
  // ------------------
  const fetchExportReceipts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}WarehouseExport/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setExportReceipts(response.data);
        setFilteredReceipts(response.data);
      } else if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        // Handle the new response format
        setExportReceipts(response.data.data);
        setFilteredReceipts(response.data.data);
      } else {
        toast.error("Dữ liệu không hợp lệ");
        setExportReceipts([]);
        setFilteredReceipts([]);
      }
    } catch (error) {
      console.error("Error fetching export receipts:", error);
      setExportReceipts([]);
      setFilteredReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi fetch một lần khi component mount
  useEffect(() => {
    fetchExportReceipts();
  }, []);

  // ------------------
  // Auto refresh khi nhận được sự kiện từ SIGNALR
  // ------------------
  useEffect(() => {
    const handleNewExportReceipt = () => {
      fetchExportReceipts();
    };

    connection.on("ReceiveNotification", handleNewExportReceipt);
    return () => {
      connection.off("ReceiveNotification", handleNewExportReceipt);
    };
  }, []);

  // ------------------
  // Filter and paginate export receipts
  // ------------------
  useEffect(() => {
    const filtered = exportReceipts.filter((receipt) => {
      const matchesSearch =
        receipt.documentNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        receipt.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.exportWarehouseReceiptId.toString().includes(searchTerm) ||
        receipt.details.some(
          (detail) =>
            detail.productName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            detail.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        receipt.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesTab =
        activeTab === "all" ||
        receipt.status.toLowerCase() === activeTab.toLowerCase();

      return matchesSearch && matchesStatus && matchesTab;
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedReceipts = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredReceipts(paginatedReceipts);
  }, [
    searchTerm,
    statusFilter,
    activeTab,
    exportReceipts,
    currentPage,
    itemsPerPage,
  ]);

  // ------------------
  // Các hàm xử lý hiển thị
  // ------------------
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error parsing date:", error);
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Hoàn thành
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "requested") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Đang yêu cầu
        </Badge>
      );
    } else if (statusLower === "cancelled") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Đã hủy
        </Badge>
      );
    } else if (statusLower === "partially_exported") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Chưa đủ hàng
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

  const getExportTypeText = (exportType: string) => {
    switch (exportType) {
      case "PendingTransfer":
        return "Chờ chuyển kho";
      case "AvailableExport":
        return "Hàng có sẵn";
      case "ExportSale":
        return "Xuất bán hàng";
      default:
        return exportType;
    }
  };

  const getProductNames = (receipt: ExportWarehouseReceipt) => {
    return receipt.details
      .map((detail) => {
        return `${detail.productName} (${detail.quantity})`;
      })
      .join(", ");
  };

  const handleViewDetail = (receipt: ExportWarehouseReceipt) => {
    setSelectedReceipt(receipt);
    setIsDetailOpen(true);
  };

  const RequestCard = ({ receipt }: { receipt: ExportWarehouseReceipt }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
              <CardTitle className="text-base">
                PXK #{receipt.exportWarehouseReceiptId}
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="font-mono">{receipt.documentNumber}</span>
              </div>
            </CardDescription>
          </div>
          {getStatusBadge(receipt.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Sản phẩm:</p>
            <p
              className="font-medium truncate"
              title={getProductNames(receipt)}
            >
              <Package className="h-3 w-3 mr-1 inline text-muted-foreground" />
              {getProductNames(receipt)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground text-xs">Ngày xuất:</p>
              <p className="font-medium">
                <Calendar className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {formatDate(receipt.exportDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Số lượng:</p>
              <p className="font-medium">
                <Package className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {receipt.totalQuantity.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => handleViewDetail(receipt)}
        >
          <FileText className="h-4 w-4 mr-1" />
          Chi tiết
        </Button>
      </CardFooter>
    </Card>
  );

  const handleCreateExport = async () => {
    if (!selectedReceipt) return;

    setIsCreatingExport(true);
    try {
      const response = await axios.post(
        `${API_URL}WarehouseExport/finalize-export-sale/${selectedReceipt.exportWarehouseReceiptId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Đã tạo phiếu xuất kho thành công");
        setExportReceipts((prevReceipts) =>
          prevReceipts.map((req) =>
            req.exportWarehouseReceiptId ===
            selectedReceipt.exportWarehouseReceiptId
              ? { ...req, status: "PROCESSING" }
              : req
          )
        );
        setIsDetailOpen(false);
      } else {
        throw new Error("Không thể tạo phiếu xuất kho");
      }
    } catch (error: any) {
      console.error("Error creating export:", error);
      toast.error(error.response.data.message);
    } finally {
      setIsCreatingExport(false);
    }
  };

  const navigate = useNavigate();
  const handleTranfer = async () => {
    navigate("/warehouse/transfer-request");
  };
  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Phiếu xuất kho
        </h2>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-lg">
                  Danh sách phiếu xuất kho
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2">
                  <div className="relative w-full sm:w-[250px]">
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
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="pending">Đang xử lý</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="requested">Đang yêu cầu</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number.parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchExportReceipts}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Làm mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  ) : filteredReceipts.length === 0 ? (
                    <div className="text-center py-8">
                      Không tìm thấy yêu cầu xuất kho nào
                    </div>
                  ) : (
                    filteredReceipts.map((receipt) => (
                      <RequestCard
                        key={receipt.exportWarehouseReceiptId}
                        receipt={receipt}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã PXK</TableHead>
                        <TableHead className="w-[180px]">Số chứng từ</TableHead>
                        <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                        <TableHead className="w-[180px]">Tên đại lý</TableHead>
                        {!isTablet && <TableHead>Sản phẩm</TableHead>}
                        <TableHead className="text-center">Ngày xuất</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-center">
                          Trạng thái
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={isTablet ? 8 : 9}
                            className="text-center h-24"
                          >
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="ml-3">Đang tải...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredReceipts.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isTablet ? 8 : 9}
                            className="text-center h-24"
                          >
                            Không tìm thấy phiếu xuất kho nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReceipts.map((receipt) => (
                          <TableRow key={receipt.exportWarehouseReceiptId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                                {receipt.exportWarehouseReceiptId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-xs font-mono">
                                  {receipt.documentNumber}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-xs font-mono">
                                  {receipt.orderCode}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-2 text-gray-500" />
                                {receipt.agencyName}
                              </div>
                            </TableCell>
                            {!isTablet && (
                              <TableCell>
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span
                                    className="truncate max-w-[250px]"
                                    title={getProductNames(receipt)}
                                  >
                                    {getProductNames(receipt)}
                                  </span>
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(receipt.exportDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                {receipt.totalQuantity.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(receipt.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(receipt)}
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
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t px-4 sm:px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, exportReceipts.length)} /{" "}
                {exportReceipts.length} phiếu xuất
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                    </>
                  )}

                  {Array.from(
                    { length: Math.ceil(exportReceipts.length / itemsPerPage) },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(
                        Math.ceil(exportReceipts.length / itemsPerPage),
                        currentPage + 2
                      )
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {currentPage <
                    Math.ceil(exportReceipts.length / itemsPerPage) - 2 && (
                    <>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() =>
                            setCurrentPage(
                              Math.ceil(exportReceipts.length / itemsPerPage)
                            )
                          }
                          className="cursor-pointer"
                        >
                          {Math.ceil(exportReceipts.length / itemsPerPage)}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(exportReceipts.length / itemsPerPage)
                          )
                        )
                      }
                      className={
                        currentPage ===
                        Math.ceil(exportReceipts.length / itemsPerPage)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Các Tabs khác tương tự */}
        <TabsContent value="processing" className="space-y-4">
          {/* ... */}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {/* ... */}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-4">
          {/* ... */}
        </TabsContent>
      </Tabs>

      {selectedReceipt && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader>
              <DialogTitle>Chi tiết phiếu xuất kho</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết phiếu xuất kho #
                {selectedReceipt.exportWarehouseReceiptId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Thông tin phiếu xuất
                </h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loại xuất:</p>
                    <p className="font-medium">
                      {getExportTypeText(selectedReceipt.exportType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Số chứng từ:
                    </p>
                    <p className="font-mono text-xs">
                      {selectedReceipt.documentNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mã đơn hàng:
                    </p>
                    <p className="font-mono text-xs">
                      {selectedReceipt.orderCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày xuất:</p>
                    <p className="font-medium">
                      {formatDate(selectedReceipt.exportDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái:</p>
                    <div>{getStatusBadge(selectedReceipt.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng số lượng:
                    </p>
                    <p className="font-medium">
                      {selectedReceipt.totalQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng giá trị:
                    </p>
                    <p className="font-medium">
                      {selectedReceipt.totalAmount.toLocaleString()} đ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Đại lý:</p>
                    <p className="font-medium">{selectedReceipt.agencyName}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Chi tiết sản phẩm
                </h3>
                <div className="mt-3 rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã SP</TableHead>
                        <TableHead>Tên sản phẩm</TableHead>
                        <TableHead className="text-center">Lô</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReceipt.details.map((detail) => (
                        <TableRow key={detail.warehouseProductId}>
                          <TableCell className="font-medium">
                            SP{String(detail.productId).padStart(3, "0")}
                          </TableCell>
                          <TableCell>{detail.productName}</TableCell>
                          <TableCell className="text-center">
                            {detail.batchNumber}
                          </TableCell>
                          <TableCell className="text-center">
                            {detail.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.unitPrice.toLocaleString()} đ
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.totalProductAmount.toLocaleString()} đ
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Tổng giá trị:{" "}
                      {selectedReceipt.totalAmount.toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center">
              <Button
                onClick={handleTranfer}
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
              >
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Nhập điều phối
              </Button>
              <div>
                {selectedReceipt.status.toLowerCase() === "pending" && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleCreateExport}
                    disabled={isCreatingExport}
                  >
                    {isCreatingExport ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FileOutput className="h-4 w-4 mr-2" />
                        Xử lý đơn hàng
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDetailOpen(false)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
