"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ClipboardList, Package, Loader2, Warehouse } from "lucide-react";
import type {
  WarehouseTransfer,
  WarehouseInfo,
  Product,
} from "@/types/warehouse";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Truck, AlertCircle, Info } from "lucide-react";
import { formatDate, getStatusInfo } from "@/utils/warehouse-utils";
import { fetchTransferDetails } from "@/lib/api";

interface WarehouseTransferDetailProps {
  transfer: WarehouseTransfer;
  warehouses: WarehouseInfo[];
  isOpen: boolean;
  onClose: () => void;
  onOpenPlanning: () => void;
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

export function WarehouseTransferDetail({
  transfer,
  warehouses,
  isOpen,
  onClose,
  onOpenPlanning,
}: WarehouseTransferDetailProps) {
  const [detailedTransfer, setDetailedTransfer] =
    useState<WarehouseTransfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && transfer) {
      loadTransferDetails();
    }
  }, [isOpen, transfer]);

  const loadTransferDetails = async () => {
    setIsLoading(true);
    try {
      const details = await fetchTransferDetails(transfer.id);
      setDetailedTransfer(details);
    } catch (error) {
      console.error("Error loading transfer details:", error);
      // Fallback to the basic transfer data
      setDetailedTransfer(transfer);
    } finally {
      setIsLoading(false);
    }
  };

  // Get warehouse name by ID
  const getWarehouseName = (id: number) => {
    const warehouse = warehouses.find((w) => w.warehouseId === id);
    return warehouse ? warehouse.warehouseName : `Kho ${id}`;
  };

  if (!detailedTransfer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu chuyển kho</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết yêu cầu chuyển kho #
            {detailedTransfer.requestCode}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">Đang tải chi tiết...</span>
          </div>
        ) : (
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
                  <p className="font-medium">{detailedTransfer.requestCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="font-medium">{detailedTransfer.orderCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kho nguồn:</p>
                  <p className="font-medium">
                    {getWarehouseName(detailedTransfer.sourceWarehouseId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kho đích:</p>
                  <p className="font-medium">
                    {getWarehouseName(detailedTransfer.destinationWarehouseId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày yêu cầu:</p>
                  <p className="font-medium">
                    {formatDate(detailedTransfer.requestDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái:</p>
                  <div>{getStatusBadge(detailedTransfer.status)}</div>
                </div>
                {detailedTransfer.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Ghi chú:</p>
                    <p className="font-medium">{detailedTransfer.notes}</p>
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
                {detailedTransfer.products.map(
                  (product: Product, index: number) => (
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
                        {product.productDetails ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Mô tả:
                              </p>
                              <p className="text-sm">
                                {product.productDetails.description ||
                                  "Không có mô tả"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Tồn kho:
                              </p>
                              <p className="text-sm font-medium">
                                {product.productDetails.availableStock}{" "}
                                {product.unit}
                              </p>
                            </div>
                            {product.notes && (
                              <div className="sm:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                  Ghi chú:
                                </p>
                                <p className="text-sm">{product.notes}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Số lượng:
                            </p>
                            <p className="text-sm font-medium">
                              {product.quantity} {product.unit}
                            </p>
                            {product.notes && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground">
                                  Ghi chú:
                                </p>
                                <p className="text-sm">{product.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="destructive" onClick={onClose}>
            Đóng
          </Button>
          {detailedTransfer.status.toLowerCase() !== "completed" && (
            <Button variant="default" onClick={onOpenPlanning}>
              <Warehouse className="h-4 w-4 mr-2" />
              Điều phối kho
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
