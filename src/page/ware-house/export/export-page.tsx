"use client";

import { useState } from "react";
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
import { ExportDetail } from "./component/export-detail";
import { ExportForm } from "./component/export-form";

// Mock data for export records
const mockExports = [
  {
    id: "XK001",
    date: "2023-05-15",
    batchCode: "LO123",
    quantity: 50,
    orderNumber: "DH456",
    warehouse: "Kho Hà Nội",
    status: "completed",
    totalValue: 5000000,
  },
  {
    id: "XK002",
    date: "2023-05-16",
    batchCode: "LO124",
    quantity: 30,
    orderNumber: "DH457",
    warehouse: "Kho Hồ Chí Minh",
    status: "processing",
    totalValue: 3000000,
  },
  {
    id: "XK003",
    date: "2023-05-17",
    batchCode: "LO125",
    quantity: 20,
    orderNumber: "DH458",
    warehouse: "Kho Đà Nẵng",
    status: "completed",
    totalValue: 2000000,
  },
  {
    id: "XK004",
    date: "2023-05-18",
    batchCode: "LO126",
    quantity: 40,
    orderNumber: "DH459",
    warehouse: "Kho Hà Nội",
    status: "completed",
    totalValue: 4000000,
  },
  {
    id: "XK005",
    date: "2023-05-19",
    batchCode: "LO127",
    quantity: 25,
    orderNumber: "DH460",
    warehouse: "Kho Hồ Chí Minh",
    status: "processing",
    totalValue: 2500000,
  },
];

export default function ExportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExport, setSelectedExport] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter exports based on search term and status
  const filteredExports = mockExports.filter((exp) => {
    const matchesSearch =
      exp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || exp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (exportItem: any) => {
    setSelectedExport(exportItem);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Xuất sản phẩm ra kho
          </h2>
          <p className="text-muted-foreground">Quản lý phiếu xuất sản phẩm</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo phiếu xuất
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Tạo phiếu xuất sản phẩm</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo phiếu xuất sản phẩm mới
              </DialogDescription>
            </DialogHeader>
            <ExportForm onClose={() => {}} />
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
          <TabsTrigger value="all">Tất cả phiếu xuất</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách phiếu xuất</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo mã phiếu, lô hàng..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
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
                    <TableHead>Ngày xuất</TableHead>
                    <TableHead>Mã lô hàng</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Kho xuất</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
                        Không tìm thấy phiếu xuất nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExports.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell className="font-medium">{exp.id}</TableCell>
                        <TableCell>{exp.date}</TableCell>
                        <TableCell>{exp.batchCode}</TableCell>
                        <TableCell>{exp.quantity}</TableCell>
                        <TableCell>{exp.orderNumber}</TableCell>
                        <TableCell>{exp.warehouse}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              exp.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {exp.status === "completed"
                              ? "Hoàn thành"
                              : "Đang xử lý"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {exp.totalValue.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(exp)}
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
                Hiển thị {filteredExports.length} / {mockExports.length} phiếu
                xuất
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
              <CardTitle>Phiếu xuất đã hoàn thành</CardTitle>
              <CardDescription>
                Danh sách các phiếu xuất đã hoàn thành
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar table but filtered for completed exports */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu xuất đang xử lý</CardTitle>
              <CardDescription>
                Danh sách các phiếu xuất đang trong quá trình xử lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar table but filtered for processing exports */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu xuất</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết phiếu xuất {selectedExport?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedExport && <ExportDetail exportData={selectedExport} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
            <Button>
              <Printer className="mr-2 h-4 w-4" />
              In phiếu xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
