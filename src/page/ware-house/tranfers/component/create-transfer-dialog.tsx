import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Package, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  fetchWarehouses,
  fetchProducts,
  createTransfer,
  fetchExportRequests,
} from "@/lib/transfer-api";
import type { WarehouseInfo } from "@/types/warehouse";
import type { Product } from "@/types/inventory";
import type { ExportRequest, GroupedExportRequest } from "@/types/export";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceWarehouseId: number;
  onTransferCreated: () => void;
}

interface TransferProduct {
  productId: number;
  quantity: number;
  unit: string;
  notes: string;
  productName?: string; // For display purposes
}

interface ExportRequestProduct {
  productId: number;
  productName: string;
  remainingQuantity: number;
  quantity: number; // User-selected quantity
  unit: string;
  selected: boolean;
}

export function CreateTransferDialog({
  open,
  onOpenChange,
  sourceWarehouseId,
  onTransferCreated,
}: CreateTransferDialogProps) {
  const [, setWarehouses] = useState<WarehouseInfo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [groupedExportRequests, setGroupedExportRequests] = useState<
    GroupedExportRequest[]
  >([]);
  const [selectedProducts, setSelectedProducts] = useState<TransferProduct[]>(
    []
  );
  const [exportRequestProducts, setExportRequestProducts] = useState<
    ExportRequestProduct[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [destinationWarehouseId, setDestinationWarehouseId] =
    useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  );
  const [notes, setNotes] = useState("");
  const [selectedExportRequest, setSelectedExportRequest] =
    useState<string>("none");

  useEffect(() => {
    if (open) {
      loadFormData();
      // Reset form
      setDestinationWarehouseId("");
      setDeliveryDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
      setNotes("");
      setSelectedProducts([]);
      setExportRequestProducts([]);
      setSelectedExportRequest("none");
    }
  }, [open, sourceWarehouseId]);

  // Group export requests by requestExportId and filter those with remaining quantity > 0
  useEffect(() => {
    if (exportRequests.length > 0) {
      const groupedRequests: Record<number, GroupedExportRequest> = {};

      // First, filter export requests with remaining quantity > 0
      const filteredRequests = exportRequests.filter(
        (req) => req.remainingQuantity > 0
      );

      filteredRequests.forEach((request) => {
        if (!groupedRequests[request.requestExportId]) {
          groupedRequests[request.requestExportId] = {
            requestExportId: request.requestExportId,
            orderCode: request.orderCode,
            agencyName: request.agencyName,
            products: [],
          };
        }

        groupedRequests[request.requestExportId].products.push({
          productName: request.productName,
          remainingQuantity: request.remainingQuantity,
        });
      });

      // Convert to array
      const groupedArray = Object.values(groupedRequests);

      setGroupedExportRequests(groupedArray);
    } else {
      setGroupedExportRequests([]);
    }
  }, [exportRequests]);

  // Update export request products when a request is selected
  useEffect(() => {
    if (selectedExportRequest !== "none") {
      const requestId = Number.parseInt(selectedExportRequest);
      const requestProducts = exportRequests.filter(
        (req) => req.requestExportId === requestId && req.remainingQuantity > 0
      );

      const productList: ExportRequestProduct[] = requestProducts.map((req) => {
        const product = products.find((p) => p.productId === req.productId);
        return {
          productId: req.productId,
          productName: req.productName,
          remainingQuantity: req.remainingQuantity,
          quantity: req.remainingQuantity, // Default to max available
          unit: product?.unit || "cái",
          selected: true, // Default to selected
        };
      });

      setExportRequestProducts(productList);

      // Clear manually selected products when an export request is selected
      setSelectedProducts([]);
    } else {
      setExportRequestProducts([]);
    }
  }, [selectedExportRequest, exportRequests, products]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      const [warehousesData, productsData, exportRequestsData] =
        await Promise.all([
          fetchWarehouses(),
          fetchProducts(),
          fetchExportRequests(sourceWarehouseId),
        ]);

      // Filter out the source warehouse and any warehouses without valid IDs
      const filteredWarehouses = warehousesData
        .filter((warehouse) => warehouse.warehouseId !== sourceWarehouseId)
        .filter(
          (warehouse) =>
            warehouse.warehouseId !== undefined &&
            warehouse.warehouseId !== null
        );

      // Filter out any products without valid IDs
      const filteredProducts = productsData.filter(
        (product) =>
          product.productId !== undefined && product.productId !== null
      );

      setWarehouses(filteredWarehouses);
      setProducts(filteredProducts);
      setExportRequests(exportRequestsData || []);
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      // Set default empty arrays to prevent undefined errors
      setWarehouses([]);
      setProducts([]);
      setExportRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExportProduct = (index: number) => {
    const updatedProducts = [...exportRequestProducts];
    updatedProducts[index].selected = !updatedProducts[index].selected;
    setExportRequestProducts(updatedProducts);
  };

  const handleExportProductQuantityChange = (index: number, value: string) => {
    const quantity = Number.parseInt(value);
    if (isNaN(quantity) || quantity <= 0) return;

    const updatedProducts = [...exportRequestProducts];
    const product = updatedProducts[index];

    // Ensure quantity doesn't exceed remaining quantity
    updatedProducts[index].quantity = Math.min(
      quantity,
      product.remainingQuantity
    );
    setExportRequestProducts(updatedProducts);
  };

  const handleSubmit = async () => {
    if (!deliveryDate) {
      toast.error("Vui lòng chọn ngày giao hàng dự kiến");
      return;
    }

    // Get products from either export request or manually selected
    const productsToSubmit =
      selectedExportRequest !== "none"
        ? exportRequestProducts
            .filter((p) => p.selected)
            .map((p) => ({
              productId: p.productId,
              quantity: p.quantity,
              unit: p.unit,
              notes: "",
            }))
        : selectedProducts;

    if (productsToSubmit.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm");
      return;
    }

    setIsSubmitting(true);
    try {
      const transferData = {
        destinationWarehouseId: Number.parseInt(destinationWarehouseId),
        expectedDeliveryDate: deliveryDate.toISOString(),
        notes,
        requestExportId:
          selectedExportRequest && selectedExportRequest !== "none"
            ? Number.parseInt(selectedExportRequest)
            : null,
        products: productsToSubmit,
      };

      await createTransfer(transferData);
      onTransferCreated();
    } catch (error) {
      console.error("Error creating transfer:", error);
      toast.error("Không thể tạo yêu cầu chuyển kho. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu chuyển kho</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo yêu cầu chuyển kho mới
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-warehouse">Kho nguồn</Label>
              <Input
                id="source-warehouse"
                value={`Kho ${sourceWarehouseId}`}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-request">Yêu cầu xuất kho</Label>
              <Select
                value={selectedExportRequest}
                onValueChange={setSelectedExportRequest}
                disabled={isLoading}
              >
                <SelectTrigger id="export-request">
                  <SelectValue placeholder="Chọn yêu cầu xuất kho (nếu có)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có yêu cầu</SelectItem>
                  {groupedExportRequests.map((request) => (
                    <SelectItem
                      key={request.requestExportId}
                      value={request.requestExportId.toString()}
                    >
                      Yêu cầu #{request.requestExportId} - {request.orderCode} -{" "}
                      {request.agencyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Ngày giao hàng dự kiến</Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const date = e.target.value
                    ? new Date(e.target.value)
                    : undefined;
                  setDeliveryDate(date);
                }}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú cho yêu cầu chuyển kho"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {selectedExportRequest !== "none" &&
          exportRequestProducts.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Sản phẩm còn lại trong yêu cầu
                </h3>
                <div className="space-y-2">
                  {exportRequestProducts.map((product, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Checkbox
                            id={`product-${index}`}
                            checked={product.selected}
                            onCheckedChange={() =>
                              handleToggleExportProduct(index)
                            }
                          />
                          <Label
                            htmlFor={`product-${index}`}
                            className="font-medium cursor-pointer"
                          >
                            {product.productName}
                          </Label>
                        </div>

                        <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`quantity-${index}`}
                              className="text-sm whitespace-nowrap"
                            >
                              Số lượng:
                            </Label>
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                max={product.remainingQuantity}
                                value={product.quantity}
                                onChange={(e) =>
                                  handleExportProductQuantityChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                disabled={!product.selected || isLoading}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">
                                / {product.remainingQuantity} {product.unit}
                              </span>
                            </div>
                          </div>

                          {product.quantity > product.remainingQuantity && (
                            <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                Số lượng không thể vượt quá số lượng còn lại
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Thêm sản phẩm thủ công
                </h3>
                <ManualProductSelection
                  products={products}
                  selectedProducts={selectedProducts}
                  setSelectedProducts={setSelectedProducts}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (selectedExportRequest === "none" &&
                selectedProducts.length === 0) ||
              (selectedExportRequest !== "none" &&
                exportRequestProducts.filter((p) => p.selected).length === 0)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Tạo yêu cầu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Extracted manual product selection component
function ManualProductSelection({
  products,
  selectedProducts,
  setSelectedProducts,
  isLoading,
}: {
  products: Product[];
  selectedProducts: TransferProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<TransferProduct[]>>;
  isLoading: boolean;
}) {
  const [currentProduct, setCurrentProduct] = useState<string>("");
  const [currentQuantity, setCurrentQuantity] = useState<string>("1");
  const [currentNotes, setCurrentNotes] = useState("");

  const handleAddProduct = () => {
    if (!currentProduct || Number.parseInt(currentQuantity) <= 0) {
      toast.error("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ");
      return;
    }

    const productId = Number.parseInt(currentProduct);
    const product = products.find((p) => p.productId === productId);

    if (!product) {
      toast.error("Sản phẩm không hợp lệ");
      return;
    }

    const newProduct: TransferProduct = {
      productId,
      quantity: Number.parseInt(currentQuantity),
      unit: product.unit,
      notes: currentNotes,
      productName: product.productName,
    };

    setSelectedProducts([...selectedProducts, newProduct]);

    // Reset product selection fields
    setCurrentProduct("");
    setCurrentQuantity("1");
    setCurrentNotes("");
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <Label htmlFor="product" className="sr-only">
            Sản phẩm
          </Label>
          <Select
            value={currentProduct}
            onValueChange={setCurrentProduct}
            disabled={isLoading}
          >
            <SelectTrigger id="product">
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem
                  key={product.productId}
                  value={product.productId.toString()}
                >
                  {product.productName} ({product.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity" className="sr-only">
            Số lượng
          </Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Số lượng"
            min="1"
            value={currentQuantity}
            onChange={(e) => setCurrentQuantity(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <Button
            type="button"
            onClick={handleAddProduct}
            disabled={isLoading || !currentProduct}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            Thêm
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <Input
          placeholder="Ghi chú cho sản phẩm (tùy chọn)"
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-3">Danh sách sản phẩm đã chọn</h3>
        {selectedProducts.length === 0 ? (
          <div className="text-center py-6 border rounded-md bg-muted/50">
            <Package className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Chưa có sản phẩm nào được thêm
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((product, index) => {
              const productInfo = products.find(
                (p) => p.productId === product.productId
              );
              return (
                <Card key={index}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">
                        {productInfo?.productName ||
                          `Sản phẩm ID: ${product.productId}`}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">
                          {product.quantity} {product.unit}
                        </Badge>
                        {product.notes && <span>• {product.notes}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProduct(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
