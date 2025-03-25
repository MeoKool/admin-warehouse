import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Loader2, Package, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

// Cập nhật interface ExportDetailProps để khớp chính xác với API
interface ExportDetailProps {
  exportData: {
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
  };
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

export function ExportDetail({ exportData }: ExportDetailProps) {
  const [isLoading, setIsLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch additional agency info if needed
  useEffect(() => {
    const fetchAgencyInfo = async () => {
      if (!exportData.agencyName) return;

      setIsLoading(true);
      try {
        // Thử lấy thông tin chi tiết của đại lý nếu API hỗ trợ
        const response = await axios.get(
          `${API_URL}agency/${exportData.agencyName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          // Handle the response data if needed
        }
      } catch (error) {
        console.error("Error fetching agency details:", error);
        // Giữ nguyên thông tin hiện tại nếu không lấy được thông tin mới
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencyInfo();
  }, [exportData.agencyName]);

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
          Hoàn thành
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "cancelled" || statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Thông tin phiếu xuất
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã phiếu xuất:</div>
                <div className="text-sm">{exportData.documentNumber}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ngày tạo:</div>
                <div className="text-sm">
                  {formatDate(exportData.documentDate)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ngày xuất:</div>
                <div className="text-sm">
                  {formatDate(exportData.exportDate)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Loại xuất:</div>
                <div className="text-sm">{exportData.exportType}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã đơn hàng:</div>
                <div className="text-sm">{exportData.orderCode}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã yêu cầu xuất:</div>
                <div className="text-sm">{exportData.requestExportId}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Kho xuất:</div>
                <div className="text-sm">Kho {exportData.warehouseId}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Trạng thái:</div>
                <div className="text-sm">
                  {getStatusBadge(exportData.status)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
          <Package className="h-4 w-4 mr-2" />
          Chi tiết sản phẩm
        </h3>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải chi tiết sản phẩm...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Mã lô</TableHead>
                  <TableHead className="text-center">Hạn sử dụng</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-center">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportData.exportWarehouseReceiptDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.productId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.productName}
                      </div>
                    </TableCell>
                    <TableCell>{item.batchNumber}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {formatDate(item.expiryDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {item.quantity.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {item.unitPrice.toLocaleString()} đ
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.totalProductAmount.toLocaleString()} đ
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-medium">
                    Tổng giá trị:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {exportData.totalAmount.toLocaleString()} đ
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Ghi chú
        </h3>
        <p className="text-sm text-muted-foreground">
          {exportData.status.toLowerCase() === "completed" ||
          exportData.status.toLowerCase() === "approved"
            ? "Hàng đã được kiểm tra chất lượng và xuất kho thành công."
            : "Phiếu xuất đang trong quá trình xử lý. Vui lòng kiểm tra lại sau."}
        </p>
      </div>
    </div>
  );
}
