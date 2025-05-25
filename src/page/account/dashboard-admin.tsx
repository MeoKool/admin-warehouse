import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  PackageCheck,
  Truck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ExportedOrderData {
  month: number;
  exportedOrderCount: number;
}

interface ExportCountData {
  month: number;
  exportCount: number;
}

interface ReceiptCountData {
  month: number;
  receiptCount: number;
}

interface ChartData {
  month: string;
  exportedOrders: number;
  exports: number;
  receipts: number;
}

export default function AdminDashBoard() {
  const [exportedOrders, setExportedOrders] = useState<ExportedOrderData[]>([]);
  const [exportCounts, setExportCounts] = useState<ExportCountData[]>([]);
  const [receiptCounts, setReceiptCounts] = useState<ReceiptCountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [exportedOrdersRes, exportCountsRes, receiptCountsRes] =
          await Promise.all([
            fetch(
              "https://minhlong.mlhr.org/api/orders/dashboard/exported-orders-by-month"
            ),
            fetch(
              "https://minhlong.mlhr.org/api/WarehouseExport/dashboard/export-count-monthly-all"
            ),
            fetch(
              "https://minhlong.mlhr.org/api/warehouse-receipts/dashboard/monthly-receipt-count/all"
            ),
          ]);

        if (
          !exportedOrdersRes.ok ||
          !exportCountsRes.ok ||
          !receiptCountsRes.ok
        ) {
          throw new Error("Failed to fetch data from one or more APIs");
        }

        const [exportedOrdersData, exportCountsData, receiptCountsData] =
          await Promise.all([
            exportedOrdersRes.json(),
            exportCountsRes.json(),
            receiptCountsRes.json(),
          ]);

        setExportedOrders(exportedOrdersData);
        setExportCounts(exportCountsData);
        setReceiptCounts(receiptCountsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert month number to month name
  const getMonthName = (month: number) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return monthNames[month - 1] || `Tháng ${month}`;
  };

  // Prepare chart data
  const chartData: ChartData[] = [];
  const allMonths = new Set([
    ...exportedOrders.map((item) => item.month),
    ...exportCounts.map((item) => item.month),
    ...receiptCounts.map((item) => item.month),
  ]);

  Array.from(allMonths)
    .sort((a, b) => a - b)
    .forEach((month) => {
      const exportedOrder = exportedOrders.find((item) => item.month === month);
      const exportCount = exportCounts.find((item) => item.month === month);
      const receiptCount = receiptCounts.find((item) => item.month === month);

      chartData.push({
        month: getMonthName(month),
        exportedOrders: exportedOrder?.exportedOrderCount || 0,
        exports: exportCount?.exportCount || 0,
        receipts: receiptCount?.receiptCount || 0,
      });
    });

  // Calculate totals and trends
  const totalExportedOrders = exportedOrders.reduce(
    (sum, item) => sum + item.exportedOrderCount,
    0
  );
  const totalExports = exportCounts.reduce(
    (sum, item) => sum + item.exportCount,
    0
  );
  const totalReceipts = receiptCounts.reduce(
    (sum, item) => sum + item.receiptCount,
    0
  );

  // Calculate current month vs previous month for trends
  const currentMonth = new Date().getMonth() + 1;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;

  const currentExportedOrders =
    exportedOrders.find((item) => item.month === currentMonth)
      ?.exportedOrderCount || 0;
  const previousExportedOrders =
    exportedOrders.find((item) => item.month === previousMonth)
      ?.exportedOrderCount || 0;
  const exportedOrdersTrend =
    previousExportedOrders > 0
      ? ((currentExportedOrders - previousExportedOrders) /
          previousExportedOrders) *
        100
      : 0;

  const currentExports =
    exportCounts.find((item) => item.month === currentMonth)?.exportCount || 0;
  const previousExports =
    exportCounts.find((item) => item.month === previousMonth)?.exportCount || 0;
  const exportsTrend =
    previousExports > 0
      ? ((currentExports - previousExports) / previousExports) * 100
      : 0;

  const currentReceipts =
    receiptCounts.find((item) => item.month === currentMonth)?.receiptCount ||
    0;
  const previousReceipts =
    receiptCounts.find((item) => item.month === previousMonth)?.receiptCount ||
    0;
  const receiptsTrend =
    previousReceipts > 0
      ? ((currentReceipts - previousReceipts) / previousReceipts) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng đơn hàng xuất
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExportedOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {exportedOrdersTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(exportedOrdersTrend).toFixed(1)}% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng lần xuất kho
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExports.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {exportsTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(exportsTrend).toFixed(1)}% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng lần nhập kho
            </CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReceipts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {receiptsTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(receiptsTrend).toFixed(1)}% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hiệu suất xuất/nhập
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReceipts > 0
                ? ((totalExports / totalReceipts) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Tỷ lệ xuất/nhập kho</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ hoạt động xuất nhập kho</CardTitle>
            <CardDescription>
              Thống kê đơn hàng xuất, xuất kho và nhập kho theo tháng
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="exportedOrders"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Đơn hàng xuất"
                />
                <Line
                  type="monotone"
                  dataKey="exports"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Lần xuất kho"
                />
                <Line
                  type="monotone"
                  dataKey="receipts"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Lần nhập kho"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>So sánh xuất/nhập theo tháng</CardTitle>
            <CardDescription>
              Biểu đồ cột so sánh hoạt động xuất và nhập kho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="exports" fill="#82ca9d" name="Xuất kho" />
                <Bar dataKey="receipts" fill="#ffc658" name="Nhập kho" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê chi tiết</CardTitle>
            <CardDescription>Dữ liệu chi tiết theo từng tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {chartData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="font-medium">{data.month}</div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">
                      ĐH: {data.exportedOrders}
                    </span>
                    <span className="text-green-600">Xuất: {data.exports}</span>
                    <span className="text-yellow-600">
                      Nhập: {data.receipts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
