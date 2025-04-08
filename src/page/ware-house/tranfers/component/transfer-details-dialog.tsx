import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClipboardList, Package } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { WarehouseTransfer, Product } from "@/types/warehouse";

// Format date for display
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch (error) {
    console.log("Error parsing date:", error);
    return dateString;
  }
};

// Get status information
export const getStatusInfo = (
  status: string
): {
  color: string;
  bgColor: string;
  hoverColor: string;
  label: string;
  icon: string;
} => {
  const statusLower = status.toLowerCase();

  if (statusLower === "completed") {
    return {
      color: "text-green-800",
      bgColor: "bg-green-100",
      hoverColor: "hover:bg-green-200",
      label: "Hoàn thành",
      icon: "check-circle",
    };
  } else if (statusLower === "pending") {
    return {
      color: "text-yellow-800",
      bgColor: "bg-yellow-100",
      hoverColor: "hover:bg-yellow-200",
      label: "Đang chờ",
      icon: "clock",
    };
  } else if (statusLower === "approved") {
    return {
      color: "text-blue-800",
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-200",
      label: "Đã phê duyệt",
      icon: "truck",
    };
  } else if (statusLower === "planned") {
    return {
      color: "text-blue-800",
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-200",
      label: "Đã điều phối",
      icon: "alert-circle",
    };
  } else {
    return {
      color: "text-gray-800",
      bgColor: "bg-gray-100",
      hoverColor: "hover:bg-gray-200",
      label: status,
      icon: "info",
    };
  }
};

// Get status badge component
export const getStatusBadge = (status: string) => {
  const { color, bgColor, hoverColor, label } = getStatusInfo(status);

  return (
    <Badge className={`${color} ${bgColor} ${hoverColor} transition-colors`}>
      {label}
    </Badge>
  );
};

interface TransferDetailsDialogProps {
  transfer: WarehouseTransfer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferDetailsDialog({
  transfer,
  open,
  onOpenChange,
}: TransferDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu chuyển kho</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết yêu cầu chuyển kho #{transfer.requestCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin yêu cầu */}
          <div>
            <h3 className="text-sm font-medium flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Thông tin yêu cầu
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã yêu cầu:</p>
                <p className="font-medium">{transfer.requestCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                <p className="font-medium">{transfer.orderCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kho chuyển đi:</p>
                <p className="font-medium">{transfer.sourceWarehouseName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kho yêu cầu:</p>
                <p className="font-medium">
                  {transfer.destinationWarehouseName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày yêu cầu:</p>
                <p className="font-medium">
                  {formatDate(transfer.requestDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái:</p>
                <div>{getStatusBadge(transfer.status)}</div>
              </div>
              {transfer.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Ghi chú:</p>
                  <p className="font-medium">{transfer.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Chi tiết sản phẩm */}
          <div>
            <h3 className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Danh sách sản phẩm
            </h3>
            <div className="mt-3 space-y-4">
              {transfer.products.map((product: Product, index: number) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">
                          {product.productDetails ? (
                            <>
                              {product.productDetails.productName} (
                              {product.productDetails.productCode})
                            </>
                          ) : (
                            <>Sản phẩm ID: {product.productId}</>
                          )}
                        </CardTitle>
                      </div>
                      <Badge variant="outline">
                        {product.quantity} {product.unit}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {product.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Ghi chú:
                        </p>
                        <p className="text-sm">{product.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
