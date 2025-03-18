import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ImportDetailProps {
  importData: {
    id: string;
    date: string;
    batchCode: string;
    quantity: number;
    supplierName: string;
    warehouse: string;
    status: string;
    totalValue: number;
  };
}

// Mock data for import items
const mockItems = [
  {
    productId: "SP001",
    productName: "Sản phẩm 1",
    batchCode: "LO123",
    quantity: 40,
    unit: "Cái",
    price: 80000,
    total: 3200000,
    qualityCheck: "passed",
  },
  {
    productId: "SP002",
    productName: "Sản phẩm 2",
    batchCode: "LO123",
    quantity: 30,
    unit: "Hộp",
    price: 150000,
    total: 4500000,
    qualityCheck: "passed",
  },
  {
    productId: "SP003",
    productName: "Sản phẩm 3",
    batchCode: "LO123",
    quantity: 10,
    unit: "Thùng",
    price: 400000,
    total: 4000000,
    qualityCheck: "pending",
  },
];

export function ImportDetail({ importData }: ImportDetailProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Thông tin phiếu nhập
          </h3>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Mã phiếu nhập:</div>
              <div className="text-sm">{importData.id}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Ngày nhập:</div>
              <div className="text-sm">{importData.date}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Mã lô hàng:</div>
              <div className="text-sm">{importData.batchCode}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Kho nhập:</div>
              <div className="text-sm">{importData.warehouse}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Trạng thái:</div>
              <div className="text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    importData.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {importData.status === "completed"
                    ? "Hoàn thành"
                    : "Đang kiểm tra"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Thông tin nhà cung cấp
          </h3>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Nhà cung cấp:</div>
              <div className="text-sm">{importData.supplierName}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Số hóa đơn:</div>
              <div className="text-sm">
                HD-{Math.floor(Math.random() * 10000)}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Người giao hàng:</div>
              <div className="text-sm">Nguyễn Văn X</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Số điện thoại:</div>
              <div className="text-sm">0987654321</div>
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
              <TableHead>Thành tiền</TableHead>
              <TableHead>Kiểm tra</TableHead>
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
                <TableCell>{item.total.toLocaleString()} đ</TableCell>
                <TableCell>
                  {item.qualityCheck === "passed" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Đạt
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      Chờ kiểm tra
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} className="text-right font-medium">
                Tổng giá trị:
              </TableCell>
              <TableCell className="font-bold">
                {importData.totalValue.toLocaleString()} đ
              </TableCell>
              <TableCell></TableCell>
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
          Hàng đã được kiểm tra số lượng. Đang tiến hành kiểm tra chất lượng.
        </p>
      </div>
    </div>
  );
}
