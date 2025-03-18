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
import { ImportForm } from "./component/import-form";
import { ImportDetail } from "./component/import-detail";

// Mock data for import records
const mockImports = [
  {
    id: "NK001",
    date: "2023-05-10",
    batchCode: "LO123",
    quantity: 100,
    supplierName: "Công ty A",
    warehouse: "Kho Hà Nội",
    status: "completed",
    totalValue: 10000000,
  },
  {
    id: "NK002",
    date: "2023-05-11",
    batchCode: "LO124",
    quantity: 80,
    supplierName: "Công ty B",
    warehouse: "Kho Hồ Chí Minh",
    status: "processing",
    totalValue: 8000000,
  },
  {
    id: "NK003",
    date: "2023-05-12",
    batchCode: "LO125",
    quantity: 50,
    supplierName: "Công ty C",
    warehouse: "Kho Đà Nẵng",
    status: "completed",
    totalValue: 5000000,
  },
  {
    id: "NK004",
    date: "2023-05-13",
    batchCode: "LO126",
    quantity: 120,
    supplierName: "Công ty A",
    warehouse: "Kho Hà Nội",
    status: "completed",
    totalValue: 12000000,
  },
  {
    id: "NK005",
    date: "2023-05-14",
    batchCode: "LO127",
    quantity: 60,
    supplierName: "Công ty B",
    warehouse: "Kho Hồ Chí Minh",
    status: "processing",
    totalValue: 6000000,
  },
];

export default function ImportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImport, setSelectedImport] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter imports based on search term and status
  const filteredImports = mockImports.filter((imp) => {
    const matchesSearch =
      imp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || imp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (importItem: any) => {
    setSelectedImport(importItem);
    setIsDetailOpen(true);
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

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo phiếu nhập
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Tạo phiếu nhập sản phẩm</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo phiếu nhập sản phẩm mới
              </DialogDescription>
            </DialogHeader>
            <ImportForm onClose={() => {}} />
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
                      <SelectItem value="processing">Đang kiểm tra</SelectItem>
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
                    <TableHead>Mã lô hàng</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Kho nhập</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
                        Không tìm thấy phiếu nhập nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredImports.map((imp) => (
                      <TableRow key={imp.id}>
                        <TableCell className="font-medium">{imp.id}</TableCell>
                        <TableCell>{imp.date}</TableCell>
                        <TableCell>{imp.batchCode}</TableCell>
                        <TableCell>{imp.quantity}</TableCell>
                        <TableCell>{imp.supplierName}</TableCell>
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
                Hiển thị {filteredImports.length} / {mockImports.length} phiếu
                nhập
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu nhập</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết phiếu nhập {selectedImport?.id}
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
