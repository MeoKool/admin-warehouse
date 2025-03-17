import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { accountService } from "@/lib/api";
import { toast } from "sonner";
import { AccountsHeader } from "./components/accounts-header";
import { AccountsTable } from "./components/accounts-table";
import { AccountsPagination } from "./components/accounts-pagination";
import { AccountsFilter } from "./components/account-filters";

export interface Account {
  userId: string | number;
  username: string;
  email: string;
  password: string;
  type: "EMPLOYEE" | "AGENT";
  phone: string;
  status: boolean;
  userType: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState<string>("");
  const [limit, setLimit] = useState(10);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountService.getAccounts({
        page,
        limit,
      });
      setAccounts(response.data || []);
      setTotalPages(Math.ceil((response.total || 0) / limit) || 1);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Không thể tải danh sách tài khoản");
      setAccounts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, limit, accountType]);

  const handleSearch = () => {
    setPage(1);
    fetchAccounts();
  };

  const handleDelete = async (userId: string | number) => {
    try {
      await accountService.deleteAccount(userId.toString());
      toast.success("Xóa tài khoản thành công");
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Không thể xóa tài khoản");
    }
  };

  return (
    <Card className="border-none shadow-none">
      <AccountsHeader />

      <AccountsFilter
        search={search}
        setSearch={setSearch}
        accountType={accountType}
        setAccountType={setAccountType}
        onSearch={handleSearch}
      />

      <AccountsTable
        accounts={accounts}
        loading={loading}
        onDelete={handleDelete}
      />

      <AccountsPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </Card>
  );
}
