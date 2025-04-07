import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  FileText,
  Warehouse,
  Calendar,
  Package,
} from "lucide-react";
import type { WarehouseTransfer } from "@/types/warehouse";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Truck, AlertCircle, Info } from "lucide-react";
import { formatDate, getStatusInfo } from "@/utils/warehouse-utils";

interface TransferCardProps {
  transfer: WarehouseTransfer;
  warehouseName: (id: number) => string;
  onViewDetail: () => void;
  onOpenPlanning: () => void;
}

// Add this function to render the status badge
const getStatusBadge = (status: string) => {
  const statusInfo = getStatusInfo(status);
  let Icon;

  switch (statusInfo.icon) {
    case "check-circle":
      Icon = CheckCircle;
      break;
    case "clock":
      Icon = Clock;
      break;
    case "truck":
      Icon = Truck;
      break;
    case "alert-circle":
      Icon = AlertCircle;
      break;
    default:
      Icon = Info;
  }

  return (
    <Badge
      className={`${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.hoverColor}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {statusInfo.label}
    </Badge>
  );
};

export function TransferCard({
  transfer,
  warehouseName,
  onViewDetail,
  onOpenPlanning,
}: TransferCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
              <CardTitle className="text-base">
                {transfer.requestCode}
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{transfer.orderCode}</span>
              </div>
            </CardDescription>
          </div>
          {getStatusBadge(transfer.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground text-xs">Kho nguồn:</p>
              <p className="font-medium">
                <Warehouse className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {warehouseName(transfer.sourceWarehouseId)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Kho đích:</p>
              <p className="font-medium">
                <Warehouse className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {warehouseName(transfer.destinationWarehouseId)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Ngày yêu cầu:</p>
            <p className="font-medium">
              <Calendar className="h-3 w-3 mr-1 inline text-muted-foreground" />
              {formatDate(transfer.requestDate)}
            </p>
          </div>
          {transfer.notes && (
            <div>
              <p className="text-muted-foreground text-xs">Ghi chú:</p>
              <p className="font-medium">{transfer.notes}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs">Số sản phẩm:</p>
            <p className="font-medium">
              <Package className="h-3 w-3 mr-1 inline text-muted-foreground" />
              {transfer.products.length} sản phẩm
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewDetail}
        >
          <FileText className="h-4 w-4 mr-1" />
          Chi tiết
        </Button>
        {transfer.status.toLowerCase() !== "completed" && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={onOpenPlanning}
          >
            <Warehouse className="h-4 w-4 mr-1" />
            Điều phối
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
