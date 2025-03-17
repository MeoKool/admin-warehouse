import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Account } from "../accounts-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface AccountsTableProps {
  accounts: Account[];
  loading: boolean;
  onDelete: (userId: string | number) => void;
}

export function AccountsTable({
  accounts,
  loading,
  onDelete,
}: AccountsTableProps) {
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500 border-gray-300">
        Inactive
      </Badge>
    );
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "EMPLOYEE":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Staff</Badge>
        );
      case "AGENT":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Đại lý</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      onDelete(accountToDelete.userId);
      setAccountToDelete(null);
    }
  };

  return (
    <CardContent className="p-0">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-medium">Tên người dùng</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Số điện thoại</TableHead>
              <TableHead className="font-medium">Loại tài khoản</TableHead>
              <TableHead className="font-medium">Trạng thái</TableHead>
              <TableHead className="text-right font-medium">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Đang tải...</div>
                </TableCell>
              </TableRow>
            ) : !accounts || accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="text-gray-500">Không có dữ liệu</div>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.userId} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    {account.username}
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.phone}</TableCell>
                  <TableCell>{getAccountTypeBadge(account.userType)}</TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(account)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Xác nhận xóa tài khoản
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa tài khoản{" "}
                            <span className="font-bold">
                              {accountToDelete?.username}
                            </span>
                            ? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
