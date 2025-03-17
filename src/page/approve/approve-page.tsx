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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { accountService } from "@/lib/api";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

interface PendingAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  requestedType: "staff" | "agent";
  requestedAgentLevel?: 1 | 2;
  createdAt: string;
  documents: string[];
}

export default function ApprovePage() {
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  const fetchPendingAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountService.getPendingAccounts({
        page,
        limit: 10,
      });
      setPendingAccounts(response.data.accounts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching pending accounts:", error);
      setPendingAccounts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, [page]);

  const handleApprove = async (id: string) => {
    try {
      await accountService.approveAccount(id);
      toast("Tài khoản đã được phê duyệt");
      fetchPendingAccounts();
    } catch (error) {
      console.error("Error approving account:", error);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await accountService.rejectAccount(id, rejectReason);
      toast("Tài khoản đã bị từ chối");
      setRejectReason("");
      fetchPendingAccounts();
    } catch (error) {
      console.error("Error rejecting account:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xét duyệt Account</CardTitle>
        <CardDescription>Duyệt các tài khoản đang chờ xác nhận</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Loại yêu cầu</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : !pendingAccounts || pendingAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Không có tài khoản nào đang chờ duyệt
                  </TableCell>
                </TableRow>
              ) : (
                pendingAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.username}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>{account.fullName}</TableCell>
                    <TableCell>
                      {account.requestedType === "staff" ? (
                        <Badge className="bg-purple-500">Staff</Badge>
                      ) : account.requestedAgentLevel === 1 ? (
                        <Badge className="bg-green-500">Đại lý cấp 1</Badge>
                      ) : (
                        <Badge className="bg-blue-500">Đại lý cấp 2</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(account.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mr-2">
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Chi tiết tài khoản</DialogTitle>
                            <DialogDescription>
                              Thông tin đăng ký của {account.fullName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Username:
                              </span>
                              <span className="col-span-3">
                                {account.username}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Email:
                              </span>
                              <span className="col-span-3">
                                {account.email}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Họ tên:
                              </span>
                              <span className="col-span-3">
                                {account.fullName}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Loại yêu cầu:
                              </span>
                              <span className="col-span-3">
                                {account.requestedType === "staff"
                                  ? "Staff"
                                  : `Đại lý cấp ${account.requestedAgentLevel}`}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Tài liệu:
                              </span>
                              <div className="col-span-3">
                                {account.documents.map((doc, index) => (
                                  <a
                                    key={index}
                                    href={doc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline block"
                                  >
                                    Tài liệu {index + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleApprove(account.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Duyệt
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Từ chối tài khoản</DialogTitle>
                            <DialogDescription>
                              Vui lòng nhập lý do từ chối tài khoản này
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Textarea
                              placeholder="Lý do từ chối..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Hủy</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(account.id)}
                            >
                              Từ chối
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
