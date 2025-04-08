"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import type { WarehouseTransfer } from "@/types/warehouse";
import {
  fetchIncomingTransfers,
  fetchOutgoingTransfers,
} from "@/lib/transfer-api";
import { OutgoingTransfers } from "./component/outgoing-transfers";
import { IncomingTransfers } from "./component/incoming-transfers";
import { CreateTransferDialog } from "./component/create-transfer-dialog";

export default function WarehouseTransfersPage() {
  const [activeTab, setActiveTab] = useState("outgoing");
  const [outgoingTransfers, setOutgoingTransfers] = useState<
    WarehouseTransfer[]
  >([]);
  const [incomingTransfers, setIncomingTransfers] = useState<
    WarehouseTransfer[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  useEffect(() => {
    // Get warehouse ID from session storage
    const storedWarehouseId = sessionStorage.getItem("warehouseId");
    if (storedWarehouseId) {
      setWarehouseId(Number.parseInt(storedWarehouseId, 10));
    } else {
      // For demo purposes, default to warehouse ID 1 if not found
      setWarehouseId(1);
      console.warn(
        "warehouseId not found in sessionStorage, using default value 1"
      );
    }
  }, []);

  useEffect(() => {
    if (warehouseId) {
      loadTransferData(warehouseId);
    }
  }, [warehouseId]);

  const loadTransferData = async (id: number) => {
    setIsLoading(true);
    try {
      const [outgoing, incoming] = await Promise.all([
        fetchOutgoingTransfers(id),
        fetchIncomingTransfers(id),
      ]);
      setOutgoingTransfers(outgoing);
      setIncomingTransfers(incoming);
    } catch (error) {
      console.error("Error loading transfer data:", error);
      toast.error("Không thể tải dữ liệu yêu cầu chuyển kho");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferCreated = () => {
    if (warehouseId) {
      loadTransferData(warehouseId);
    }
    setIsCreateDialogOpen(false);
    toast.success("Đã tạo yêu cầu chuyển kho thành công");
  };

  const handleTransferApproved = () => {
    if (warehouseId) {
      loadTransferData(warehouseId);
    }
    toast.success("Đã phê duyệt yêu cầu chuyển kho thành công");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý chuyển kho
          </h1>
          <p className="text-muted-foreground">
            Quản lý các yêu cầu chuyển kho đi và đến
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo yêu cầu chuyển kho
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Yêu cầu chuyển kho</CardTitle>
          <CardDescription>
            Xem và quản lý các yêu cầu chuyển kho đi và đến
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="outgoing"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="outgoing" className="flex items-center">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Yêu cầu chuyển đi
                {outgoingTransfers.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    {outgoingTransfers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="incoming" className="flex items-center">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Yêu cầu chuyển đến
                {incomingTransfers.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    {incomingTransfers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="outgoing" className="mt-0">
              <OutgoingTransfers
                transfers={outgoingTransfers}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="incoming" className="mt-0">
              <IncomingTransfers
                transfers={incomingTransfers}
                isLoading={isLoading}
                onApproved={handleTransferApproved}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {warehouseId && (
        <CreateTransferDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          sourceWarehouseId={warehouseId}
          onTransferCreated={handleTransferCreated}
        />
      )}
    </div>
  );
}
