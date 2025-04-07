import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  FileText,
  Warehouse,
  Package,
  ClipboardList,
  Calendar,
  ArrowRight,
} from "lucide-react";
// Import the getStatusInfo function instead of getStatusBadge
import type { WarehouseTransfer, WarehouseInfo } from "@/types/warehouse";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Truck, AlertCircle, Info } from "lucide-react";
import { formatDate, getStatusInfo } from "@/utils/warehouse-utils";
import { TransferCard } from "./transfer-card";

interface WarehouseTransferListProps {
  transfers: WarehouseTransfer[];
  warehouses: WarehouseInfo[];
  isLoading: boolean;
  isMobile: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onViewDetail: (transfer: WarehouseTransfer) => void;
  onOpenPlanning: (transfer: WarehouseTransfer) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

// Add this function to render the status badge
const getStatusBadge = (status: string) => {
  const statusInfo = getStatusInfo(status);
  let Icon;

  switch (statusInfo.icon) {
    case "check-circle":
      Icon = CheckCircle;
      break;
    case "clock":
      Icon = Clock;
      break;
    case "truck":
      Icon = Truck;
      break;
    case "alert-circle":
      Icon = AlertCircle;
      break;
    default:
      Icon = Info;
  }

  return (
    <Badge
      className={`${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.hoverColor}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {statusInfo.label}
    </Badge>
  );
};

export function WarehouseTransferList({
  transfers,
  warehouses,
  isLoading,
  isMobile,
  currentPage,
  itemsPerPage,
  totalItems,
  onViewDetail,
  onOpenPlanning,
  onPageChange,
  onItemsPerPageChange,
}: WarehouseTransferListProps) {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return transfers.slice(startIndex, endIndex);
  };

  // Get warehouse name by ID
  const getWarehouseName = (id: number) => {
    const warehouse = warehouses.find((w) => w.warehouseId === id);
    return warehouse ? warehouse.warehouseName : `Kho ${id}`;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    onPageChange(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = isMobile ? 3 : 5;

    // Always show first page
    buttons.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate range of visible page buttons
    let startPage = Math.max(
      2,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    const endPage = Math.min(totalPages - 1, startPage + maxVisibleButtons - 3);

    if (endPage - startPage < maxVisibleButtons - 3) {
      startPage = Math.max(2, endPage - (maxVisibleButtons - 3) + 1);
    }

    // Add ellipsis if needed before visible range
    if (startPage > 2) {
      buttons.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed after visible range
    if (endPage < totalPages - 1) {
      buttons.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-4">
      {isMobile ? (
        // Mobile card view
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Đang tải...</span>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-8">
              Không tìm thấy yêu cầu chuyển kho nào
            </div>
          ) : (
            getCurrentPageItems().map((transfer) => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                warehouseName={getWarehouseName}
                onViewDetail={() => onViewDetail(transfer)}
                onOpenPlanning={() => onOpenPlanning(transfer)}
              />
            ))
          )}
        </div>
      ) : (
        // Desktop table view
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Mã yêu cầu</TableHead>
                <TableHead className="w-[150px]">Mã đơn hàng</TableHead>
                <TableHead>Kho nguồn</TableHead>
                <TableHead></TableHead>
                <TableHead>Kho đích</TableHead>
                <TableHead className="text-center">Ngày yêu cầu</TableHead>
                <TableHead className="text-center">Số sản phẩm</TableHead>
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
              ) : transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Không tìm thấy yêu cầu chuyển kho nào
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageItems().map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                        {transfer.requestCode}
                      </div>
                    </TableCell>
                    <TableCell>{transfer.orderCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Warehouse className="h-4 w-4 mr-2 text-muted-foreground" />
                        {transfer.sourceWarehouseId
                          ? getWarehouseName(transfer.sourceWarehouseId)
                          : "Chưa có"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Warehouse className="h-4 w-4 mr-2 text-muted-foreground" />
                        {transfer.destinationWarehouseId
                          ? getWarehouseName(transfer.destinationWarehouseId)
                          : "Chưa có"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(transfer.requestDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        <Package className="h-3 w-3 mr-1" />
                        {transfer.products.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(transfer.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetail(transfer)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                        {transfer.status.toLowerCase() !== "completed" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onOpenPlanning(transfer)}
                          >
                            <Warehouse className="h-4 w-4 mr-1" />
                            Điều phối
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Hiển thị</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={onItemsPerPageChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>trên {totalItems} yêu cầu</span>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {renderPaginationButtons()}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
