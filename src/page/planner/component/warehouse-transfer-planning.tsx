import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Warehouse } from "lucide-react";
import { toast } from "sonner";
import type { WarehouseTransfer, WarehouseInfo } from "@/types/warehouse";
import { submitWarehousePlanning } from "@/lib/api";

interface WarehouseTransferPlanningProps {
  transfer: WarehouseTransfer;
  warehouses: WarehouseInfo[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WarehouseTransferPlanning({
  transfer,
  warehouses,
  isOpen,
  onClose,
  onSuccess,
}: WarehouseTransferPlanningProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get warehouse name by ID
  const getWarehouseName = (id: number) => {
    const warehouse = warehouses.find((w) => w.warehouseId === id);
    return warehouse ? warehouse.warehouseName : `Kho ${id}`;
  };

  // Handle submit planning
  const handleSubmit = async () => {
    if (!selectedWarehouse) {
      toast.error("Vui lòng chọn kho điều phối");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWarehousePlanning(
        transfer.id,
        Number.parseInt(selectedWarehouse)
      );
      toast.success("Đã phân phối yêu cầu chuyển kho thành công");
      onSuccess();
    } catch (error) {
      console.error("Error submitting warehouse planning:", error);
      toast.error("Không thể phân phối yêu cầu chuyển kho");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] sm:w-full">
        <DialogHeader>
          <DialogTitle>Điều phối kho</DialogTitle>
          <DialogDescription>
            Chọn kho điều phối cho yêu cầu #{transfer.requestCode}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Thông tin yêu cầu</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Mã yêu cầu:</p>
                <p className="font-medium">{transfer.requestCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mã đơn hàng:</p>
                <p className="font-medium">{transfer.orderCode}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div>
                <p className="text-muted-foreground">Kho nguồn:</p>
                <p className="font-medium">
                  {getWarehouseName(transfer.sourceWarehouseId)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Kho đích:</p>
                <p className="font-medium">
                  {getWarehouseName(transfer.destinationWarehouseId)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label htmlFor="warehouse-select" className="text-sm font-medium">
              Chọn kho điều phối
            </label>
            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
            >
              <SelectTrigger id="warehouse-select">
                <SelectValue placeholder="Chọn kho điều phối" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem
                    key={warehouse.warehouseId}
                    value={warehouse.warehouseId.toString()}
                  >
                    {warehouse.warehouseName} - {warehouse.fullAddress}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Lưu ý quan trọng
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  Việc điều phối kho sẽ ảnh hưởng đến quá trình vận chuyển và
                  giao nhận hàng hóa. Vui lòng kiểm tra kỹ thông tin trước khi
                  xác nhận.
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!selectedWarehouse || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Warehouse className="h-4 w-4 mr-2" />
                Xác nhận điều phối
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
