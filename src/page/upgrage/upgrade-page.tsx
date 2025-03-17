import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { accountService } from "@/lib/api";
import { ArrowUpCircle, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Agent {
  id: string;
  username: string;
  email: string;
  fullName: string;
  agentLevel: 2; // Only level 2 agents are eligible for upgrade
  status: "active";
  createdAt: string;
  performance: {
    salesVolume: number;
    customerRating: number;
    monthsActive: number;
  };
}

export default function UpgradePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const fetchEligibleAgents = async () => {
    setLoading(true);
    try {
      const response = await accountService.getUpgradeEligibleAgents({
        page,
        limit: 10,
      });
      setAgents(response.data.agents);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching eligible agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleAgents();
  }, [page]);

  const handleUpgrade = async (id: string) => {
    try {
      await accountService.upgradeAgentLevel(id);
      toast({
        title: "Thành công",
        description: "Đại lý đã được nâng cấp lên cấp 1",
      });
      fetchEligibleAgents();
    } catch (error) {
      console.error("Error upgrading agent:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chuyển cấp Đại lý</CardTitle>
        <CardDescription>
          Nâng cấp Đại lý cấp 2 lên Đại lý cấp 1
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Doanh số</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Thời gian hoạt động</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Không có đại lý nào đủ điều kiện nâng cấp
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.username}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.fullName}</TableCell>
                    <TableCell>
                      {agent.performance.salesVolume.toLocaleString()} đ
                    </TableCell>
                    <TableCell>{agent.performance.customerRating}/5</TableCell>
                    <TableCell>
                      {agent.performance.monthsActive} tháng
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mr-2">
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Chi tiết đại lý</DialogTitle>
                            <DialogDescription>
                              Thông tin chi tiết của {agent.fullName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Username:
                              </span>
                              <span className="col-span-3">
                                {agent.username}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Email:
                              </span>
                              <span className="col-span-3">{agent.email}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Họ tên:
                              </span>
                              <span className="col-span-3">
                                {agent.fullName}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Cấp hiện tại:
                              </span>
                              <span className="col-span-3">
                                <Badge className="bg-blue-500">
                                  Đại lý cấp 2
                                </Badge>
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Doanh số:
                              </span>
                              <span className="col-span-3">
                                {agent.performance.salesVolume.toLocaleString()}{" "}
                                đ
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Đánh giá:
                              </span>
                              <span className="col-span-3">
                                {agent.performance.customerRating}/5
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Thời gian:
                              </span>
                              <span className="col-span-3">
                                {agent.performance.monthsActive} tháng
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleUpgrade(agent.id)}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Nâng cấp
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}
