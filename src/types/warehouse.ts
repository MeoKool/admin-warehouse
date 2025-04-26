// Interface for Product Details
export interface ProductDetails {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  createdBy: string;
  createdDate: string;
  createdByName: string;
  updatedByName: string;
  availableStock: number;
  price: number;
  images: string[];
}

// Interface for Product in Transfer
export interface Product {
  productId: number;
  quantity: number;
  productName: string;
  // Removed: unit, notes, productDetails
}

// Interface for Warehouse Transfer
export interface WarehouseTransfer {
  id: number;
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  requestDate: string;
  status: string;
  notes: string;
  products: Product[];
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  requestExportId: number; // Changed from string to number
  // Removed: requestCode, orderCode
}

// Interface for Warehouse Information
export interface WarehouseInfo {
  warehouseId: number;
  warehouseName: string;
  fullAddress: string;
}

export interface TransferDetail {
  transferDetailId: number;
  transferId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}
export interface WarehouseTransfer {
  transferId: number;
  sourceWarehouseId: number;
  sourceWarehouseName: string;
  destinationWarehouseId: number;
  destinationWarehouseName: string;
  transferDate: string;
  status: string;
  createdBy: string;
  createdDate: string;
  approvedBy: string;
  approvedDate: string;
  notes: string;
  details: TransferDetail[];
}
export interface ReturnRequest {
  returnRequestId: string;
  orderId: string;
  createdAt: string;
  createdByUserName: string;
  status: string;
  note: string;
  details: ReturnRequestDetail[];
}

// Export Warehouse Receipt Types
export interface ProductDetail {
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
}

export interface ExportWarehouseReceipt {
  exportWarehouseReceiptId: number;
  documentNumber: string;
  documentDate: string;
  exportDate: string;
  exportType: "PendingTransfer" | "AvailableExport" | "ExportSale";
  totalQuantity: number;
  totalAmount: number;
  status: string;
  warehouseId: number;
  requestExportId: number;
  orderCode: string;
  agencyName: string;
  details: ProductDetail[];
}

// Return Request Types
export interface ReturnRequestDetail {
  returnRequestDetailId: string;
  orderDetailId: string;
  productName: string;
  reason: string;
  quantityReturned: number;
}
