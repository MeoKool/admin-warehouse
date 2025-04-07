import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import type { WarehouseTransfer, WarehouseInfo } from "@/types/warehouse";
import { useMediaQuery } from "@/components/hooks/use-media-query";
import { WarehouseTransferList } from "./component/warehouse-transfer-list";
import { WarehouseTransferDetail } from "./component/warehouse-transfer-detail";
import { WarehouseTransferPlanning } from "./component/warehouse-transfer-planning";
import { fetchWarehouses, fetchWarehouseTransfers } from "@/lib/api";

export default function WarehousePlannerPage() {
  // State for data
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<
    WarehouseTransfer[]
  >([]);
  const [warehouses, setWarehouses] = useState<WarehouseInfo[]>([]);

  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for dialogs
  const [selectedTransfer, setSelectedTransfer] =
    useState<WarehouseTransfer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all required data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch data in parallel
      const [transfersData, warehousesData] = await Promise.all([
        fetchWarehouseTransfers(),
        fetchWarehouses(),
      ]);

      setTransfers(transfersData);
      setFilteredTransfers(transfersData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transfers based on search term and status
  useEffect(() => {
    const filtered = transfers.filter((transfer) => {
      // Search by request code, order code, or notes
      const matchesSearch =
        transfer.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transfer.notes &&
          transfer.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by status
      const matchesStatus =
        statusFilter === "all" ||
        transfer.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    setFilteredTransfers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, transfers]);

  // Handle view detail
  const handleViewDetail = (transfer: WarehouseTransfer) => {
    setSelectedTransfer(transfer);
    setIsDetailOpen(true);
  };

  // Handle open planning
  const handleOpenPlanning = (transfer: WarehouseTransfer) => {
    setSelectedTransfer(transfer);
    setIsPlanningOpen(true);
  };

  // Handle planning success
  const handlePlanningSuccess = () => {
    setIsPlanningOpen(false);
    loadData(); // Reload data after successful planning
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Điều phối kho
        </h2>
        <p className="text-muted-foreground text-sm">
          Quản lý và điều phối các yêu cầu chuyển kho
        </p>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-lg">
              Danh sách yêu cầu chuyển kho
            </CardTitle>

            {/* Search and filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo mã yêu cầu, đơn hàng..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Transfer list component */}
          <WarehouseTransferList
            transfers={filteredTransfers}
            warehouses={warehouses}
            isLoading={isLoading}
            isMobile={isMobile}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTransfers.length}
            onViewDetail={handleViewDetail}
            onOpenPlanning={handleOpenPlanning}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedTransfer && (
        <WarehouseTransferDetail
          transfer={selectedTransfer}
          warehouses={warehouses}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onOpenPlanning={() => {
            setIsDetailOpen(false);
            setIsPlanningOpen(true);
          }}
        />
      )}

      {/* Planning Dialog */}
      {selectedTransfer && (
        <WarehouseTransferPlanning
          transfer={selectedTransfer}
          warehouses={warehouses}
          isOpen={isPlanningOpen}
          onClose={() => setIsPlanningOpen(false)}
          onSuccess={handlePlanningSuccess}
        />
      )}
    </div>
  );
}
