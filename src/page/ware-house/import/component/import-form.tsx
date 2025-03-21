"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import {
  DialogFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import axios from "axios";

// Định nghĩa các interface
interface Product {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  availableStock: number;
  images: string[];
}

interface ImportItem {
  productId: number;
  productName: string;
  productCode: string;
  unit: string;
  quantity: number;
  unitCost: number;
  DateOfManufacture: string;
  total: number;
}

interface ImportFormProps {
  onClose: () => void;
}

// Các loại đơn vị được phép
const ALLOWED_UNITS = ["Chai", "Bao"];

// Các loại nhập kho
const IMPORT_TYPES = [
  "Nhập Sản Xuất",
  "Nhập Mua Hàng",
  "Nhập Trả Hàng",
  "Nhập Kiểm Kê",
  "Nhập Khác",
];

export function ImportForm({ onClose }: ImportFormProps) {
  const [formData, setFormData] = useState({
    documentNumber: `IMP-${format(new Date(), "yyyyMMdd")}-001`,
    importDate: new Date().toISOString().split("T")[0],
    warehouseId: "",
    importType: "Nhập Sản Xuất",
    supplier: "",
    note: "",
  });

  const [items, setItems] = useState<ImportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  const token = sessionStorage.getItem("token");
  const warehouseId = sessionStorage.getItem("warehouseId");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Set warehouse ID from session storage
  useEffect(() => {
    if (warehouseId) {
      setFormData((prev) => ({
        ...prev,
        warehouseId: warehouseId,
      }));
    }
  }, [warehouseId]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await axios.get(`${API_URL}product`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setProducts(Array.isArray(response.data) ? response.data : []);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Không thể tải danh sách sản phẩm");
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [API_URL, token]);

  // Focus search input when product selector opens
  useEffect(() => {
    if (isProductSelectorOpen) {
      // Sử dụng setTimeout để đảm bảo DOM đã được cập nhật
      setTimeout(() => {
        const searchInput = document.getElementById("product-search");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }, [isProductSelectorOpen]);

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
        productId: 0,
        productName: "",
        productCode: "",
        unit: "",
        quantity: 1,
        unitCost: 0,
        DateOfManufacture: format(new Date(), "yyyy-MM-dd"),
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // If quantity or unitCost changed, update total
          if (field === "quantity" || field === "unitCost") {
            // Giới hạn giá trị tổng để tránh tràn số
            updatedItem.total = Math.min(
              updatedItem.quantity * updatedItem.unitCost,
              999999999999
            );
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const selectProduct = (productId: number) => {
    if (activeItemIndex === null) return;

    const product = products.find((p) => p.productId === productId);
    if (product) {
      setItems((prev) =>
        prev.map((item, i) => {
          if (i === activeItemIndex) {
            return {
              ...item,
              productId: product.productId,
              productName: product.productName,
              productCode: product.productCode,
              unit: product.unit,
              total: item.quantity * item.unitCost,
            };
          }
          return item;
        })
      );
      setIsProductSelectorOpen(false);
      setSearchTerm("");
    }
  };

  const openProductSelector = (index: number) => {
    setActiveItemIndex(index);
    setIsProductSelectorOpen(true);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.warehouseId || !formData.supplier || items.length === 0) {
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

    setIsLoading(true);
    try {
      // Prepare data for API
      const importData = {
        documentNumber: formData.documentNumber,
        warehouseId: Number.parseInt(formData.warehouseId),
        importType: formData.importType,
        supplier: formData.supplier,
        note: formData.note,
        batches: items.map((item) => ({
          productId: item.productId,
          unit: item.unit,
          quantity: item.quantity,
          unitCost: item.unitCost,
          DateOfManufacture: item.DateOfManufacture,
        })),
      };

      // Call API to create import
      const response = await axios.post(
        `${API_URL}WarehouseReceipt/create`,
        importData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Tạo phiếu nhập thành công");
        onClose();
      } else {
        throw new Error("Failed to create import");
      }
    } catch (error) {
      console.error("Error creating import:", error);
      toast.error("Không thể tạo phiếu nhập");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts =
    searchTerm.trim() === ""
      ? products
      : products.filter(
          (product) =>
            product.productName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="documentNumber">
            Mã phiếu nhập <span className="text-red-500">*</span>
          </Label>
          <Input
            id="documentNumber"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="importDate">
            Ngày nhập <span className="text-red-500">*</span>
          </Label>
          <Input
            id="importDate"
            name="importDate"
            type="date"
            value={formData.importDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="importType">
            Loại nhập <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.importType}
            onValueChange={(value) => handleSelectChange("importType", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại nhập" />
            </SelectTrigger>
            <SelectContent>
              {IMPORT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">
            Nhà cung cấp <span className="text-red-500">*</span>
          </Label>
          <Input
            id="supplier"
            name="supplier"
            placeholder="Nhập tên nhà cung cấp"
            value={formData.supplier}
            onChange={handleInputChange}
            required
          />
        </div>
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
                <TableHead>Đơn vị</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Ngày sản xuất</TableHead>
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
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isLoadingProducts}
                        onClick={() => openProductSelector(index)}
                      >
                        {isLoadingProducts ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                            <span>Đang tải...</span>
                          </div>
                        ) : item.productName ? (
                          <div className="flex flex-col">
                            <span>{item.productName}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.productCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Chọn sản phẩm
                          </span>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.unit}
                        onValueChange={(value) =>
                          updateItem(index, "unit", value)
                        }
                        disabled={!item.productId}
                      >
                        <SelectTrigger className="w-[100px]" disabled>
                          <SelectValue placeholder="Đơn vị" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALLOWED_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => {
                          // Giới hạn giá trị tối đa để tránh tràn
                          const value = Math.min(
                            Number.parseInt(e.target.value) || 0,
                            999999999
                          );
                          updateItem(index, "unitCost", value);
                        }}
                        className="w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={item.DateOfManufacture}
                        onChange={(e) =>
                          updateItem(index, "DateOfManufacture", e.target.value)
                        }
                        className="w-[140px]"
                      />
                    </TableCell>
                    <TableCell
                      className="max-w-[120px] truncate"
                      title={`${item.total.toLocaleString()} đ`}
                    >
                      {item.total.toLocaleString()} đ
                    </TableCell>
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
                  <TableCell
                    className="font-bold max-w-[120px] truncate"
                    title={`${calculateTotal().toLocaleString()} đ`}
                  >
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

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang lưu...
            </>
          ) : (
            "Tạo phiếu nhập"
          )}
        </Button>
      </DialogFooter>

      {/* Dialog cho chọn sản phẩm */}
      <Dialog
        open={isProductSelectorOpen}
        onOpenChange={setIsProductSelectorOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="product-search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                  <span>Đang tải danh sách sản phẩm...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "Không tìm thấy sản phẩm phù hợp"
                    : "Không có sản phẩm nào"}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => selectProduct(product.productId)}
                    >
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-muted-foreground flex justify-between mt-1">
                        <span>Mã: {product.productCode}</span>
                        <span>Đơn vị: {product.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProductSelectorOpen(false)}
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
