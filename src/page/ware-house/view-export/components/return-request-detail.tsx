import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Package, Tag } from "lucide-react";
import type { ReturnRequest } from "@/types/warehouse";

interface ReturnRequestDetailProps {
  request: ReturnRequest;
}

export function ReturnRequestDetail({ request }: ReturnRequestDetailProps) {
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
    if (statusLower === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Đã duyệt
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
    } else if (statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Đã từ chối
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

  // Calculate total quantity
  const getTotalQuantity = () => {
    return request.details.reduce(
      (sum, detail) => sum + detail.quantityReturned,
      0
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Thông tin yêu cầu trả hàng
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã yêu cầu:</div>
                <div className="text-sm font-mono text-xs">
                  {request.returnRequestId}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã đơn hàng:</div>
                <div className="text-sm font-mono text-xs">
                  {request.orderId}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ngày tạo:</div>
                <div className="text-sm">{formatDate(request.createdAt)}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Người tạo:</div>
                <div className="text-sm">{request.createdByUserName}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Trạng thái:</div>
                <div className="text-sm">{getStatusBadge(request.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Tổng số lượng:</div>
                <div className="text-sm">
                  {getTotalQuantity().toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ghi chú:</div>
                <div className="text-sm">
                  {request.note || "Không có ghi chú"}
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
          Chi tiết sản phẩm trả
        </h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã chi tiết</TableHead>
                <TableHead>Mã chi tiết đơn hàng</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Lý do trả</TableHead>
                <TableHead className="text-center">Số lượng trả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.details.map((detail) => (
                <TableRow key={detail.returnRequestDetailId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-xs font-mono">
                        {detail.returnRequestDetailId.substring(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">
                      {detail.orderDetailId.substring(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>{detail.productName}</TableCell>
                  <TableCell>{detail.reason}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                      {detail.quantityReturned.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Tổng số lượng:
                </TableCell>
                <TableCell className="text-center font-bold">
                  {getTotalQuantity().toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
