"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  FileText,
  Printer,
  Download,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ImportForm } from "./component/import-form";
import { ImportDetail } from "./component/import-detail";

// Cập nhật interface ImportReceipt để thêm trường warehouse
interface ImportReceipt {
  id: string;
  documentNumber: string;
  date: string;
  importType: string;
  supplier: string;
  warehouse: string;
  status: string;
  totalValue: number;
  totalItems: number;
  warehouseId?: number;
  isApproval?: boolean;
}

export default function ImportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImport, setSelectedImport] = useState<ImportReceipt | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [imports, setImports] = useState<ImportReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const token = sessionStorage.getItem("token");
  const warehouseId = sessionStorage.getItem("warehouseId");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch imports
  useEffect(() => {
    const fetchImports = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}WarehouseReceipt/by-warehouse/${warehouseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        // Trong hàm fetchImports, đảm bảo rằng trường warehouse được thiết lập đúng
        const formattedData = Array.isArray(data)
          ? data.map((item) => ({
              id: item.warehouseReceiptId?.toString() || "",
              documentNumber: item.documentNumber,
              date: new Date(item.documentDate || item.dateImport)
                .toISOString()
                .split("T")[0],
              importType: item.importType,
              supplier: item.supplier,
              warehouse: "Kho " + (item.warehouseId || ""),
              warehouseId: item.warehouseId,
              isApproval: item.isApproval,
              status: item.isApproval ? "completed" : "pending",
              totalValue: item.totalPrice || 0,
              totalItems: item.batches?.length || 0,
            }))
          : [];

        setImports(formattedData);
      } catch (error) {
        console.error("Error fetching imports:", error);
        toast.error("Không thể tải danh sách phiếu nhập");
        // Fallback to empty array
        setImports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImports();
  }, [isImportDialogOpen, API_URL, token, warehouseId]); // Refetch when dialog closes

  // Filter imports based on search term and status
  const filteredImports = imports.filter((imp) => {
    const matchesSearch =
      imp.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || imp.status === statusFilter;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "completed" && imp.isApproval === true) ||
      (activeTab === "processing" && imp.isApproval === false);

    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleViewDetail = (importItem: ImportReceipt) => {
    setSelectedImport(importItem);
    setIsDetailOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Nhập sản phẩm vào kho
          </h2>
          <p className="text-muted-foreground">
            Quản lý phiếu nhập sản phẩm và kiểm tra chất lượng
          </p>
        </div>

        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo phiếu nhập
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1200px]">
            <DialogHeader>
              <DialogTitle>Tạo phiếu nhập sản phẩm</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo phiếu nhập sản phẩm mới
              </DialogDescription>
            </DialogHeader>
            <ImportForm onClose={handleCloseImportDialog} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="all">Tất cả phiếu nhập</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="processing">Đang kiểm tra</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách phiếu nhập</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo mã phiếu, nhà cung cấp..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="true">Đã hoàn thành</SelectItem>
                      <SelectItem value="pending">Đang kiểm tra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Loại nhập</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Kho nhập</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-3">Đang tải...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredImports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        Không tìm thấy phiếu nhập nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredImports.map((imp) => (
                      <TableRow key={imp.id}>
                        <TableCell className="font-medium">
                          {imp.documentNumber}
                        </TableCell>
                        <TableCell>{imp.date}</TableCell>
                        <TableCell>{imp.importType}</TableCell>
                        <TableCell>{imp.supplier}</TableCell>
                        <TableCell>{imp.warehouse}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              imp.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {imp.status === "completed"
                              ? "Hoàn thành"
                              : "Đang kiểm tra"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {imp.totalValue.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(imp)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {filteredImports.length} / {imports.length} phiếu nhập
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  In danh sách
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Xuất Excel
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu nhập đã hoàn thành</CardTitle>
              <CardDescription>
                Danh sách các phiếu nhập đã hoàn thành kiểm tra chất lượng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar table but filtered for completed imports */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Loại nhập</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Kho nhập</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-3">Đang tải...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredImports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Không tìm thấy phiếu nhập nào đã hoàn thành
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredImports.map((imp) => (
                      <TableRow key={imp.id}>
                        <TableCell className="font-medium">
                          {imp.documentNumber}
                        </TableCell>
                        <TableCell>{imp.date}</TableCell>
                        <TableCell>{imp.importType}</TableCell>
                        <TableCell>{imp.supplier}</TableCell>
                        <TableCell>{imp.warehouse}</TableCell>
                        <TableCell>
                          {imp.totalValue.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(imp)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu nhập đang kiểm tra</CardTitle>
              <CardDescription>
                Danh sách các phiếu nhập đang trong quá trình kiểm tra chất
                lượng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar table but filtered for processing imports */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Loại nhập</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Kho nhập</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-3">Đang tải...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredImports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Không tìm thấy phiếu nhập nào đang kiểm tra
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredImports.map((imp) => (
                      <TableRow key={imp.id}>
                        <TableCell className="font-medium">
                          {imp.documentNumber}
                        </TableCell>
                        <TableCell>{imp.date}</TableCell>
                        <TableCell>{imp.importType}</TableCell>
                        <TableCell>{imp.supplier}</TableCell>
                        <TableCell>{imp.warehouse}</TableCell>
                        <TableCell>
                          {imp.totalValue.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(imp)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu nhập</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết phiếu nhập {selectedImport?.documentNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedImport && <ImportDetail importData={selectedImport} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
            <Button>
              <Printer className="mr-2 h-4 w-4" />
              In phiếu nhập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
