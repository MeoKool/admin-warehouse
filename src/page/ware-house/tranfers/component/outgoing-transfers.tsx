"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  FileText,
  Calendar,
  Package,
  ClipboardList,
  Download,
} from "lucide-react";
import type { WarehouseTransfer } from "@/types/warehouse";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/warehouse-utils"; // Only importing formatDate now
import { TransferDetailsDialog } from "./transfer-details-dialog";
import axios from "axios";
import { toast } from "sonner";

interface OutgoingTransfersProps {
  transfers: WarehouseTransfer[];
  isLoading: boolean;
  onRefresh?: () => void; // Optional callback to refresh data after successful import
}

export function OutgoingTransfers({
  transfers,
  isLoading,
  onRefresh,
}: OutgoingTransfersProps) {
  const [selectedTransfer, setSelectedTransfer] =
    useState<WarehouseTransfer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingTransferId, setProcessingTransferId] = useState<
    number | null
  >(null);

  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "https://minhlong.mlhr.org";

  const handleViewDetails = (transfer: WarehouseTransfer) => {
    setSelectedTransfer(transfer);
    setIsDetailsOpen(true);
  };

  const handleImportTransfer = async (transferId: number) => {
    setProcessingTransferId(transferId);
    try {
      const response = await axios.post(
        `${API_URL}WarehouseReceipt/from-transfer`,
        {
          warehouseTransferRequestId: transferId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Nhập điều phối thành công");
        // Refresh data if callback provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error("Không thể nhập điều phối");
      }
    } catch (error) {
      console.error("Error importing transfer:", error);
      toast.error("Không thể nhập điều phối. Vui lòng thử lại sau.");
    } finally {
      setProcessingTransferId(null);
    }
  };

  // Inline function to get status badge styling and label
  const getStatusBadgeInline = (status: string) => {
    const statusLower = status.toLowerCase();
    let color = "text-gray-800";
    let bgColor = "bg-gray-100";
    let hoverColor = "hover:bg-gray-200";
    let label = status;

    if (statusLower === "completed") {
      color = "text-green-800";
      bgColor = "bg-green-100";
      hoverColor = "hover:bg-green-200";
      label = "Hoàn thành";
    } else if (statusLower === "pending") {
      color = "text-yellow-800";
      bgColor = "bg-yellow-100";
      hoverColor = "hover:bg-yellow-200";
      label = "Đang chờ";
    } else if (statusLower === "approved") {
      color = "text-blue-800";
      bgColor = "bg-blue-100";
      hoverColor = "hover:bg-blue-200";
      label = "Đã phê duyệt";
    } else if (statusLower === "cancelled") {
      color = "text-red-800";
      bgColor = "bg-red-100";
      hoverColor = "hover:bg-red-200";
      label = "Đã hủy";
    }

    return (
      <Badge className={`${color} ${bgColor} ${hoverColor} transition-colors`}>
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Không có yêu cầu chuyển kho
          </h3>
          <p className="mt-2 text-center text-muted-foreground">
            Bạn chưa có yêu cầu chuyển kho nào. Tạo yêu cầu mới để bắt đầu.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort transfers by requestDate (newest first)
  const sortedTransfers = [...transfers].sort(
    (a, b) =>
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Mã yêu cầu</TableHead>
              <TableHead className="w-[150px]">Mã đơn hàng</TableHead>
              <TableHead>Kho chuyển</TableHead>
              <TableHead>Kho yêu cầu</TableHead>
              <TableHead className="text-center">Ngày yêu cầu</TableHead>
              <TableHead className="text-center">Số sản phẩm</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{transfer.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span>{transfer.requestExportId || "N/A"}</span>
                </TableCell>
                <TableCell> {transfer.sourceWarehouseName}</TableCell>
                <TableCell> {transfer.destinationWarehouseName}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(transfer.requestDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    <Package className="h-3 w-3 mr-1" />
                    {transfer.products?.length ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadgeInline(transfer.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(transfer)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>

                    {transfer.status.toLowerCase() === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => handleImportTransfer(transfer.id)}
                        disabled={processingTransferId === transfer.id}
                      >
                        {processingTransferId === transfer.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" />
                            Nhập điều phối
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTransfer && (
        <TransferDetailsDialog
          transfer={selectedTransfer}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </div>
  );
}
