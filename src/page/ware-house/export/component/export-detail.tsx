import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface ExportDetailProps {
  exportData: {
    id: string;
    date: string;
    batchCode: string;
    quantity: number;
    orderNumber: string;
    warehouse: string;
    status: string;
    totalValue: number;
  };
}

// Mock data for export items
const mockItems = [
  {
    productId: "SP001",
    productName: "Sản phẩm 1",
    batchCode: "LO123",
    quantity: 20,
    unit: "Cái",
    price: 100000,
    total: 2000000,
  },
  {
    productId: "SP002",
    productName: "Sản phẩm 2",
    batchCode: "LO123",
    quantity: 15,
    unit: "Hộp",
    price: 200000,
    total: 3000000,
  },
];

export function ExportDetail({ exportData }: ExportDetailProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Thông tin phiếu xuất
          </h3>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Mã phiếu xuất:</div>
              <div className="text-sm">{exportData.id}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Ngày xuất:</div>
              <div className="text-sm">{exportData.date}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Mã đơn hàng:</div>
              <div className="text-sm">{exportData.orderNumber}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Kho xuất:</div>
              <div className="text-sm">{exportData.warehouse}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Trạng thái:</div>
              <div className="text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    exportData.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {exportData.status === "completed"
                    ? "Hoàn thành"
                    : "Đang xử lý"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Thông tin người nhận
          </h3>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Người nhận:</div>
              <div className="text-sm">Nguyễn Văn A</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Số điện thoại:</div>
              <div className="text-sm">0987654321</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Địa chỉ:</div>
              <div className="text-sm">
                123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Chi tiết sản phẩm
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã SP</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Mã lô</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockItems.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>{item.productId}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.batchCode}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.price.toLocaleString()} đ</TableCell>
                <TableCell className="text-right">
                  {item.total.toLocaleString()} đ
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} className="text-right font-medium">
                Tổng giá trị:
              </TableCell>
              <TableCell className="text-right font-bold">
                {exportData.totalValue.toLocaleString()} đ
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Ghi chú
        </h3>
        <p className="text-sm text-muted-foreground">
          Hàng đã được kiểm tra chất lượng trước khi xuất kho.
        </p>
      </div>
    </div>
  );
}
