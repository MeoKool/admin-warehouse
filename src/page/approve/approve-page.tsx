"use client";

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
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

// Updated interface to match the API response
interface PendingAccount {
  registerId: number;
  username: string;
  email: string;
  phone: string;
  userType: "EMPLOYEE" | "AGENCY";
  fullName: string;
  position: string;
  department: string;
  agencyName: string;
  street: string;
  wardName: string;
  districtName: string;
  provinceName: string;
  isApproved: boolean;
}

export default function ApprovePage() {
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPendingAccounts = async () => {
    setLoading(true);
    try {
      // Fetch from the /api/auth endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Filter accounts that are not approved (if needed)
      // In this case, we're showing all accounts since the API doesn't seem to have a specific endpoint for pending accounts
      setPendingAccounts(Array.isArray(data) ? data : [data]);
      setTotalPages(1); // Since we're getting all accounts at once
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

  const handleApprove = async (id: number) => {
    try {
      // Call your API to approve the account
      await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/auth/${id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Tài khoản đã được phê duyệt");
      fetchPendingAccounts();
    } catch (error) {
      console.error("Error approving account:", error);
      toast.error("Không thể phê duyệt tài khoản");
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      // Call your API to reject the account
      await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/auth/${id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      toast.success("Tài khoản đã bị từ chối");
      setRejectReason("");
      fetchPendingAccounts();
    } catch (error) {
      console.error("Error rejecting account:", error);
      toast.error("Không thể từ chối tài khoản");
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
                <TableHead>Loại tài khoản</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : pendingAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Không có tài khoản nào đang chờ duyệt
                  </TableCell>
                </TableRow>
              ) : (
                pendingAccounts.map((account) => (
                  <TableRow key={account.registerId}>
                    <TableCell>{account.username}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>{account.fullName}</TableCell>
                    <TableCell>
                      {account.userType === "EMPLOYEE" ? "Staff" : "Agency"}
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
                                Loại tài khoản:
                              </span>
                              <span className="col-span-3">
                                {account.userType === "EMPLOYEE"
                                  ? "Staff"
                                  : "Agency"}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Vị trí:
                              </span>
                              <span className="col-span-3">
                                {account.position}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Phòng ban:
                              </span>
                              <span className="col-span-3">
                                {account.department}
                              </span>
                            </div>
                            {account.userType === "AGENCY" && (
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                  Tên đại lý:
                                </span>
                                <span className="col-span-3">
                                  {account.agencyName}
                                </span>
                              </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="text-right font-medium">
                                Địa chỉ:
                              </span>
                              <span className="col-span-3">
                                {account.street}, {account.wardName},{" "}
                                {account.districtName}, {account.provinceName}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleApprove(account.registerId)}
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
                              onClick={() => handleReject(account.registerId)}
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
