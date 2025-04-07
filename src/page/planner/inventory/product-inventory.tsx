import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import type { WarehouseInventory } from "@/types/inventory";
import { Loader2, Warehouse, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductInventoryProps {
  inventoryData: WarehouseInventory[];
  isLoading: boolean;
  productUnit: string;
}

export function ProductInventory({
  inventoryData,
  isLoading,
  productUnit,
}: ProductInventoryProps) {
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [, setMaxQuantity] = useState(0);

  useEffect(() => {
    if (inventoryData.length > 0) {
      const total = inventoryData.reduce(
        (sum, item) => sum + item.totalQuantity,
        0
      );
      const max = Math.max(...inventoryData.map((item) => item.totalQuantity));
      setTotalQuantity(total);
      setMaxQuantity(max);
    } else {
      setTotalQuantity(0);
      setMaxQuantity(0);
    }
  }, [inventoryData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Đang tải dữ liệu tồn kho...</span>
      </div>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có dữ liệu tồn kho cho sản phẩm này
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng tồn kho
                </p>
                <div className="text-2xl font-bold">
                  {totalQuantity.toLocaleString()} {productUnit}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Số kho có sản phẩm
                </p>
                <div className="text-2xl font-bold">
                  {inventoryData.length} kho
                </div>
              </div>
              <Warehouse className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mã kho</TableHead>
              <TableHead>Tên kho</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => (
              <TableRow key={item.warehouseId}>
                <TableCell className="font-medium">
                  {item.warehouseId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Warehouse className="h-4 w-4 mr-2 text-muted-foreground" />
                    {item.warehouseName}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.totalQuantity.toLocaleString()} {productUnit}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
