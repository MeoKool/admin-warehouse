import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import type { PendingAccount } from "../approve-page";
import { AccountDetailDialog } from "./account-detail-dialog";
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

interface ApproveTableProps {
  accounts: PendingAccount[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

export function ApproveTable({
  accounts,
  loading,
  onApprove,
  onReject,
}: ApproveTableProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(
    null
  );

  const handleRejectClick = (account: PendingAccount) => {
    setSelectedAccount(account);
    setRejectReason("");
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      return;
    }

    if (selectedAccount) {
      onReject(selectedAccount.registerId, rejectReason);
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <div className="grid grid-cols-5 border-b py-3 px-4 text-sm font-medium text-gray-500">
        <div>Tên người dùng</div>
        <div>Email</div>
        <div>Họ tên</div>
        <div>Loại tài khoản</div>
        <div className="text-right">Thao tác</div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-500">Đang tải...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          Không có tài khoản nào đang chờ duyệt
        </div>
      ) : (
        <div className="divide-y">
          {accounts.map((account) => (
            <div
              key={account.registerId}
              className="grid grid-cols-5 items-center py-3 px-4 hover:bg-gray-50"
            >
              <div className="font-medium">{account.username}</div>
              <div className="text-gray-600">{account.email}</div>
              <div>{account.fullName}</div>
              <div>
                {account.userType === "EMPLOYEE" &&
                account.department === "SALES MANAGER" ? (
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                    Bán hàng
                  </span>
                ) : account.userType === "AGENCY" ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    Đại lý
                  </span>
                ) : account.userType === "EMPLOYEE" &&
                  account.department === "WAREHOUSE MANAGER" ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    Quản lí kho
                  </span>
                ) : null}
              </div>
              <div className="flex justify-end space-x-2">
                <AccountDetailDialog account={account}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-gray-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Chi tiết
                  </Button>
                </AccountDetailDialog>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 border-green-200"
                  onClick={() => onApprove(account.registerId)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Duyệt
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 border-red-200"
                      onClick={() => handleRejectClick(account)}
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
                        className="min-h-[100px]"
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Hủy</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleRejectSubmit}
                        disabled={!rejectReason.trim()}
                      >
                        Từ chối
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
