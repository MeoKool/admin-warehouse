"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ExportFormProps {
  onClose: () => void;
}

// Mock data for products
const mockProducts = [
  { id: "SP001", name: "Sản phẩm 1", unit: "Cái", price: 100000 },
  { id: "SP002", name: "Sản phẩm 2", unit: "Hộp", price: 200000 },
  { id: "SP003", name: "Sản phẩm 3", unit: "Thùng", price: 500000 },
  { id: "SP004", name: "Sản phẩm 4", unit: "Cái", price: 150000 },
  { id: "SP005", name: "Sản phẩm 5", unit: "Hộp", price: 300000 },
];

// Mock data for warehouses
const mockWarehouses = [
  { id: "KHO001", name: "Kho Hà Nội" },
  { id: "KHO002", name: "Kho Hồ Chí Minh" },
  { id: "KHO003", name: "Kho Đà Nẵng" },
];

export function ExportForm({ onClose }: ExportFormProps) {
  const [formData, setFormData] = useState({
    orderNumber: "",
    exportDate: new Date().toISOString().split("T")[0],
    warehouseId: "",
    receiverName: "",
    receiverAddress: "",
    receiverPhone: "",
    note: "",
  });

  const [items, setItems] = useState<
    Array<{
      productId: string;
      productName: string;
      quantity: number;
      unit: string;
      price: number;
      batchCode: string;
      total: number;
    }>
  >([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        productName: "",
        quantity: 1,
        unit: "",
        price: 0,
        batchCode: "",
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // If product ID changed, update product details
          if (field === "productId" && value) {
            const product = mockProducts.find((p) => p.id === value);
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.unit = product.unit;
              updatedItem.price = product.price;
              updatedItem.total = updatedItem.quantity * product.price;
            }
          }

          // If quantity changed, update total
          if (field === "quantity") {
            updatedItem.total = updatedItem.price * value;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.orderNumber || !formData.warehouseId || items.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Check if all items have product and quantity
    const invalidItems = items.some(
      (item) => !item.productId || item.quantity <= 0
    );
    if (invalidItems) {
      toast.error("Vui lòng kiểm tra lại thông tin sản phẩm");
      return;
    }

    // Submit form data
    console.log("Form data:", { ...formData, items });
    toast.success("Tạo phiếu xuất thành công");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">
              Mã đơn hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              placeholder="Nhập mã đơn hàng"
              value={formData.orderNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exportDate">
              Ngày xuất <span className="text-red-500">*</span>
            </Label>
            <Input
              id="exportDate"
              name="exportDate"
              type="date"
              value={formData.exportDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouseId">
            Kho xuất hàng <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.warehouseId}
            onValueChange={(value) => handleSelectChange("warehouseId", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn kho xuất hàng" />
            </SelectTrigger>
            <SelectContent>
              {mockWarehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receiverName">Người nhận</Label>
            <Input
              id="receiverName"
              name="receiverName"
              placeholder="Nhập tên người nhận"
              value={formData.receiverName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiverPhone">Số điện thoại</Label>
            <Input
              id="receiverPhone"
              name="receiverPhone"
              placeholder="Nhập số điện thoại người nhận"
              value={formData.receiverPhone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiverAddress">Địa chỉ nhận hàng</Label>
          <Input
            id="receiverAddress"
            name="receiverAddress"
            placeholder="Nhập địa chỉ nhận hàng"
            value={formData.receiverAddress}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>
              Danh sách sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm sản phẩm
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Mã lô hàng</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={item.productId}
                          onValueChange={(value) =>
                            updateItem(index, "productId", value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn sản phẩm" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Mã lô"
                          value={item.batchCode}
                          onChange={(e) =>
                            updateItem(index, "batchCode", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          className="w-[80px]"
                        />
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.price.toLocaleString()} đ</TableCell>
                      <TableCell>{item.total.toLocaleString()} đ</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {items.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-medium">
                      Tổng cộng:
                    </TableCell>
                    <TableCell className="font-bold">
                      {calculateTotal().toLocaleString()} đ
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea
            id="note"
            name="note"
            placeholder="Nhập ghi chú (nếu có)"
            value={formData.note}
            onChange={handleInputChange}
            className="min-h-[80px]"
          />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">Tạo phiếu xuất</Button>
      </DialogFooter>
    </form>
  );
}
